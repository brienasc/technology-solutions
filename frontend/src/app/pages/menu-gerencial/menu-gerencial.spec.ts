// frontend/src/app/pages/menu-gerencial/menu-gerencial.spec.ts

// O que temos que fazer - Painel Administrativo (Administrador e Gente e Cultura):

// Menu "Gerencial".

// Lista de Colaboradores: Exibir todos (status "Finalizado"), ordem alfabética, paginação, pesquisa (nome, e-mail, CPF).

// Exportação para Excel (obedecendo filtro).

// Visualização de Informações detalhadas do colaborador.

// Alteração de Perfil: Select para mudar perfil (Administrador pode mudar para qualquer um; Gente e Cultura para Gente e Cultura/Colaborador Comum).

// Campo de senha para perfis Administrador/Gente e Cultura.

// frontend/src/app/pages/menu-gerencial/menu-gerencial.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing'; 
import { MenuGerencialComponent } from './menu-gerencial'; // O componente que será testado

describe('MenuGerencialComponent', () => {
  let component: MenuGerencialComponent; // Instância do componente
  let fixture: ComponentFixture<MenuGerencialComponent>; // Fixture para interagir com o componente no teste

  beforeEach(async () => {
    // Configura o módulo de teste do Angular
    await TestBed.configureTestingModule({
      imports: [MenuGerencialComponent] // Importa o componente que será testado
    })
    .compileComponents(); // Compila os componentes (necessário para testes assíncronos)

    // Cria uma instância do componente e seu fixture
    fixture = TestBed.createComponent(MenuGerencialComponent);
    component = fixture.componentInstance; // Obtém a instância da classe do componente
    fixture.detectChanges(); // Dispara a detecção de mudanças para inicializar o componente
  });

  // Primeiro teste: Verifica se o componente foi criado com sucesso
  it('should create', () => {
    expect(component).toBeTruthy(); // Espera que a instância do componente exista
  });

  // Exemplo de outro teste: Verificar o estado inicial do tema
  it('should initialize with light theme by default', () => {
    // Simula que não há tema salvo no localStorage
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.ngOnInit(); // Chama ngOnInit novamente para simular a inicialização
    expect(component.isDarkTheme).toBeFalse(); // Espera que o tema seja falso (claro)
  });

  // Exemplo de teste: Verificar a alternância de tema
  it('should toggle theme when toggleTheme is called', () => {
    component.isDarkTheme = false; // Começa no tema claro
    component.toggleTheme(); // Chama o método para alternar
    expect(component.isDarkTheme).toBeTrue(); // Espera que agora seja tema escuro
    component.toggleTheme(); // Chama novamente
    expect(component.isDarkTheme).toBeFalse(); // Espera que volte para tema claro
  });

  // Exemplo de teste: Verificar se o método onViewColaboradorDetails funciona
  it('should set selectedColaborador and showModal when onViewColaboradorDetails is called', () => {
    const mockColaborador = { id: 1, nome: 'Teste' };
    component.onViewColaboradorDetails(mockColaborador);
    expect(component.selectedColaborador).toEqual(mockColaborador);
    expect(component.showModal).toBeTrue();
  });

  // Exemplo de teste: Verificar se o método closeModal funciona
  it('should reset selectedColaborador and hideModal when closeModal is called', () => {
    component.selectedColaborador = { id: 1, nome: 'Teste' };
    component.showModal = true;
    component.closeModal();
    expect(component.selectedColaborador).toBeNull();
    expect(component.showModal).toBeFalse();
  });
});



