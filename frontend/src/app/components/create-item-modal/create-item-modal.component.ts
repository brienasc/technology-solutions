import { Component, EventEmitter, Input, Output, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatricesService } from '../../services/matrices.service';
import { CourseItemsService } from '../../services/cursos-itens.service';
import { MatrixDetail } from '../../models/matrix.model';

export interface Alternativa {
  texto: string;
  correta: boolean;
  explicacao: string;
}

export interface ItemFormData {
  curso_id: string;
  matriz_id: string;
  comando: string;
  contexto: string;
  alternativas: Alternativa[];
  dificuldade: number;
  tipo_criacao: 'manual' | 'ia';
  prompt_ia?: string;
  // Campos do cruzamento
  categoria_id?: string;
  competencia_id?: string;
  funcao_id?: string;
  subfuncao_id?: string;
  conhecimento_id?: string;
}

interface Cruzamento {
  id: string;
  matriz_id: string;
  subfuncao_id: string;
  competencia_id: string;
  conhecimento_id: string;
}

interface Categoria {
  id: string;
  nome: string;
  competencias: Competencia[];
}

interface Competencia {
  id: string;
  nome: string;
}

interface Funcao {
  id: string;
  nome: string;
  subfuncoes: Subfuncao[];
}

interface Subfuncao {
  id: string;
  nome: string;
}

interface Conhecimento {
  id: string;
  nome: string;
  codigo: number;
}

