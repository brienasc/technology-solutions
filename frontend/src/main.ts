import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.component';
import { App } from './app/app-routing.module';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
