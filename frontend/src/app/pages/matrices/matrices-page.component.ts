import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  NgZone, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatricesService } from '../../services/matrices.service';
import { Matrix } from '../../models/matrix.model';
import { TableColumn } from '../../models/table.model';
import { MatricesTableComponent } from '../../components/matrices-table/matrices-table.component';
import { Header } from '../../components/header/header';
import { AccessibilityBarComponent } from '../../components/accessibility-bar/accessibility-bar';
import { MatrixViewerDialogService } from '../../components/matrix-viewer-dialog/matrix-viewer-dialog.service';
import { MatrixViewerDialogComponent } from '../../components/matrix-viewer-dialog/matrix-viewer-dialog.component';
import { ImportMatrixDialogService } from '../../components/import-matrix-dialog/import-matrix-dialog.service';
import { ImportMatrixDialogComponent } from '../../components/import-matrix-dialog/import-matrix-dialog.component';
import { AlertVariant, AlertAction } from '../../models/alert.model';
import { AlertModalComponent } from '../../components/alert/alert.component';
import { finalize, timeout } from 'rxjs';
import { MatrixErrorsModalComponent } from '../../components/matrix-errors-modal/matrix-errors-modal.component';

@Component({
  selector: 'app-matrices-page',
  standalone: true,
  imports: [
    CommonModule, Header, AccessibilityBarComponent, FormsModule,
    MatricesTableComponent, MatrixViewerDialogComponent, ImportMatrixDialogComponent,
    AlertModalComponent, MatrixErrorsModalComponent
  ],
  templateUrl: './matrices-page.component.html',
  styleUrls: ['./matrices-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MatricesPageComponent {
  columns: TableColumn[] = [
    { name: 'name', label: 'Nome', property: 'name', type: 'text' },
    { name: 'version', label: 'Versão', property: 'version', type: 'text' },
    { name: 'course', label: 'Curso', property: 'courseName', type: 'text' },
    { name: 'validity', label: 'Vigencia', property: 'validityLabel', type: 'date' },
    {
      name: 'actions', label: 'Ações', property: '__actions__', type: 'action', actions: [
        { label: 'Detalhes', actionKey: 'viewDetails' },
        { label: 'Excluir', actionKey: 'delete' }
      ]
    }
  ];
  data: Matrix[] = [];

  alertActions: AlertAction[] = [
    { id: 'ok', label: 'OK', kind: 'primary', autofocus: true }
  ];
  alertDeleteActions: AlertAction[] = [
    { id: 'ok', label: 'Excluir', kind: 'primary', autofocus: true },
    { id: 'cancelar', label: 'Cancelar', kind: 'secondary', autofocus: true }
  ];
  loading = false;
  isImporting = false;
  showErrorMessage = false;
  showSuccessMessage = false;
  currentPage = 1;
  itemsPerPage = 10;
  lastPage = 1;
  totalItems = 0;
  totalPages = 1;
  searchTerm = '';
  successMessageText = '';
  errorMessageText = '';

  showInfoPopUp: boolean = false;
  alertInfo: AlertVariant = 'neutral'
  alertInfoTitle = '';
  alertInfoMessage = '';

  alertDelete: AlertVariant = 'danger';
  alertDeleteTitle: string = '';
  alertDeleteMessage: string = '';
  alertDeleteDescription: string = '';
  showDeletePopUp: boolean = false;
  onDeleteRow: Matrix | undefined = undefined;

  showErrorsModal: boolean = false;
  matrixImportResponse: any = null;

  constructor(
    private matrices: MatricesService,
    private matrixViewer: MatrixViewerDialogService,
    private importDialog: ImportMatrixDialogService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.fetch(true);
  }

  fetch(ignoreSearch = false) {
    this.loading = true;
    this.showErrorMessage = false;
    this.showSuccessMessage = false;
    this.successMessageText = '';
    this.errorMessageText = '';


    const includes = ['curso'];
    const qp: any = { page: this.currentPage, perPage: this.itemsPerPage, include: includes };

    if (!ignoreSearch && this.searchTerm.trim()) {
      qp.q = this.searchTerm.trim();
    }

    this.matrices.getMatrices(qp).subscribe({
      next: res => {
        const rawData = res.data || [];
        this.data = rawData.map(r => ({
          ...r,
          validityLabel: this.makeValidityLabel(r.validFrom, r.validTo)
        }));

        this.currentPage = res.current_page || 1;
        this.itemsPerPage = res.per_page || this.itemsPerPage;
        this.totalItems = res.total ?? this.data.length;
        this.lastPage = res.last_page || 1;
        this.totalPages = this.lastPage;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessageText = 'Falha ao carregar matrizes.';
        this.showErrorMessage = true;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onBuscar() {
    this.currentPage = 1;
    this.fetch();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.fetch(true);
  }

  goToPage(p: number) {
    if (p < 1 || p > this.lastPage) {
      return;
    }

    this.currentPage = p;
    this.fetch(true);
  }

  goToPrevious() {
    this.goToPage(this.currentPage - 1);
  }

  goToNext() {
    this.goToPage(this.currentPage + 1);
  }

  getStartIndex() {
    if (!this.totalItems) {
      return 0;
    }

    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex() {
    const end = this.currentPage * this.itemsPerPage;

    return end > this.totalItems ? this.totalItems : end;
  }

  onRowAction(e: { action: string; row: Matrix }) {
    if (e.action === 'details') {
      this.onViewDetails(e.row);
    }

    if (e.action === 'delete') {
      this.onDeletePopup(e.row);
    }
  }

  onViewDetails(row: Matrix) {
    this.matrixViewer.open(row.id);
  }

  onDeletePopup(_row: Matrix) {
    this.showDeletePopUp = true;
    this.alertDeleteTitle = 'Excluir matriz?';
    this.alertDeleteMessage = 'Tem certeza de que deseja excluir esta matriz?';
    this.alertDeleteDescription = 'Esta ação é irreversível.';

    this.onDeleteRow = _row;
  }

  onDeleteCbk(event: AlertAction) {
    this.showDeletePopUp = false;
    if (event === undefined || this.onDeleteRow === undefined || event.id !== "ok") {
      this.onDeleteRow = undefined;
      return;
    }

    const row = this.onDeleteRow;
    this.onDelete(row);
  }

  private onDelete(_row: Matrix) {
    this.matrices.deleteMatrix(_row.id).pipe(
      timeout(15000),
    ).subscribe({
      next: (response) => {
        this.alertInfo = "info"
        this.alertInfoTitle = "Deletar matriz";
        this.alertInfoMessage = "Matriz apagada com sucesso!";
        this.showInfoPopUp = true;
        this.fetch(true);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.alertInfo = "warning"
        this.alertInfoTitle = "Deletar matriz";
        this.alertInfoMessage = "Erro ao apagar matriz!";
        this.showInfoPopUp = true;
        this.cdr.markForCheck();
      }
    });
  }

  onImportMatrix() {
    this.importDialog.openAndWait().then(result => {
      if (!result) {
        return;
      }

      const formData = new FormData();

      formData.append('nome', result.name);
      formData.append('versao', result.version);
      formData.append('vigente_de', result.validFrom);
      formData.append('vigente_ate', result.validTo);
      formData.append('curso_id', result.courseId);

      if (result.file) {
        formData.append('file', result.file, result.file.name);
      }

      this.matrices.importMatrix(formData).pipe(
        timeout(15000),
        finalize(() => {
          this.isImporting = false;
          this.cdr.markForCheck();
        })
      ).subscribe({
        next: (response) => {
          this.zone.run(() => {
            if (response?.data?.has_errors === true) {
              this.matrixImportResponse = response;
              this.showErrorsModal = true;
              this.cdr.markForCheck();

              return;
            }

            this.alertInfoTitle = 'Importação de Matriz';
            this.alertInfoMessage = response?.message || 'Matriz importada com sucesso!';
            this.alertInfo = 'success';
            this.showInfoPopUp = true;
            this.fetch(true);
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.alertInfoTitle = 'Importação de Matriz';
            this.alertInfoMessage = err?.name === 'TimeoutError'
              ? 'Tempo de conexão esgotado. Verifique o servidor e tente novamente.'
              : 'Erro ao importar matriz!';
            this.alertInfo = 'warning';
            this.showInfoPopUp = true;
            this.cdr.markForCheck();
          });
          console.error('Erro ao importar matriz: ', err);
        }
      });
    });
  }

  private makeValidityLabel(from?: Date | string | null, to?: Date | string | null): string {
    const ini = this.safeFormatDate(from);
    const fim = this.safeFormatDate(to);

    return `${ini} - ${fim}`;
  }

  private safeFormatDate(d?: Date | string | null): string {
    if (!d) {
      return '—';
    }

    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat('pt-BR').format(dt);
  }
}
