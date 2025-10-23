import { Component, Output, EventEmitter, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CursoService } from '../../services/curso.service';
import { MatricesService } from '../../services/matrices.service';
import { Curso } from '../../interfaces/curso.interface';
import { Matrix } from '../../models/matrix.model';

// garante que a quantidade de itens seja um num int positivo
function positiveIntegerValidator(control: AbstractControl): { [key: string]: any } | null {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return null; // 'required' cuidará de campos vazios
  }
  if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
    return { 'positiveInteger': true };
  }
  return null;
}
@Component({
  selector: 'app-modal-nova-avaliacao',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './modal-nova-avaliacao.html',
  styleUrls: ['./modal-nova-avaliacao.css']
})
export class ModalNovaAvaliacaoComponent implements OnInit, OnChanges {
  @Input() cursoId: string | number | null = null;
  @Output() closeModal = new EventEmitter<void>();
  
  currentStep: number = 1;
  etapa1Form!: FormGroup;
  etapa2Form!: FormGroup;
  
  // p dados reais
  cursos: Curso[] = [];
  matrizes: Matrix[] = [];
  carregandoCursos = false;
  carregandoMatrizes = false;
  
  totalItensCalculado: number = 0;
  
  readonly DIFICULDADE = {
    FACIL: 0.30,
    MEDIO: 0.40,
    DIFICIL: 0.30
  };

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService,
    private matricesService: MatricesService
  ) {}

  ngOnInit(): void {
    this.carregarCursos();
    this.inicializarFormularios();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cursoId'] && this.cursoId) {
      this.carregarMatrizesPorCurso(this.cursoId.toString());
      if (this.etapa1Form) {
        this.etapa1Form.patchValue({ curso: this.cursoId });
      }
    }
  }

  carregarCursos(): void {
    this.carregandoCursos = true;
    this.cursoService.getAllCursos().subscribe({
      next: (cursos) => {
        this.cursos = cursos;
        this.carregandoCursos = false;
        if (this.cursoId) {
          this.carregarMatrizesPorCurso(this.cursoId.toString());
        }
      },
      error: (error) => {
        console.error('Erro ao carregar cursos:', error);
        this.carregandoCursos = false;
      }
    });
  }

  carregarMatrizesPorCurso(cursoId: string): void {
    this.carregandoMatrizes = true;
    
    // obter o nome do curso para buscar as matrizes
    const cursoSelecionado = this.cursos.find(c => c.id === cursoId);
    
    if (!cursoSelecionado) {
      console.error('Curso não encontrado:', cursoId);
      this.matrizes = [];
      this.carregandoMatrizes = false;
      return;
    }

    console.log('Buscando matrizes para o curso:', cursoSelecionado.nome);

    // Busca todas as matrizes e filtra pelo curso
    this.matricesService.getMatrices({ 
      include: ['curso'],
      perPage: 1000
    }).subscribe({
      next: (response) => {
        console.log('Todas as matrizes retornadas:', response.data);
        
        // Filtra as matrizes que pertencem ao curso específico
        // Compara o nome do curso na matriz com o nome do curso selecionado
        this.matrizes = response.data.filter(matriz => {
          const matrizCursoNome = matriz.courseName?.toLowerCase().trim();
          const cursoNome = cursoSelecionado.nome.toLowerCase().trim();
          
          return matrizCursoNome === cursoNome;
        });
        
        console.log('Matrizes filtradas para o curso:', this.matrizes);
        this.carregandoMatrizes = false;
      },
      error: (error) => {
        console.error('Erro ao carregar matrizes:', error);
        this.matrizes = [];
        this.carregandoMatrizes = false;
      }
    });
  }

  inicializarFormularios(): void {
    // --- ETAPA 1: Informações ---
    this.etapa1Form = this.fb.group({
      nomeAvaliacao: ['', Validators.required],
      curso: [this.cursoId || '', Validators.required],
      matriz: ['', Validators.required]
    });

    // Qnd o curso muda, carrega as matrizes correspondentes
    this.etapa1Form.get('curso')?.valueChanges.subscribe(cursoId => {
      if (cursoId) {
        this.carregarMatrizesPorCurso(cursoId);
        // Limpa a seleção de matriz quando o curso muda
        this.etapa1Form.patchValue({ matriz: '' });
      } else {
        this.matrizes = [];
      }
    });

    // --- ETAPA 2: Config de itens ---
    this.etapa2Form = this.fb.group({
      quantidadeItens: [20, [Validators.required, Validators.min(1), Validators.max(50), positiveIntegerValidator]],
      percentualFacil: [this.DIFICULDADE.FACIL],
      percentualMedio: [this.DIFICULDADE.MEDIO],
      percentualDificil: [this.DIFICULDADE.DIFICIL]
    });

    // quando tem mudanças na quantidade de itens para recalcular
    this.etapa2Form.get('quantidadeItens')?.valueChanges.subscribe(value => {
      this.calcularTotalItens(Number(value));
    });
    
    // total inicial
    this.calcularTotalItens(this.etapa2Form.value.quantidadeItens);
  }

  /**
   * recalcula a distribuição de itens com base na quantidade total
   * e nas porcentagens fixas, lidando com arredondamento.
   */
  calcularTotalItens(quantidade: number): void {
    if (quantidade < 1 || !Number.isInteger(quantidade)) {
        this.totalItensCalculado = 0;
        return;
    }
    
    // Calcula os valores base e arredonda
    let facil = Math.floor(quantidade * this.DIFICULDADE.FACIL);
    let medio = Math.floor(quantidade * this.DIFICULDADE.MEDIO);
    let dificil = Math.floor(quantidade * this.DIFICULDADE.DIFICIL);
    
    let totalArredondado = facil + medio + dificil;
    let diferenca = quantidade - totalArredondado;

    // Distribui a diferença de arredondamento (o item "sobrando")
    // Prioriza o Médio, depois Fácil, depois Difícil
    if (diferenca > 0) {
        if (this.DIFICULDADE.MEDIO > this.DIFICULDADE.FACIL && diferenca > 0) {
            medio += 1;
            diferenca--;
        }
        if (diferenca > 0) {
            facil += 1;
            diferenca--;
        }
        if (diferenca > 0) {
            dificil += 1;
            diferenca--;
        }
    }
    
    this.totalItensCalculado = facil + medio + dificil;

    // Atualizar o número de itens no formulário
    this.etapa2Form.patchValue({
      percentualFacil: facil,
      percentualMedio: medio,
      percentualDificil: dificil
    }, { emitEvent: false });
  }

  proximaEtapa(): void {
    if (this.etapa1Form.valid) {
      this.currentStep = 2;
    } else {
      this.etapa1Form.markAllAsTouched();
    }
  }

  voltarEtapa(): void {
    this.currentStep = 1;
  }

  criarAvaliacao(): void {
    const totalOk = this.totalItensCalculado === this.etapa2Form.value.quantidadeItens;
    
    if (this.etapa2Form.valid && totalOk) {
      // Encontra o curso e matriz selecionados para obter os nomes
      const cursoSelecionado = this.cursos.find(c => c.id === this.etapa1Form.value.curso);
      const matrizSelecionada = this.matrizes.find(m => m.id === this.etapa1Form.value.matriz);

      const dadosCompletos = { 
          ...this.etapa1Form.value,
          cursoNome: cursoSelecionado?.nome,
          matrizNome: matrizSelecionada?.name,
          //  Etapa 2
          quantidadeTotal: this.etapa2Form.value.quantidadeItens,
          distribuicao: {
              facil_muito_facil_qtd: this.etapa2Form.value.percentualFacil,
              media_qtd: this.etapa2Form.value.percentualMedio,
              dificil_muito_dificil_qtd: this.etapa2Form.value.percentualDificil,
              distribuicao_percentual: {
                 facil_muito_facil: this.DIFICULDADE.FACIL,
                 media: this.DIFICULDADE.MEDIO,
                 dificil_muito_dificil: this.DIFICULDADE.DIFICIL
              }
          }
      };

      console.log('Dados da Avaliação prontos para o Backend:', dadosCompletos);
      // ** aqui chamo o Service para enviar os dados para o back**
      
      this.fecharModal();
    } else {
      this.etapa2Form.markAllAsTouched();
      if (!totalOk) {
         console.error('Erro: O total de itens calculado não corresponde à quantidade total informada.');
      }
    }
  }

  fecharModal(): void {
    this.closeModal.emit();
    // Reseto os formulários e a etapa ao fechar
    this.currentStep = 1;
    this.etapa1Form.reset({ curso: this.cursoId || '' }); 
    this.etapa2Form.reset({ quantidadeItens: 20 });
    this.calcularTotalItens(20);
  }

  // para obter o nome do curso selecionado
  getCursoNome(cursoId: string): string {
    const curso = this.cursos.find(c => c.id === cursoId);
    return curso ? curso.nome : 'Curso não encontrado';
  }

  // nome da matriz selecionada
  getMatrizNome(matrizId: string): string {
    const matriz = this.matrizes.find(m => m.id === matrizId);
    return matriz ? matriz.name : 'Matriz não encontrada';
  }
}