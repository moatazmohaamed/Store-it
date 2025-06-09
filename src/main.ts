import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense(
  'Ngo9BigBOggjHTQxAR8/V1NNaF1cVGhIfEx1RHxQdld5ZFRHallYTnNWUj0eQnxTdEBjX39XcXJWQ2NYWUFyXElfag=='
);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
