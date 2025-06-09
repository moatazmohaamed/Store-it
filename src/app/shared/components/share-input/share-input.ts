import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-share-input',
  imports: [FormsModule, CommonModule],
  templateUrl: './share-input.html',
  styleUrl: './share-input.scss',
})
export class ShareInput {
  @Input() file: { users: string[] } = { users: [] };
  @Output() inputChange = new EventEmitter<string[]>();
  @Output() remove = new EventEmitter<string>();

  emailInput = '';

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const emails = input.value.split(',').map((email) => email.trim());
    this.inputChange.emit(emails);
    this.emailInput = input.value; // keep input in sync
  }

  removeUser(email: string) {
    this.remove.emit(email);
  }
}
