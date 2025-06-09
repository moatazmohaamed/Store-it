import { Component, Input } from '@angular/core';
import { formatDateTime } from '../../utils/utils';

@Component({
  selector: 'app-formatted-date-time',
  imports: [],
  templateUrl: './formatted-date-time.html',
  styleUrl: './formatted-date-time.scss',
})
export class FormattedDateTime {
  @Input() date: string = '';
  @Input() className?: string;

  get formattedDate(): string {
    return formatDateTime(this.date);
  }
}
