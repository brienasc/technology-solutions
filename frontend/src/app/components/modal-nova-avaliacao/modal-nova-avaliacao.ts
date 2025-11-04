import { Component, Output, EventEmitter, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CursoService } from '../../services/curso.service';
import { MatricesService } from '../../services/matrices.service';
import { AvaliacaoService, CriarAvaliacaoPayload } from '../../services/avaliacao.service';
import { Curso } from '../../interfaces/curso.interface';
import { Matrix } from '../../models/matrix.model';
import { AlertVariant, AlertAction } from '../../models/alert.model';
import { AlertModalComponent } from '../../components/alert/alert.component';

// p garantir que a quantidade de itens seja um número inteiro positivo
function positiveIntegerValidator(control: AbstractControl): { [key: string]: any } | null {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
    return { 'positiveInteger': true };
  }
  return null;
}

@Component({
  selector: 'app-modal-nova-avaliacao',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AlertModalComponent],
  templateUrl: './modal-nova-avaliacao.html',
  styleUrls: ['./modal-nova-avaliacao.css']
})
export class ModalNovaAvaliacaoComponent implements OnInit, OnChanges {
  @Input() cursoId: string | number | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() avaliacaoCriada = new EventEmitter<void>();
  
  currentStep: number = 1;
  etapa1Form!: FormGroup;
  etapa2Form!: FormGroup;
  
  // Arrays para os dados reais
  cursos: Curso[] = [];
  matrizes: Matrix[] = [];
  carregandoCursos = false;
  carregandoMatrizes = false;
  criandoAvaliacao = false;
  
  totalItensCalculado: number = 0;
  
  readonly DIFICULDADE = {
    FACIL: 0.30,    // 30%
    MEDIO: 0.40,    // 40%
    DIFICIL: 0.30   // 30%
  };

