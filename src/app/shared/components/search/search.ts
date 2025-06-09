import { Component, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getFileTypesParams } from '../../utils/utils';
import { FileService } from '../../../core/services/file/file';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { EventEmitter } from 'stream';

@Component({
  selector: 'app-search',
  imports: [FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  searchText: string = '';
  router = inject(Router);
  route = inject(ActivatedRoute);

  onSearchChange(query: string): void {
    if (this.router.url.endsWith('dashboard')) return;
    this.searchText = query;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { searchText: query },
      queryParamsHandling: 'merge',
    });
  }
}
