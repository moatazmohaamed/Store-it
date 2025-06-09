import {
  Component,
  inject,
  Input,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MAX_FILE_SIZE } from '../../utils/utils';
import { FileService } from '../../../core/services/file/file';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-fileuploader',
  imports: [CommonModule],
  templateUrl: './fileuploader.html',
  styleUrl: './fileuploader.scss',
})
export class Fileuploader implements OnDestroy {
  private destroy$ = new Subject<void>();
  private readonly ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'audio/mpeg',
    'audio/wav',
  ];

  constructor(private toastr: ToastrService, private cdr: ChangeDetectorRef) {}
  fileService = inject(FileService);

  @Input() currentUser!: any;

  @Input() currentPath: string = '';

  files: File[] = [];

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(droppedFiles);
  }

  onFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const selectedFiles = Array.from(target.files || []);
    this.handleFiles(selectedFiles);
  }

  handleFiles(acceptedFiles: File[]) {
    const validFiles = acceptedFiles.filter((file) => {
      if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
        this.toastr.error(`${file.name} has an unsupported file type.`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        this.toastr.error(`${file.name} is too large. Max file size is 50MB.`);
        return false;
      }
      return true;
    });

    validFiles.forEach((file) => {
      this.files.push(file);
      this.fileService
        .uploadFile(
          file,
          this.currentUser.$id,
          this.currentUser.accountId,
          this.currentPath
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (uploadedFile) => {
            if (uploadedFile) {
              this.files = this.files.filter((f) => f.name !== file.name);
              this.cdr.detectChanges();
            }
          },
          error: (error) => {
            this.toastr.error(
              `Failed to upload ${file.name}: ${error.message}`
            );
            this.files = this.files.filter((f) => f.name !== file.name);
            this.cdr.detectChanges();
          },
        });
    });
  }

  removeFile(fileName: string) {
    this.files = this.files.filter((file) => file.name !== fileName);
  }

  getFileUrl(file: File) {
    return URL.createObjectURL(file);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngonit() {}
}