  // Alert modal properties
  showAlert = false;
  alertTitle = '';
  alertMessage = '';
  alertVariant: AlertVariant = 'neutral';
  alertActions: AlertAction[] = [{ id: 'ok', label: 'OK', kind: 'primary', autofocus: true }];

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService,
    private matricesService: MatricesService,
    private avaliacaoService: AvaliacaoService
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
        this.mostrarAlerta('Erro', 'Falha ao carregar cursos.', 'warning');
      }
    });
  }

  carregarMatrizesPorCurso(cursoId: string): void {
    this.carregandoMatrizes = true;
    
    const cursoSelecionado = this.cursos.find(c => c.id === cursoId);
    
    if (!cursoSelecionado) {
      console.error('Curso não encontrado:', cursoId);
      this.matrizes = [];
      this.carregandoMatrizes = false;
      return;
    }

    this.matricesService.getMatrices({ 
      include: ['curso'],
      perPage: 1000
    }).subscribe({
      next: (response) => {
        this.matrizes = response.data.filter(matriz => {
          const matrizCursoNome = matriz.courseName?.toLowerCase().trim();
          const cursoNome = cursoSelecionado.nome.toLowerCase().trim();
          return matrizCursoNome === cursoNome;
        });
        
        this.carregandoMatrizes = false;
      },
      error: (error) => {
        console.error('Erro ao carregar matrizes:', error);
        this.matrizes = [];
        this.carregandoMatrizes = false;
        this.mostrarAlerta('Erro', 'Falha ao carregar matrizes.', 'warning');
      }
    });
  }

  inicializarFormularios(): void {
    // --- ETAPA 1 ---
    this.etapa1Form = this.fb.group({
      nomeAvaliacao: ['', Validators.required],
      curso: [this.cursoId || '', Validators.required],
      matriz: ['', Validators.required]
    });

    // Quando o curso muda, carrega as matrizes correspondentes
    this.etapa1Form.get('curso')?.valueChanges.subscribe(cursoId => {
      if (cursoId) {
        this.carregarMatrizesPorCurso(cursoId);
        this.etapa1Form.patchValue({ matriz: '' });
      } else {
        this.matrizes = [];
      }
    });

    // --- ETAPA 2 ---
    this.etapa2Form = this.fb.group({
      quantidadeItens: [20, [Validators.required, Validators.min(1), Validators.max(50), positiveIntegerValidator]],
      percentualFacil: [this.DIFICULDADE.FACIL],
      percentualMedio: [this.DIFICULDADE.MEDIO],
      percentualDificil: [this.DIFICULDADE.DIFICIL]
    });

    // Assina mudanças na quantidade de itens para recalcular
    this.etapa2Form.get('quantidadeItens')?.valueChanges.subscribe(value => {
      this.calcularTotalItens(Number(value));
    });
    
    // Calcula o total inicial
    this.calcularTotalItens(this.etapa2Form.value.quantidadeItens);
  }

  /**
   * Recalcula a distribuição de itens com base na quantidade total
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

    // número de itens no formulário
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
      this.criandoAvaliacao = true;
      
      const formValues = this.etapa2Form.getRawValue();
      
      const payload: CriarAvaliacaoPayload = {
        nome: this.etapa1Form.value.nomeAvaliacao,
        curso_id: this.etapa1Form.value.curso,
        matriz_id: this.etapa1Form.value.matriz,
        quantidade_itens: formValues.quantidadeItens,
        distribuicao: {
          facil_muito_facil_qtd: formValues.percentualFacil,
          media_qtd: formValues.percentualMedio,
          dificil_muito_dificil_qtd: formValues.percentualDificil,
        }
      };
      console.log('Enviando dados para API:', payload);

      this.avaliacaoService.criarAvaliacao(payload).subscribe({
        next: (response) => {
          this.criandoAvaliacao = false;
          console.log('Avaliação criada com sucesso:', response);
          this.mostrarAlerta('Sucesso', 'Avaliação criada com sucesso!', 'success');
          this.avaliacaoCriada.emit();
          this.fecharModal();
        },
        error: (error) => {
          this.criandoAvaliacao = false;
          console.error('Erro ao criar avaliação:', error);
          
          let mensagemErro = 'Erro ao criar avaliação.';
          let tituloErro = 'Erro';
          
          // ← TRATAMENTO ESPECÍFICO PARA DIFERENTES TIPOS DE ERRO
          if (error.status === 400) {
            // Verificar se é erro de itens insuficientes
            if (error.error?.message && error.error.message.includes('ITENS INSUFICIENTES')) {
              tituloErro = '📊 Itens Insuficientes';
              mensagemErro = this.formatarErroItensInsuficientes(error.error.message);
            } else if (error.error?.message && error.error.message.includes('dados inválidos')) {
              tituloErro = '⚠️ Dados Inválidos';
              mensagemErro = 'Verifique as informações preenchidas e tente novamente.';
            } else {
              tituloErro = '⚠️ Dados Inválidos';
              mensagemErro = error.error?.message || 'Dados inválidos. Verifique as informações e tente novamente.';
            }
          } else if (error.status === 409) {
            tituloErro = '⚠️ Nome Duplicado';
            mensagemErro = 'Já existe uma avaliação com este nome. Escolha um nome diferente.';
          } else if (error.status === 422) {
            tituloErro = '⚠️ Validação';
            mensagemErro = 'Alguns campos não foram preenchidos corretamente.';
          } else if (error.status >= 500) {
            tituloErro = '🔧 Erro do Servidor';
            mensagemErro = 'Erro interno do servidor. Tente novamente em alguns instantes.';
          } else if (error.status === 0) {
            tituloErro = '🌐 Erro de Conexão';
            mensagemErro = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
          }
          
          this.mostrarAlerta(tituloErro, mensagemErro, 'warning');
        }
      });
    } else {
      this.etapa2Form.markAllAsTouched();
      if (!totalOk) {
        this.mostrarAlerta('Dados Inválidos', 'O total de itens calculado não corresponde à quantidade informada.', 'warning');
      }
    }
  }

  //  modal de alerta
  mostrarAlerta(titulo: string, mensagem: string, variante: AlertVariant = 'neutral'): void {
    this.alertTitle = titulo;
    this.alertMessage = mensagem;
    this.alertVariant = variante;
    this.showAlert = true;
  }

  onAlertAction(action: AlertAction): void {
    this.showAlert = false;
  }

  onAlertClosed(): void {
    this.showAlert = false;
  }

  fecharModal(): void {
    this.closeModal.emit();
    this.currentStep = 1;
    this.etapa1Form.reset({ curso: this.cursoId || '' }); 
    this.etapa2Form.reset({ quantidadeItens: 20 });
    this.calcularTotalItens(20);
  }

  getCursoNome(cursoId: string): string {
    const curso = this.cursos.find(c => c.id === cursoId);
    return curso ? curso.nome : 'Curso não encontrado';
  }

  getMatrizNome(matrizId: string): string {
    const matriz = this.matrizes.find(m => m.id === matrizId);
    return matriz ? matriz.name : 'Matriz não encontrada';
  }

  // Formatar erro de itens insuficientes
  private formatarErroItensInsuficientes(mensagemErro: string): string {
    try {
      // Extrair informações do erro do backend
      const linhas = mensagemErro.split('\n');
      let mensagemFormatada = '❌ Não há itens suficientes na matriz selecionada:\n\n';
      
      linhas.forEach(linha => {
        if (linha.includes('Itens fáceis:')) {
          const match = linha.match(/disponível (\d+), solicitado (\d+)/);
          if (match) {
            mensagemFormatada += `• 🟢 Fáceis: ${match[1]} disponíveis, ${match[2]} necessários\n`;
          }
        } else if (linha.includes('Itens médios:')) {
          const match = linha.match(/disponível (\d+), solicitado (\d+)/);
          if (match) {
            mensagemFormatada += `• 🟡 Médios: ${match[1]} disponíveis, ${match[2]} necessários\n`;
          }
        } else if (linha.includes('Itens difíceis:')) {
          const match = linha.match(/disponível (\d+), solicitado (\d+)/);
          if (match) {
            mensagemFormatada += `• 🔴 Difíceis: ${match[1]} disponíveis, ${match[2]} necessários\n`;
          }
        }
      });
      
      mensagemFormatada += '\n💡 Sugestões:\n';
      mensagemFormatada += '• Reduza a quantidade total de itens\n';
      mensagemFormatada += '• Adicione mais itens à matriz\n';
      mensagemFormatada += '• Escolha uma matriz com mais itens disponíveis';
      
      return mensagemFormatada;
    } catch (e) {
      // Fallback caso não consiga formatar
      return 'Não há itens suficientes na matriz selecionada para criar esta avaliação. Reduza a quantidade de itens ou escolha uma matriz com mais itens disponíveis.';
    }
  }
}
