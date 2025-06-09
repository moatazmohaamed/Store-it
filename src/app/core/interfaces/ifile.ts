export interface FileDocument {
  name: string;
  type: string;
  extention: any;
  url: string;
  size: number;
  owner: string;
  accountId: string;
  users: string[];
  bucketFileId: string;
}

export interface GetFilesProps {
  types?: string[];
  searchText?: string;
  sort?: string;
  limit?: number;
}

export interface RenameFileProps {
  fileId: string;
  name: string;
  extension: any;
}

export interface UpdateFileUsersProps {
  fileId: string;
  emails: string[];
}

export interface DeleteFileProps {
  fileId: string;
  bucketFileId: string;
}

export interface FileSpace {
  size: number;
  latestDate: string;
}

export interface TotalSpace {
  image: FileSpace;
  document: FileSpace;
  video: FileSpace;
  audio: FileSpace;
  other: FileSpace;
  used: number;
  all: number;
}

export interface UsageSummary {
  title: string;
  size: number;
  latestDate: string;
  icon: string;
  url: string;
}
