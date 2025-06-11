import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withHashLocation,
  withViewTransitions,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ShepherdService } from 'angular-shepherd';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({
      eventCoalescing: true,
      runCoalescing: true,
    }),
    provideRouter(
      routes,
      withViewTransitions(),
      withHashLocation(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
      progressAnimation: 'decreasing',
      maxOpened: 3,
      autoDismiss: true,
      newestOnTop: true,
    }),
    {
      provide: ShepherdService,
      useClass: ShepherdService,
    },
  ],
};
