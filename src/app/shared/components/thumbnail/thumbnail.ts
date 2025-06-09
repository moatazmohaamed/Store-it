import { Component, Input } from '@angular/core';
import { getFileIcon } from '../../utils/utils';

@Component({
  selector: 'app-thumbnail',
  imports: [],
  templateUrl: './thumbnail.html',
  styleUrl: './thumbnail.scss',
})
export class Thumbnail {
  @Input() type!: string;
  @Input() extension!: string;
  @Input() url: string = '';
  @Input() imageClassName?: string;
  @Input() className?: string;

  getFileIcon = getFileIcon;

  get isImage(): boolean {
    return this.type === 'image' && this.extension !== 'svg';
  }
}
