import {
  Component,
  inject,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
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
import { ShepherdService } from 'angular-shepherd';

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
  private shepherdService = inject(ShepherdService);

  @ViewChild('mainContent') mainContent!: ElementRef;

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.isDashboardRoute = this.router.url.endsWith('dashboard');
        if (this.isDashboardRoute) {
          setTimeout(() => this.startTour(), 1000);
        }
      });
  }

  fileService = inject(FileService);
  usedSpace = new BehaviorSubject<any>('');
  files: Models.Document[] = [];
  totalSpace: any;
  usageSummary: UsageSummary[] = [];
  convertFileSize = convertFileSize;

  private startTour() {
    // Check if tour has been shown in this session
    const hasSeenTour = sessionStorage.getItem('hasSeenTour');
    if (hasSeenTour) {
      return;
    }

    const steps = [
      {
        id: 'welcome',
        title: 'Welcome to Store-It Dashboard',
        text: 'Let us guide you through the main features of your dashboard.',
        buttons: [
          {
            text: 'Skip',
            action: () => this.shepherdService.cancel(),
          },
          {
            text: 'Start Tour',
            action: () => this.shepherdService.next(),
          },
        ],
      },
      {
        id: 'storage-usage',
        title: 'Storage Usage',
        text: 'Here you can see your total storage usage and how much space you have left.',
        attachTo: {
          element: 'app-chart',
          on: 'bottom' as const,
        },
        buttons: [
          {
            text: 'Back',
            action: () => this.shepherdService.back(),
          },
          {
            text: 'Next',
            action: () => this.shepherdService.next(),
          },
        ],
      },
      {
        id: 'file-summary',
        title: 'File Summary',
        text: 'View a summary of your files by type, including images, documents, and other files.',
        attachTo: {
          element: '.dashboard-summary-list',
          on: 'left' as const,
        },
        buttons: [
          {
            text: 'Back',
            action: () => this.shepherdService.back(),
          },
          {
            text: 'Next',
            action: () => this.shepherdService.next(),
          },
        ],
      },
      {
        id: 'recent-files',
        title: 'Recent Files',
        text: 'Access your most recently uploaded files here. You can view, download, or manage them.',
        attachTo: {
          element: '.dashboard-recent-files',
          on: 'right' as const,
        },
        buttons: [
          {
            text: 'Back',
            action: () => this.shepherdService.back(),
          },
          {
            text: 'Finish',
            action: () => {
              this.shepherdService.complete();
              this.scrollToTop();
              // Set flag in sessionStorage after tour is completed
              sessionStorage.setItem('hasSeenTour', 'true');
            },
          },
        ],
      },
    ];

    this.shepherdService.defaultStepOptions = {
      classes: 'shepherd-theme-custom',
      scrollTo: true,
      cancelIcon: {
        enabled: true,
      },
    };

    this.shepherdService.addSteps(steps);
    this.shepherdService.start();
  }

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

  private scrollToTop() {
    if (this.mainContent) {
      this.mainContent.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
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