@Component({
  selector: 'app-create-item-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-item-modal.component.html',
  styleUrls: ['./create-item-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateItemModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() courseId = '';
  @Output() close = new EventEmitter<void>();
  @Output() itemCreated = new EventEmitter<void>();

  currentStep = 0;
  tipoSelecionado: 'manual' | 'ia' | null = null;
  matrizes: any[] = [];
  matrizSelecionada: MatrixDetail | null = null;
  loading = false;

  // Opções de dificuldade
  dificuldades = [
    { value: 1, label: 'Muito Fácil' },
    { value: 2, label: 'Fácil' },
    { value: 3, label: 'Média' },
    { value: 4, label: 'Difícil' },
    { value: 5, label: 'Muito Difícil' }
  ];

  // Seleções separadas para maior flexibilidade
  selectedCategoria: Categoria | null = null;
  selectedCompetencia: Competencia | null = null;
  selectedFuncao: Funcao | null = null;
  selectedSubfuncao: Subfuncao | null = null;
  selectedConhecimento: Conhecimento | null = null;

  formData: ItemFormData = {
    curso_id: '',
    matriz_id: '',
    comando: '',
    contexto: '',
    alternativas: [
      { texto: '', correta: false, explicacao: '' },
      { texto: '', correta: false, explicacao: '' },
      { texto: '', correta: false, explicacao: '' },
      { texto: '', correta: false, explicacao: '' },
      { texto: '', correta: false, explicacao: '' }
    ],
    dificuldade: 3, // Média como padrão
    tipo_criacao: 'manual'
  };

  constructor(
    private matricesService: MatricesService,
    private itemService: CourseItemsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMatrizes();
  }

  loadMatrizes(): void {
    this.matricesService.getMatrices({ include: ['curso'] }).subscribe({
      next: (response) => {
        this.matrizes = response.data;
        this.cdr.markForCheck();
      }
    });
  }

  onMatrizChange(): void {
    if (!this.formData.matriz_id) {
      this.matrizSelecionada = null;
      this.resetAllSelections();
      this.cdr.markForCheck();
      return;
    }

    // Incluir cruzamentos na requisição
    this.matricesService.getMatrix(this.formData.matriz_id).subscribe({
      next: (matriz) => {
        this.matrizSelecionada = matriz;
        this.resetAllSelections();
        this.cdr.markForCheck();
      },
      error: () => {
        this.matrizSelecionada = null;
        this.resetAllSelections();
        this.cdr.markForCheck();
      }
    });
  }

  resetAllSelections(): void {
    this.selectedCategoria = null;
    this.selectedCompetencia = null;
    this.selectedFuncao = null;
    this.selectedSubfuncao = null;
    this.selectedConhecimento = null;
    this.formData.categoria_id = undefined;
    this.formData.competencia_id = undefined;
    this.formData.funcao_id = undefined;
    this.formData.subfuncao_id = undefined;
    this.formData.conhecimento_id = undefined;
  }

  onCategoriaChange(): void {
    this.selectedCompetencia = null;
    this.selectedFuncao = null;
    this.selectedSubfuncao = null;
    this.selectedConhecimento = null;
    this.formData.competencia_id = undefined;
    this.formData.funcao_id = undefined;
    this.formData.subfuncao_id = undefined;
    this.formData.conhecimento_id = undefined;
    
    if (this.selectedCategoria) {
      this.formData.categoria_id = this.selectedCategoria.id;
    }
  }

  onCompetenciaChange(): void {
    this.selectedFuncao = null;
    this.selectedSubfuncao = null;
    this.selectedConhecimento = null;
    this.formData.funcao_id = undefined;
    this.formData.subfuncao_id = undefined;
    this.formData.conhecimento_id = undefined;
    
    if (this.selectedCompetencia) {
      this.formData.competencia_id = this.selectedCompetencia.id;
    }
  }

  onFuncaoChange(): void {
    this.selectedSubfuncao = null;
    this.selectedConhecimento = null;
    this.formData.subfuncao_id = undefined;
    this.formData.conhecimento_id = undefined;
    
    if (this.selectedFuncao) {
      this.formData.funcao_id = this.selectedFuncao.id;
    }
  }

  onSubfuncaoChange(): void {
    this.selectedConhecimento = null;
    this.formData.conhecimento_id = undefined;
    
    if (this.selectedSubfuncao) {
      this.formData.subfuncao_id = this.selectedSubfuncao.id;
    }
  }

  onConhecimentoChange(): void {
    if (this.selectedConhecimento) {
      this.formData.conhecimento_id = this.selectedConhecimento.id;
    }
  }

  onTipoSelect(tipo: 'manual' | 'ia'): void {
    this.tipoSelecionado = tipo;
    this.formData.tipo_criacao = tipo;
    this.nextStep();
  }

  nextStep(): void {
    this.currentStep++;
  }

  prevStep(): void {
    this.currentStep--;
  }

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  resetForm(): void {
    this.currentStep = 0;
    this.tipoSelecionado = null;
    this.matrizSelecionada = null;
    this.resetAllSelections();
    this.formData = {
      curso_id: this.courseId,
      matriz_id: '',
      comando: '',
      contexto: '',
      alternativas: [
        { texto: '', correta: false, explicacao: '' },
        { texto: '', correta: false, explicacao: '' },
        { texto: '', correta: false, explicacao: '' },
        { texto: '', correta: false, explicacao: '' },
        { texto: '', correta: false, explicacao: '' }
      ],
      dificuldade: 3,
      tipo_criacao: 'manual'
    };
  }

  onAlternativaCorretaChange(index: number): void {
    this.formData.alternativas.forEach((alt, i) => {
      if (i !== index) {
        alt.correta = false;
      }
    });
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.tipoSelecionado !== null;
      case 1:
        return this.formData.matriz_id !== '' && 
               this.formData.dificuldade > 0 &&
               this.selectedCategoria !== null &&
               this.selectedCompetencia !== null &&
               this.selectedFuncao !== null &&
               this.selectedSubfuncao !== null &&
               this.selectedConhecimento !== null;
      case 2:
        if (this.tipoSelecionado === 'manual') {
          return this.formData.comando.trim() !== '' && 
                 this.formData.contexto.trim() !== '' &&
                 this.formData.alternativas.every(alt => alt.texto.trim() !== '') &&
                 this.formData.alternativas.some(alt => alt.correta);
        } else {
          return this.formData.prompt_ia?.trim() !== '';
        }
      default:
        return true;
    }
  }

  saveDraft(): void {
    this.formData.curso_id = this.courseId;
    this.loading = true;
    
    console.log('Dados enviados para saveDraft:', this.formData);
    
    this.itemService.saveDraft(this.formData).subscribe({
      next: (response) => {
        console.log('Rascunho salvo com sucesso:', response);
        this.loading = false;
        this.itemCreated.emit();
        this.onClose();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erro completo ao salvar rascunho:', error);
        console.error('Status:', error.status);
        console.error('Mensagem:', error.message);
        console.error('URL:', error.url);
        this.loading = false;
        
        // Mensagem de erro mais específica
        let errorMessage = 'Erro ao salvar rascunho.';
        if (error.status === 0) {
          errorMessage = 'Erro de conexão. Verifique se o backend está rodando na porta 8080.';
        } else if (error.status === 404) {
          errorMessage = 'Endpoint não encontrado. Verifique a rota no backend.';
        } else if (error.status === 422) {
          errorMessage = 'Dados inválidos. Verifique os campos obrigatórios.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        alert(errorMessage);
        this.cdr.markForCheck();
      }
    });
  }

  finalizeItem(): void {
    this.formData.curso_id = this.courseId;
    this.loading = true;
    
    console.log('Dados enviados para create:', this.formData);
    
    this.itemService.createItem(this.formData).subscribe({
      next: (response) => {
        console.log('Item finalizado com sucesso:', response);
        this.loading = false;
        this.itemCreated.emit();
        this.onClose();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erro completo ao finalizar item:', error);
        console.error('Status:', error.status);
        console.error('Mensagem:', error.message);
        console.error('URL:', error.url);
        this.loading = false;
        
        // Mensagem de erro mais específica
        let errorMessage = 'Erro ao finalizar item.';
        if (error.status === 0) {
          errorMessage = 'Erro de conexão. Verifique se o backend está rodando na porta 8080.';
        } else if (error.status === 404) {
          errorMessage = 'Endpoint não encontrado. Verifique a rota no backend.';
        } else if (error.status === 422) {
          errorMessage = 'Dados inválidos. Verifique os campos obrigatórios.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        alert(errorMessage);
        this.cdr.markForCheck();
      }
    });
  }

  get stepTitle(): string {
    if (this.currentStep === 0) return 'Criação de Item';
    if (this.currentStep === 1) return 'Selecionar Matriz, Dificuldade e Cruzamento';
    if (this.currentStep === 2) {
      return this.tipoSelecionado === 'manual' ? 'Criar Questão' : 'Prompt para IA';
    }
    return 'Revisão';
  }

  getMatrizNome(): string {
    const matriz = this.matrizes.find((m: any) => m.id === this.formData.matriz_id);
    return matriz?.name || '';
  }

  getCruzamentoNome(): string {
    if (!this.selectedCategoria || !this.selectedCompetencia || !this.selectedFuncao || !this.selectedSubfuncao || !this.selectedConhecimento) {
      return '';
    }
    return `${this.selectedCategoria.nome} → ${this.selectedCompetencia.nome} → ${this.selectedFuncao.nome} → ${this.selectedSubfuncao.nome} → ${this.selectedConhecimento.nome}`;
  }

  getDificuldadeLabel(): string {
    const dif = this.dificuldades.find(d => d.value === this.formData.dificuldade);
    return dif?.label || '';
  }

  // Método para converter número para letra (A, B, C, D, E)
  getAlternativaLetra(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // Getters para listas filtradas baseadas nos cruzamentos válidos
  get categoriasDisponiveis(): Categoria[] {
    return this.matrizSelecionada?.categorias || [];
  }

  get competenciasDisponiveis(): Competencia[] {
    if (!this.selectedCategoria) return [];
    return this.selectedCategoria.competencias || [];
  }

  get funcoesDisponiveis(): Funcao[] {
    if (!this.selectedCompetencia) return [];
    
    // Filtrar apenas as funções que têm cruzamentos válidos para a competência selecionada
    if (!this.matrizSelecionada?.cruzamentos) return [];
    
    const funcoesComCruzamento = new Set<string>();
    this.matrizSelecionada.cruzamentos
      .filter((c: Cruzamento) => c.competencia_id === this.selectedCompetencia!.id)
      .forEach((cruzamento: Cruzamento) => {
        // Encontrar a subfunção e sua função pai
        this.matrizSelecionada?.funcoes.forEach((funcao: Funcao) => {
          funcao.subfuncoes.forEach((subfuncao: Subfuncao) => {
            if (subfuncao.id === cruzamento.subfuncao_id) {
              funcoesComCruzamento.add(funcao.id);
            }
          });
        });
      });
    
    return (this.matrizSelecionada?.funcoes || []).filter((f: Funcao) => funcoesComCruzamento.has(f.id));
  }

  get subfuncoesDisponiveis(): Subfuncao[] {
    if (!this.selectedFuncao || !this.selectedCompetencia) return [];
    
    // Filtrar apenas as subfunções que têm cruzamentos válidos para a competência selecionada
    if (!this.matrizSelecionada?.cruzamentos) return [];
    
    const subfuncoesComCruzamento = new Set<string>();
    this.matrizSelecionada.cruzamentos
      .filter((c: Cruzamento) => c.competencia_id === this.selectedCompetencia!.id)
      .forEach((cruzamento: Cruzamento) => {
        subfuncoesComCruzamento.add(cruzamento.subfuncao_id);
      });
    
    return (this.selectedFuncao.subfuncoes || []).filter((s: Subfuncao) => subfuncoesComCruzamento.has(s.id));
  }

  get conhecimentosDisponiveis(): Conhecimento[] {
    if (!this.selectedCompetencia || !this.selectedSubfuncao) return [];
    
    // Filtrar conhecimentos baseado nos cruzamentos válidos
    if (!this.matrizSelecionada?.cruzamentos) return [];
    
    const conhecimentosValidos = this.matrizSelecionada.cruzamentos
      .filter((c: Cruzamento) => 
        c.competencia_id === this.selectedCompetencia!.id && 
        c.subfuncao_id === this.selectedSubfuncao!.id
      )
      .map((c: Cruzamento) => c.conhecimento_id);
    
    return (this.matrizSelecionada?.conhecimentos || [])
      .filter((k: Conhecimento) => conhecimentosValidos.includes(k.id));
  }

  // Helper para verificar se um select deve estar habilitado
  isCategoriaEnabled(): boolean {
    return !!this.formData.matriz_id;
  }

  isCompetenciaEnabled(): boolean {
    return !!this.selectedCategoria;
  }

  isFuncaoEnabled(): boolean {
    return !!this.selectedCompetencia;
  }

  isSubfuncaoEnabled(): boolean {
    return !!this.selectedFuncao;
  }

  isConhecimentoEnabled(): boolean {
    return !!this.selectedSubfuncao;
  }
}