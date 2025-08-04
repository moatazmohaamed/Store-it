import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { registerLicense } from '@syncfusion/ej2-base';

// Register Syncfusion license
registerLicense(
  'Ngo9BigBOggjHTQxAR8/V1NNaF1cVGhIfEx1RHxQdld5ZFRHallYTnNWUj0eQnxTdEBjX39XcXJWQ2NYWUFyXElfag=='
);

// Bootstrap the application with performance optimization
bootstrapApplication(App, appConfig)
  .catch(err => {
    console.error('Application bootstrap failed:', err);
  });

// Enable production mode in the browser
if (typeof document !== 'undefined') {
  // Add event listener for page load to measure and optimize initial load time
  window.addEventListener('load', () => {
    // Use requestIdleCallback to defer non-critical initialization
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        // Initialize any deferred work here when the browser is idle
        console.info('Application fully initialized');
      });
    }
  });
}
