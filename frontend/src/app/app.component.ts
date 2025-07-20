// frontend/src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'; 
// Estes imports são para as funções usadas no 'appConfig.providers'
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideNgxMask } from 'ngx-mask';
import { routes } from './app.routes';


export const appConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideNgxMask() 
  ]
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ReactiveFormsModule 
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class App {
  protected title = 'frontend-app';
}
