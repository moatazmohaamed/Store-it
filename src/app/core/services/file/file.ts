import { Injectable } from '@angular/core';
import { ID, Query, Models } from 'appwrite';
import {
  DeleteFileProps,
  FileDocument,
  GetFilesProps,
  RenameFileProps,
  TotalSpace,
  UpdateFileUsersProps,
} from '../../interfaces/ifile';
import { Appwrite } from '../appwrite/appwrite';
import { environment } from '../../../../environments/environment.production';
import {
  constructFileUrl,
  getFileType,
  parseStringfy,
} from '../../../shared/utils/utils';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../auth/auth';
import { Observable, from, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FileType } from '../../../shared/utils/types/types';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private filesSubject = new BehaviorSubject<any[]>([]);
  public files$ = this.filesSubject.asObservable();
  data = new BehaviorSubject<any>('');
  public fileUploaded$ = new BehaviorSubject<boolean>(false);

  private lastQuery: GetFilesProps = {};

  constructor(
    private appwrite: Appwrite,
    private toastr: ToastrService,
    private auth: Auth
  ) {}

  setLastQuery(params: GetFilesProps) {
    this.lastQuery = { ...params };
  }

  getLastQuery(): GetFilesProps {
    return { ...this.lastQuery };
  }

  clearFiles() {
    this.filesSubject.next([]);
  }

  uploadFile(
    file: File,
    ownerId: any,
    accountId: any,
    path?: string
  ): Observable<any> {
    return from(
      (async () => {
        const { storage, databases } = this.appwrite;
        try {
          const bucketFile = await storage.createFile(
            environment.BUCKET_STORAGE,
            ID.unique(),
            file
          );

          const fileDocument: FileDocument = {
            type: getFileType(file.name).type,
            name: bucketFile.name,
            extention: getFileType(bucketFile.name).extension,
            url: constructFileUrl(bucketFile.$id),
            size: bucketFile.sizeOriginal,
            owner: ownerId,
            accountId: accountId,
            users: [],
            bucketFileId: bucketFile.$id,
          };

          const newFile = await databases
            .createDocument(
              environment.DATABASE_ID,
              environment.FILES_COLLECTION,
              bucketFile.$id,
              fileDocument
            )
            .catch(async (error) => {
              await storage.deleteFile(
                environment.BUCKET_STORAGE,
                bucketFile.$id
              );
              this.toastr.error(
                `Failed to create file document: ${error.message}`
              );
            });
          if (newFile) {
            this.refreshFiles();
            this.fileUploaded$.next(true);
          }
          return newFile;
        } catch (err) {
          console.error('Error uploading file', err);
          throw err;
        }
      })()
    );
  }

  private createQueries(
    currentUser: Models.Document,
    types: string[],
    searchText: string,
    sort: string,
    limit?: number
  ): string[] {
    const queries = [
      Query.or([
        Query.equal('owner', [currentUser.$id]),
        Query.contains('users', [currentUser.$id]),
      ]),
    ];

    if (types.length > 0) queries.push(Query.equal('type', types));
    if (searchText) queries.push(Query.contains('name', searchText));
    if (limit) queries.push(Query.limit(limit));

    if (sort) {
      const [sortBy, orderBy] = sort.split('-');
      queries.push(
        orderBy === 'asc' ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)
      );
    }

    return queries;
  }

  getFiles(params: GetFilesProps = {}): Observable<any> {
    this.setLastQuery(params);
    return from(
      (async () => {
        const { databases } = await this.appwrite.createAdminClient();
        const currentUser = await this.auth.getCurrentUser();
        if (!currentUser) {
          throw new Error('User not found');
        }
        const queries = this.createQueries(
          currentUser,
          params.types || [],
          params.searchText || '',
          params.sort || '$createdAt-desc',
          params.limit
        );

        const files = await databases.listDocuments(
          environment.DATABASE_ID,
          environment.FILES_COLLECTION,
          queries
        );
        const parsedFiles = parseStringfy(files);
        let filteredFiles = parsedFiles.documents || [];
        if (params.searchText) {
          const search = params.searchText.toLowerCase();
          filteredFiles = filteredFiles.filter(
            (file: any) => file.name && file.name.toLowerCase().includes(search)
          );
        }
        this.filesSubject.next(filteredFiles);
        return filteredFiles;
      })()
    ).pipe(
      catchError((error) => {
        this.toastr.error(`Failed to fetch files`);
        return throwError(() => error);
      })
    );
  }

  refreshFiles() {
    const last = this.getLastQuery();
    this.getFiles(last).subscribe(() => {
      this.fileUploaded$.next(true);
    });
  }

  renameFile({ fileId, name, extension }: RenameFileProps): Observable<any> {
    return from(
      (async () => {
        const { databases } = await this.appwrite.createAdminClient();
        try {
          const newName = `${name}.${extension}`;
          const updatedFile = await databases.updateDocument(
            environment.DATABASE_ID,
            environment.FILES_COLLECTION,
            fileId,
            { name: newName, extention: extension }
          );
          this.refreshFiles();
          return parseStringfy(updatedFile);
        } catch (error) {
          this.toastr.error('Failed to rename file');
          throw error;
        }
      })()
    );
  }

  updateFileUsers({ fileId, emails }: UpdateFileUsersProps): Observable<any> {
    return from(
      (async () => {
        const { databases } = await this.appwrite.createAdminClient();
        try {
          const updatedFile = await databases.updateDocument(
            environment.DATABASE_ID,
            environment.FILES_COLLECTION,
            fileId,
            { users: emails }
          );
          this.refreshFiles();
          return parseStringfy(updatedFile);
        } catch (error) {
          this.toastr.error('Failed to update file users');
          throw error;
        }
      })()
    );
  }

  deleteFile({ fileId, bucketFileId }: DeleteFileProps): Observable<any> {
    return from(
      (async () => {
        const { databases, storage } = await this.appwrite.createAdminClient();
        try {
          const deletedFile = await databases.deleteDocument(
            environment.DATABASE_ID,
            environment.FILES_COLLECTION,
            fileId
          );
          if (deletedFile) {
            await storage.deleteFile(environment.BUCKET_STORAGE, bucketFileId);
            this.refreshFiles();
          }
          return parseStringfy({ status: 'success' });
        } catch (error) {
          this.toastr.error('Failed to delete file');
          throw error;
        }
      })()
    );
  }

  async getTotalSpaceUsed(): Promise<TotalSpace> {
    try {
      const { databases } = this.appwrite;
      const currentUser = await this.auth.getCurrentUser();

      if (!currentUser) {
        throw new Error('User is not authenticated.');
      }

      const files = await databases.listDocuments(
        environment.DATABASE_ID,
        environment.FILES_COLLECTION,
        [Query.equal('owner', [currentUser.$id])]
      );

      const totalSpace: TotalSpace = {
        image: { size: 0, latestDate: '' },
        document: { size: 0, latestDate: '' },
        video: { size: 0, latestDate: '' },
        audio: { size: 0, latestDate: '' },
        other: { size: 0, latestDate: '' },
        used: 0,
        all: 2 * 1024 * 1024 * 1024, // 2GB available bucket storage
      };

      files.documents.forEach((file: any) => {
        const fileType = file.type as FileType;
        totalSpace[fileType].size += file.size;
        totalSpace.used += file.size;

        if (
          !totalSpace[fileType].latestDate ||
          new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
        ) {
          totalSpace[fileType].latestDate = file.$updatedAt;
        }
      });

      return totalSpace;
    } catch (error) {
      this.toastr.error('Error calculation');
      throw error; // Re-throw the error after handling
    }
  }
}
