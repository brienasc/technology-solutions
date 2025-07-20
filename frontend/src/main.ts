import { bootstrapApplication } from '@angular/platform-browser';
import { App, appConfig } from './app/app.component';
//import { appConfig } from './app/app.component';
import { routes } from './app/app.routes'; 
//import { App } from './app/app-routing.module';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));



 