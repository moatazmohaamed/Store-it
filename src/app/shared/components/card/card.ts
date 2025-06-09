import { Component, Input } from '@angular/core';
import { convertFileSize } from '../../utils/utils';
import { Thumbnail } from '../thumbnail/thumbnail';
import { Actiondropdown } from '../actiondropdown/actiondropdown';
import { RouterLink } from '@angular/router';
import { FormattedDateTime } from '../formatted-date-time/formatted-date-time';

@Component({
  selector: 'app-card',
  imports: [Thumbnail,Actiondropdown,RouterLink,FormattedDateTime],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  @Input() file: any;
  convertFileSize = convertFileSize;
} 
