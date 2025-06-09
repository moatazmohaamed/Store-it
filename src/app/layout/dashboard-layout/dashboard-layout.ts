import { Component, inject, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { Mobilenavigation } from '../../shared/components/mobilenavigation/mobilenavigation';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { Header } from '../../shared/components/header/header';
import { Auth } from '../../core/services/auth/auth';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  BehaviorSubject,
  catchError,
  filter,
  forkJoin,
  of,
  Subject,
  takeUntil,
} from 'rxjs';
import { Chart } from '../../shared/components/chart/chart';
import { FileService } from '../../core/services/file/file';
import { Models } from 'appwrite';
import { UsageSummary } from '../../core/interfaces/ifile';
import { convertFileSize, getUsageSummary } from '../../shared/utils/utils';
import { FormattedDateTime } from '../../shared/components/formatted-date-time/formatted-date-time';
import { Thumbnail } from '../../shared/components/thumbnail/thumbnail';
import { Actiondropdown } from '../../shared/components/actiondropdown/actiondropdown';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Mobilenavigation,
    Sidebar,
    Header,
    CommonModule,
    Chart,
    FormattedDateTime,
    RouterLink,
    Thumbnail,
    Actiondropdown,
    AsyncPipe,
  ],
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.scss'],
})
export class DashboardLayout implements OnDestroy {
  private destroy$ = new Subject<void>();
  authService = inject(Auth);
  router = inject(Router);
  currentUser: any;
  route = inject(ActivatedRoute);
  isDashboardRoute: boolean = false;
  type: string = '';

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.isDashboardRoute = this.router.url.endsWith('dashboard');
      });
  }

  fileService = inject(FileService);
  usedSpace = new BehaviorSubject<any>('');
  files: Models.Document[] = [];
  totalSpace: any;
  usageSummary: UsageSummary[] = [];
  convertFileSize = convertFileSize;

  async ngOnInit() {
    try {
      let space = await this.fileService.getTotalSpaceUsed();
      this.usedSpace.next(space);
      this.currentUser = await this.authService.getCurrentUser();
      if (!this.currentUser) {
        return this.router.navigate(['/auth/sign-in']);
      }
      this.loadDashboardData();
      this.fileService.fileUploaded$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadDashboardData();
        });
      return this.currentUser;
    } catch (error) {
      console.error('Error fetching user', error);
      return null;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get fullName() {
    return this.currentUser?.fullName || '';
  }
  get email() {
    return this.currentUser?.email || '';
  }
  private loadDashboardData() {
    forkJoin([
      this.fileService.getFiles({ types: [], limit: 10 }),
      this.fileService.getTotalSpaceUsed(),
    ])
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading dashboard data:', error);
          return of([null, null]);
        })
      )
      .subscribe(([filesResponse, totalSpaceResponse]) => {
        if (filesResponse) {
          this.files = filesResponse;
        } else {
          this.files = [];
        }
        if (totalSpaceResponse) {
          this.totalSpace = totalSpaceResponse;
          this.usedSpace.next(this.totalSpace);
          this.usageSummary = getUsageSummary(this.totalSpace);
        }
      });
  }
}
