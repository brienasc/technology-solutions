import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Verifica o estado inicial do tema
  it('should initialize with light theme by default', () => {
    // Simula que não há tema salvo no localStorage
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.ngOnInit(); // Chama ngOnInit novamente para simular a inicialização
    expect(component.isDarkTheme).toBeFalse(); // Espera que o tema seja falso (claro)
  });

  //  Verifica a alternância de tema
  it('should toggle theme when toggleTheme is called', () => {
    component.isDarkTheme = false; // Começa no tema claro
    component.toggleTheme(); // Chama o método para alternar
    expect(component.isDarkTheme).toBeTrue(); // Espera que agora seja tema escuro
    component.toggleTheme(); // Chama novamente
    expect(component.isDarkTheme).toBeFalse(); // Espera que volte para tema claro
  });
});
