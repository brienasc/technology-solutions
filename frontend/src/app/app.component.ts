// frontend/src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, provideRouter } from '@angular/router'; 
import { provideHttpClient } from '@angular/common/http'; 
import { ReactiveFormsModule } from '@angular/forms'; 
import { provideNgxMask } from 'ngx-mask';

// Importa as rotas aqui, que estão em './app.routes'
import { routes } from './app.routes';


export const appConfig = {
  providers: [
    provideRouter(routes), 
    provideHttpClient(),   
     provideNgxMask(),
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
