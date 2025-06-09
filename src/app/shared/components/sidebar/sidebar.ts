import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { avatarPlaceholderUrl, navItems } from '../../utils/utils';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  navItems = navItems;
  avatar = avatarPlaceholderUrl;
  @Input() fullName: string = '';
  @Input() email: string = '';
}
