import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseItemsService } from '../../services/cursos-itens.service';
import { ItemAvaliacao } from '../../models/item-avaliacao.model';
import { NotificationService } from '../../services/notification.service';

interface Alternativa {
  texto: string;
  correta: boolean;
  explicacao: string;
}

@Component({
  selector: 'app-item-view-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-view-edit-modal.component.html',
  styleUrls: ['./item-view-edit-modal.component.css']
})
export class ItemViewEditModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() itemId = '';
  @Output() close = new EventEmitter<void>();
  @Output() itemUpdated = new EventEmitter<void>();

  loading = false;
  isEditMode = false;
  item: any = null;
  originalItem: any = null;

  // Dados do formulário
  comando = '';
  contexto = '';
  dificuldade = 3;
  alternativas: Alternativa[] = [
    { texto: '', correta: false, explicacao: '' },
    { texto: '', correta: false, explicacao: '' },
    { texto: '', correta: false, explicacao: '' },
    { texto: '', correta: false, explicacao: '' },
    { texto: '', correta: false, explicacao: '' }
  ];

  dificuldadeOptions = [
    { value: 1, label: 'Muito Fácil' },
    { value: 2, label: 'Fácil' },
    { value: 3, label: 'Média' },
    { value: 4, label: 'Difícil' },
    { value: 5, label: 'Muito Difícil' }
  ];

  constructor(
    private service: CourseItemsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.isOpen && this.itemId) {
      this.loadItem();
    }
  }

  ngOnChanges(): void {
    if (this.isOpen && this.itemId) {
      this.loadItem();
    }
  }

  loadItem(): void {
    this.loading = true;
    this.service.getItem(this.itemId).subscribe({
      next: (data) => {
        this.item = data;
        this.originalItem = JSON.parse(JSON.stringify(data));
        this.populateForm();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.onClose();
        this.cdr.markForCheck();
      }
    });
  }

  populateForm(): void {
    if (!this.item) return;

    this.comando = this.item.comando || '';
    this.contexto = this.item.contexto || '';
    this.dificuldade = this.item.dificuldade || 3;

    // Preencher alternativas
    if (this.item.alternativas && Array.isArray(this.item.alternativas)) {
      this.item.alternativas.forEach((alt: any, index: number) => {
        if (index < 5) {
          this.alternativas[index] = {
            texto: alt.texto || '',
            correta: alt.correta || false,
            explicacao: alt.explicacao || ''
          };
        }
      });
    }
  }

  onClose(): void {
    this.isEditMode = false;
    this.item = null;
    this.originalItem = null;
    this.resetForm();
    this.close.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  resetForm(): void {
    this.comando = '';
    this.contexto = '';
    this.dificuldade = 3;
    this.alternativas = [
      { texto: '', correta: false, explicacao: '' },
      { texto: '', correta: false, explicacao: '' },
      { texto: '', correta: false, explicacao: '' },
      { texto: '', correta: false, explicacao: '' },
      { texto: '', correta: false, explicacao: '' }
    ];
  }

  onEdit(): void {
    // Só pode editar se for rascunho (status = 0)
    if (this.item?.status === 0) {
      this.isEditMode = true;
    }
  }

  onCancelEdit(): void {
    this.isEditMode = false;
    this.populateForm(); // Restaurar dados originais
  }

  onSave(): void {
    if (!this.isValidForm()) {
      alert('Por favor, preencha todos os campos obrigatórios e marque exatamente uma alternativa como correta.');
      return;
    }

    this.loading = true;

    const itemData = {
      comando: this.comando.trim(),
      contexto: this.contexto?.trim() || '',
      dificuldade: this.dificuldade,
      alternativas: this.alternativas,
      finalizar: false // Manter como rascunho
    };

    this.service.updateItem(this.itemId, itemData).subscribe({
      next: () => {
        this.loading = false;
        this.isEditMode = false;
        this.itemUpdated.emit();
        this.loadItem(); // Recarregar dados atualizados
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        console.error('Erro ao salvar item:', error);
        alert('Erro ao salvar item. Tente novamente.');
        this.cdr.markForCheck();
      }
    });
  }

  onFinalize(): void {
    if (!this.isValidForm()) {
      alert('Por favor, preencha todos os campos obrigatórios e marque exatamente uma alternativa como correta.');
      return;
    }

    const confirmFinalize = confirm('Após finalizar, o item não poderá mais ser editado. Deseja continuar?');
    if (!confirmFinalize) return;

    this.loading = true;

    const itemData = {
      comando: this.comando.trim(),
      contexto: this.contexto?.trim() || '',
      dificuldade: this.dificuldade,
      alternativas: this.alternativas,
      finalizar: true // Finalizar item
    };

    this.service.updateItem(this.itemId, itemData).subscribe({
      next: () => {
        this.loading = false;
        this.isEditMode = false;
        this.itemUpdated.emit();
        this.loadItem(); // Recarregar dados atualizados
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        console.error('Erro ao finalizar item:', error);
        alert('Erro ao finalizar item. Tente novamente.');
        this.cdr.markForCheck();
      }
    });
  }

  isValidForm(): boolean {
    // Verificar se comando está preenchido
    if (!this.comando.trim()) return false;

    // Verificar se todas as alternativas têm texto
    const hasEmptyAlternative = this.alternativas.some(alt => !alt.texto.trim());
    if (hasEmptyAlternative) return false;

    // Verificar se há exatamente uma alternativa correta
    const correctCount = this.alternativas.filter(alt => alt.correta).length;
    return correctCount === 1;
  }

  onAlternativaCorretaChange(index: number): void {
    // Desmarcar todas as outras quando uma for marcada
    this.alternativas.forEach((alt, i) => {
      if (i !== index) {
        alt.correta = false;
      }
    });
  }

  get canEdit(): boolean {
    return this.item?.status === 0; // Só pode editar rascunhos
  }

  get statusText(): string {
    const statusMap: { [key: number]: string } = {
      0: 'Rascunho',
      1: 'Finalizado',
      2: 'Arquivado'
    };
    return statusMap[this.item?.status] || 'Desconhecido';
  }

  get dificuldadeText(): string {
    const option = this.dificuldadeOptions.find(opt => opt.value === this.item?.dificuldade);
    return option?.label || 'Não definido';
  }

  // Adicionar este método
  getAlternativaLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }
}