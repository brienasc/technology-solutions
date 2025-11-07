import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseItemsService } from '../../services/cursos-itens.service';
import { ItemAvaliacao } from '../../models/item-avaliacao.model';
import { NotificationService } from '../../services/notification.service';
import { AlertModalComponent } from '../alert/alert.component';
import { AlertAction, AlertVariant } from '../../models/alert.model';

interface Alternativa {
  texto: string;
  correta: boolean;
  explicacao: string;
}

@Component({
  selector: 'app-item-view-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertModalComponent],
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

  // Alert state
  alertOpen = false;
  alertTitle = '';
  alertMessage = '';
  alertDescription = '';
  alertVariant: AlertVariant = 'neutral';
  alertActions: AlertAction[] = [];

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
      this.showErrorAlert(
        'Formulário Incompleto',
        'Por favor, preencha todos os campos obrigatórios e marque exatamente uma alternativa como correta.'
      );
      return;
    }

    this.loading = true;

    const itemData = {
      comando: this.comando.trim(),
      contexto: this.contexto?.trim() || '',
      dificuldade: this.dificuldade,
      alternativas: this.alternativas,
      finalizar: false
    };

    this.service.updateItem(this.itemId, itemData).subscribe({
      next: () => {
        this.loading = false;
        this.isEditMode = false;
        this.showSuccessAlert(
          'Sucesso!',
          'Item salvo como rascunho com sucesso.'
        );
        setTimeout(() => {
          this.itemUpdated.emit();
          this.loadItem();
        }, 1500);
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        console.error('Erro ao salvar item:', error);
        this.showErrorAlert(
          'Erro ao Salvar',
          'Erro ao salvar item. Tente novamente.'
        );
        this.cdr.markForCheck();
      }
    });
  }

  onFinalize(): void {
    if (!this.isValidForm()) {
      this.showErrorAlert(
        'Formulário Incompleto',
        'Por favor, preencha todos os campos obrigatórios e marque exatamente uma alternativa como correta.'
      );
      return;
    }

    this.showConfirmAlert(
      'Finalizar Item',
      'Após finalizar, o item não poderá mais ser editado. Deseja continuar?',
      [
        { id: 'cancel', label: 'Cancelar', kind: 'ghost' },
        { id: 'finalize', label: 'Finalizar', kind: 'primary', autofocus: true }
      ]
    );
  }

  private performFinalization(): void {
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
        this.showSuccessAlert(
          'Sucesso!',
          'Item finalizado com sucesso.'
        );
        setTimeout(() => {
          this.itemUpdated.emit();
          this.loadItem();
        }, 1500);
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        console.error('Erro ao finalizar item:', error);
        this.showErrorAlert(
          'Erro ao Finalizar',
          'Erro ao finalizar item. Tente novamente.'
        );
        this.cdr.markForCheck();
      }
    });
  }

  onCalibrate(): void {
    this.showConfirmAlert(
      'Confirmar Calibração',
      'Deseja marcar este item como calibrado?',
      [
        { id: 'cancel', label: 'Cancelar', kind: 'ghost' },
        { id: 'calibrate', label: 'Calibrar', kind: 'primary', autofocus: true }
      ]
    );
  }

  private performCalibration(): void {
    this.loading = true;

    this.service.calibrateItem(this.itemId).subscribe({
      next: (data) => {
        console.log('Calibração bem-sucedida:', data);
        this.loading = false;
        this.showSuccessAlert(
          'Sucesso!',
          'Item marcado como calibrado com sucesso.'
        );
        setTimeout(() => {
          this.itemUpdated.emit();
          this.loadItem();
        }, 1500);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erro detalhado ao calibrar:', error);
        this.loading = false;
        
        let errorMessage = 'Erro inesperado ao calibrar item.';
        
        if (error.status === 200 || error.status === 201) {
          this.showSuccessAlert(
            'Sucesso!',
            'Item calibrado com sucesso.'
          );
          setTimeout(() => {
            this.itemUpdated.emit();
            this.loadItem();
          }, 1500);
          return;
        }
        
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        this.showErrorAlert(
          'Erro na Calibração',
          errorMessage
        );
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

  get canCalibrate(): boolean {
    return this.item?.status === 1; // Só pode calibrar itens finalizados
  }

  get statusText(): string {
    const statusMap: { [key: number]: string } = {
      0: 'Rascunho',
      1: 'Finalizado',
      2: 'Calibrado'
    };
    return statusMap[this.item?.status] || 'Desconhecido';
  }

  get dificuldadeText(): string {
    const option = this.dificuldadeOptions.find(opt => opt.value === this.item?.dificuldade);
    return option?.label || 'Não definido';
  }

  getAlternativaLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // Métodos para alertas
  private showConfirmAlert(title: string, message: string, actions: AlertAction[]): void {
    this.alertTitle = title;
    this.alertMessage = message;
    this.alertVariant = 'warning';
    this.alertActions = actions;
    this.alertOpen = true;
  }

  private showSuccessAlert(title: string, message: string): void {
    this.alertTitle = title;
    this.alertMessage = message;
    this.alertVariant = 'success';
    this.alertActions = [
      { id: 'ok', label: 'OK', kind: 'primary', autofocus: true }
    ];
    this.alertOpen = true;
  }

  private showErrorAlert(title: string, message: string): void {
    this.alertTitle = title;
    this.alertMessage = message;
    this.alertVariant = 'danger';
    this.alertActions = [
      { id: 'ok', label: 'OK', kind: 'primary', autofocus: true }
    ];
    this.alertOpen = true;
  }

  onAlertAction(action: AlertAction): void {
    this.alertOpen = false;
    
    switch (action.id) {
      case 'calibrate':
        this.performCalibration();
        break;
      case 'finalize':
        this.performFinalization();
        break;
    }
  }

  onAlertClosed(): void {
    this.alertOpen = false;
  }
}