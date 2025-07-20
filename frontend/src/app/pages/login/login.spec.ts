import { ComponentFixture, TestBed } from '@angular/core/testing';
import {LoginComponent} from './login'; 
// Importa o componente que será testado

///Define uma suíte de testes para o componente de Login.
describe('Login', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  // Configura o ambiente de teste antes de cada teste.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Define um teste individual. A string é uma descrição do que este teste verifica.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
