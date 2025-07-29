import { bootstrapApplication } from '@angular/platform-browser';
import { App, appConfig } from './app/app.component';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));