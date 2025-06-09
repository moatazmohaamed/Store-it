import { Component, inject, Input } from '@angular/core';
import { Search } from '../search/search';
import { Fileuploader } from '../fileuploader/fileuploader';
import { Auth } from '../../../core/services/auth/auth';


@Component({
  selector: 'app-header',
  imports: [Search, Fileuploader],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  auth = inject(Auth);
  @Input() currentUser!: any;


  current: any;
  async ngOnInit() {
    this.current = await this.auth.getCurrentUser();
    return this.current;
  }
  


}
