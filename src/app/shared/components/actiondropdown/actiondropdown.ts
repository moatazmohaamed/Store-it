import { Component, Input } from '@angular/core';
import {
  actionsDropdownItems,
  constructDownloadUrl,
  formatDateTime,
} from '../../utils/utils';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Models } from 'appwrite';
import { FileService } from '../../../core/services/file/file';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ShareInput } from '../share-input/share-input';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';

type ActionType = {
  value: string;
  label: string;
  icon: string;
};

@Component({
  selector: 'app-actiondropdown',
  imports: [CommonModule, RouterModule, FormsModule, ShareInput],
  templateUrl: './actiondropdown.html',
  styleUrl: './actiondropdown.scss',
})
export class Actiondropdown {
  @Input() file!: any;

  isModalOpen = false;
  action: ActionType | null = null;
  nameSubject = new BehaviorSubject<string>('');
  name$ = this.nameSubject.asObservable();
  isLoading = false;
  emails: string[] = [];
  emailsInput = '';

  constructor(
    private fileService: FileService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    if (this.file && this.file.name) {
      this.nameSubject.next(this.file.name);
    } else {
      this.nameSubject.next('');
    }
  }

  closeAllModals() {
    this.isModalOpen = false;
    this.action = null;
    this.nameSubject.next(this.file.name);
    this.emails = [];
  }

  handleAction() {
    if (!this.action) return;
    this.isLoading = true;
    let observable$;

    switch (this.action.value) {
      case 'rename':
        observable$ = this.fileService.renameFile({
          fileId: this.file.$id,
          name: this.nameSubject.value,
          extension: this.file.extention,
        });
        break;
      case 'share':
        observable$ = this.fileService.updateFileUsers({
          fileId: this.file.$id,
          emails: this.emails.length ? this.emails : this.file.users,
        });
        break;
      case 'delete':
        observable$ = this.fileService.deleteFile({
          fileId: this.file.$id,
          bucketFileId: this.file.bucketFileId,
        });
        break;
      default:
        this.isLoading = false;
        return;
    }

    observable$.subscribe({
      next: (result) => {
        if (result) {
          this.closeAllModals();
        }
      },
      error: (error) => {
        console.error('Error performing action:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  handleRemoveUser(email: string) {
    const updatedEmails = this.emails.filter((e) => e !== email);
    this.fileService
      .updateFileUsers({
        fileId: this.file.$id,
        emails: updatedEmails,
      })
      .subscribe({
        next: (result) => {
          if (result) {
            this.emails = updatedEmails;
            this.closeAllModals();
          }
        },
        error: (error) => {
          console.error('Error removing user:', error);
        },
      });
  }

  getActionItems() {
    return actionsDropdownItems.map((item) => ({
      ...item,
      downloadLink:
        item.value === 'download'
          ? constructDownloadUrl(this.file.bucketFileId)
          : null,
    }));
  }

  onActionClick(actionItem: ActionType) {
    this.action = actionItem;
    if (['rename', 'share', 'delete', 'details'].includes(actionItem.value)) {
      this.isModalOpen = true;
      if (actionItem.value === 'rename' && this.file && this.file.name) {
        this.nameSubject.next(this.file.name);
      }
    }
  }

  get filteredEmails(): string[] {
    return this.emailsInput
      ? this.emailsInput
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e)
      : [];
  }

  onShareInputChange(emails: string[]) {
    this.emails = emails.filter((email) => email.trim() !== '');
  }

  getFileIcon(extOrType: string): string {
    // Map extensions/types to icon paths
    const iconMap: { [key: string]: string } = {
      pdf: 'assets/icons/file-pdf.svg',
      doc: 'assets/icons/file-doc.svg',
      docx: 'assets/icons/file-docx.svg',
      csv: 'assets/icons/file-csv.svg',
      txt: 'assets/icons/file-txt.svg',
      audio: 'assets/icons/file-audio.svg',
      video: 'assets/icons/file-video.svg',
      image: 'assets/icons/file-image.svg',
      // Add more mappings as needed
      default: 'assets/icons/file-other.svg',
    };
    const key = (extOrType || '').toLowerCase();
    return iconMap[key] || iconMap['default'];
  }

  onEmailChange(emails: string[]) {
    this.emails = emails;
  }

  onEmailRemove(email: string) {
    this.file.users = this.file.users.filter((e: any) => e !== email);
  }

  async shareFile() {
    try {
      const emailsToShare = this.emails.filter((email) => email.trim() !== '');
      await lastValueFrom(
        this.fileService.updateFileUsers({
          fileId: this.file.$id,
          emails: emailsToShare,
        })
      );
      this.toastr.success('File shared successfully');
      this.closeAllModals();
    } catch (error) {
      console.error('Error sharing file:', error);
      this.toastr.error('Failed to share file');
    }
  }
}
