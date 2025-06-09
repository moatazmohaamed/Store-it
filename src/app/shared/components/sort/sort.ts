import { Component, inject } from '@angular/core';
import { FormControl,  ReactiveFormsModule } from '@angular/forms';
import { sortTypes } from '../../utils/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sort',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './sort.html',
  styleUrl: './sort.scss',
})
export class Sort {
  sortControl = new FormControl(sortTypes[0].value);
  sortTypes = sortTypes;

   router = inject(Router);
   route = inject(ActivatedRoute);

  constructor() {
    if (this.router.url.endsWith('dashboard')) return;
    this.sortControl.valueChanges.subscribe((value) => {
      if (value) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { sort: value }, 
          queryParamsHandling: 'merge',
        });
      }
    });
  }
}
