// frontend/src/app/app.component.ts
import { Component } from '@angular/core';
import { provideRouter, RouterOutlet } from '@angular/router'; 
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; 
import { ReactiveFormsModule } from '@angular/forms'; 
import { provideNgxMask } from 'ngx-mask';
// import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { ApplicationConfig } from '@angular/core';

// Importa as rotas aqui, que estão em './app.routes'npm install @angular/animations@20.1.1 @angular/common@20.1.1 @angular/compiler@20.1.1 @angular/core@20.1.1 @angular/forms@20.1.1 @angular/platform-browser@20.1.1 @angular/platform-browser-dynamic@20.1.1 @angular/router@20.1.1
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorIntl } from './utils/custom-mat-paginator-intl'; // Importa o MatPaginatorIntl personalizado
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { AccessibilityBarComponent } from './components/accessibility-bar/accessibility-bar';
import { ToastNotificationsComponent } from './components/toast-notifications/toast-notifications.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideHttpClient(),   
    provideNgxMask(),
    provideAnimations(),
    // Fornece o MatPaginatorIntl personalizado
    {
      provide: MatPaginatorIntl,
      useClass: CustomMatPaginatorIntl
    },
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    ReactiveFormsModule, 
    AccessibilityBarComponent,
    ToastNotificationsComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class App {
  protected title = 'frontend-app';
}
