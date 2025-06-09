import { Component, inject } from '@angular/core';
import { getFileTypesParams } from '../../shared/utils/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from '../../core/services/file/file';
import { CommonModule } from '@angular/common';
import { Card } from '../../shared/components/card/card';
import { Sort } from '../../shared/components/sort/sort';
import { Observable, Subscription } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-file-list',
  imports: [CommonModule, Card, Sort, FormsModule],
  templateUrl: './file-list.html',
  styleUrl: './file-list.scss',
})
export class FileList {
  files: any[] = [];
  totalSize: string = '0 MB';
  type: string = '';
  searchText: string = '';
  sort: string = '';
  private filesSub: Subscription | undefined;
  private totalSizeSubject = new BehaviorSubject<string>('0 MB');
  public totalSize$ = this.totalSizeSubject.asObservable();
  router = inject(Router);

  constructor(private route: ActivatedRoute, private fileService: FileService) {
    if (!this.router.url.endsWith('dashboard')) {
      this.route.queryParams.subscribe((params) => {
        const sort = params['sort'] || '$createdAt-desc';
        const searchText = params['searchText'] || '';
        this.sort = sort;
        this.searchText = searchText;
        this.fileService.getFiles({ sort, searchText }).subscribe();
      });
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.type = params.get('type') || '';
      this.fetchFiles();

      this.filesSub = this.fileService.files$.subscribe((files) => {
        const types = getFileTypesParams(this.type);
        this.files =
          types.length > 0
            ? files.filter((f) => types.includes(f.type))
            : files;

        const totalBytes = this.files.reduce(
          (sum, file) => sum + (file.size || 0),
          0
        );
        const totalSize =
          totalBytes > 0
            ? totalBytes >= 1024 * 1024
              ? (totalBytes / (1024 * 1024)).toFixed(1) + ' MB'
              : (totalBytes / 1024).toFixed(1) + ' KB'
            : '0 MB';

        this.totalSize = totalSize;
      });
    });
    this.fileService.fileUploaded$.subscribe(() => {
      this.fetchFiles();
    });
  }

  ngOnDestroy(): void {
    this.fileService.clearFiles();
    if (this.filesSub) this.filesSub.unsubscribe();
  }

  fetchFiles(): void {
    if (!this.router.url.endsWith('dashboard')) {
      const types = getFileTypesParams(this.type);
      const params = {
        types,
        searchText: this.searchText,
        sort: this.sort,
      };
      this.fileService.getFiles(params).subscribe();
      this.fileService.data.next(this.type);
    }
  }

  onFileAction() {
    this.fileService.refreshFiles();
  }
}
