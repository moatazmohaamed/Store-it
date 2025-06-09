import { Component, inject, Input } from '@angular/core';
import { avatarPlaceholderUrl, navItems } from '../../utils/utils';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Fileuploader } from '../fileuploader/fileuploader';
import { Auth } from '../../../core/services/auth/auth';

@Component({
  selector: 'app-mobilenavigation',
  imports: [RouterLink, RouterLinkActive, Fileuploader],
  templateUrl: './mobilenavigation.html',
  styleUrl: './mobilenavigation.scss',
})
export class Mobilenavigation {
  auth = inject(Auth);
  @Input() fullName: string = '';
  @Input() email: string = '';
  @Input() currentUser: string = '';

  avatar = avatarPlaceholderUrl;
  isOpen: boolean = false;
  navItems = navItems;
}
