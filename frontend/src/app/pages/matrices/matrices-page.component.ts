import { ChangeDetectionStrategy, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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

@Component({
  selector: 'app-matrices-page',
  standalone: true,
  imports: [
    CommonModule, Header, AccessibilityBarComponent, FormsModule,
    MatricesTableComponent, MatrixViewerDialogComponent, ImportMatrixDialogComponent
  ],
  templateUrl: './matrices-page.component.html',
  styleUrls: ['./matrices-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MatricesPageComponent {
  loading = false;
  data: Matrix[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  lastPage = 1;
  totalItems = 0;
  totalPages = 1;
  searchTerm = '';
  showSuccessMessage = false;
  showErrorMessage = false;
  successMessageText = '';
  errorMessageText = '';
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

  constructor(
    private matrices: MatricesService,
    private cdr: ChangeDetectorRef,
    private matrixViewer: MatrixViewerDialogService,
    private importDialog: ImportMatrixDialogService
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
      this.onDelete(e.row);
    }
  }

  onViewDetails(row: Matrix) {
    console.log("abrindo Detalhes, começo");
    console.log(row)
    console.log("abrindo Detalhes, fim");
    this.matrixViewer.open(row.id);
  }

  onDelete(_row: Matrix) {
    this.matrices.deleteMatrix(_row.id).subscribe({
      next: (response) => {
        console.log('Matriz removida com sucesso!', response);
        alert('Matriz removida com sucesso!');
        this.fetch(true);
      },
      error: (err) => {
        console.error('Erro ao remover matriz: ', err);

        if (err.status === 422) {
          console.log('Erro de validação');
        } else {
          console.log('Ocorreu um erro inesperado no servidor.');
        }
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

      this.matrices.importMatrix(formData).subscribe({
        next: (response) => {
          console.log('Matriz importada com sucesso!', response);
          alert('Matriz importada com sucesso!');
          this.fetch(true);

        },
        error: (err) => {
          console.error('Erro ao importar matriz: ', err);

          if (err.status === 422) {
            console.log('Erro de validação');
          } else {
            console.log('Ocorreu um erro inesperado no servidor.');
          }
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
