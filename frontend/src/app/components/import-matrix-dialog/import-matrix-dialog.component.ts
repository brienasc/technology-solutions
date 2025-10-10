import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ImportMatrixPayload } from '../../models/matrix.model';

type CourseOption = { id: string; nome: string };

@Component({
  selector: 'app-import-matrix-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './import-matrix-dialog.component.html',
  styleUrls: ['./import-matrix-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportMatrixDialogComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private el: ElementRef<HTMLElement> = inject(ElementRef);

  visible = false;
  submitting = false;
  loadingCourses = false;
  errorMsg: string | null = null;

  _complete: (result: ImportMatrixPayload | null) => void = () => { };

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    version: ['', [Validators.required, Validators.maxLength(20)]],
    validFrom: ['', [Validators.required]],
    validTo: ['', [Validators.required]],
    courseId: ['', [Validators.required]],
    courseName: [''],
    file: [null, [Validators.required]]
  }, { validators: this.validityRangeValidator });

  courseOpen = false;
  courseQuery = '';
  courseOptions: CourseOption[] = [];

  /** cache local (primeira busca carrega tudo; demais filtram aqui) */
  private allCourses: CourseOption[] = [];

  show() {
    this.visible = true;
    this.errorMsg = null;
    this.submitting = false;

    // carrega a lista apenas se ainda não carregou
    this.fetchCourses('');

    setTimeout(() => {
      const first = this.el.nativeElement.querySelector<HTMLInputElement>('#im-name');
      first?.focus();
    }, 0);

    document.addEventListener('keydown', this.handleEsc, { capture: true });
  }

  hide() {
    this.visible = false;
    document.removeEventListener('keydown', this.handleEsc, { capture: true });
  }

  overlayClick() { this.cancel(); }
  stop(e: MouseEvent) { e.stopPropagation(); }

  private handleEsc = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      this.cancel();
    }
  };

  private validityRangeValidator(group: AbstractControl) {
    const from = group.get('validFrom')?.value as string | null;
    const to = group.get('validTo')?.value as string | null;
    if (!from || !to) return null;
    const dFrom = new Date(from);
    const dTo = new Date(to);
    return dFrom.getTime() <= dTo.getTime() ? null : { range: true };
  }

  openCourse() {
    this.courseOpen = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      const input = this.el.nativeElement.querySelector<HTMLInputElement>('#im-course-search');
      input?.focus();
    }, 0);
  }

  closeCourse() {
    this.courseOpen = false;
    this.cdr.markForCheck();
  }

  toggleCourse() {
    this.courseOpen ? this.closeCourse() : this.openCourse();
  }

  onCourseQuery(q: string) {
    this.courseQuery = q;
    this.fetchCourses(q); // agora só filtra localmente após o primeiro load
  }

  /**
   * Busca inicial (uma vez). Depois disso, só filtra localmente (sem HTTP).
   */
  fetchCourses(q: string) {
    // Se já temos cache, apenas filtra localmente.
    if (this.allCourses.length) {
      this.courseOptions = this.filterCoursesLocal(q, this.allCourses);
      this.loadingCourses = false;
      this.cdr.markForCheck();
      return;
    }

    // Primeira carga: busca no servidor sem 'q' e guarda em cache.
    this.loadingCourses = true;
    this.cdr.markForCheck();

    // Sem parâmetros de busca — carrega todas (ou o resumo padrão que sua API retornar)
    this.http.get<{ status: string; data: CourseOption[] }>('/api/cursos/summary')
      .subscribe({
        next: res => {
          this.allCourses = res?.data ?? [];
          this.courseOptions = this.filterCoursesLocal(q, this.allCourses);
          this.cdr.markForCheck();
        },
        error: () => {
          this.allCourses = [];
          this.courseOptions = [];
          this.cdr.markForCheck();
        },
        complete: () => {
          this.loadingCourses = false;
          this.cdr.markForCheck();
        }
      });
  }

  /** filtro case-insensitive e acento-insensitive */
  private filterCoursesLocal(q: string, list: CourseOption[]): CourseOption[] {
    const term = this.normalize(q);
    if (!term) return [...list];
    return list.filter(c => this.normalize(c.nome).includes(term));
  }

  private normalize(s: string | null | undefined): string {
    return (s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
  }

  selectCourse(opt: CourseOption) {
    this.form.patchValue({ courseId: opt.id, courseName: opt.nome });
    this.closeCourse();
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;
    this.form.patchValue({ file });
    this.form.get('file')?.markAsDirty();
    this.cdr.markForCheck();
  }

  removeFile() {
    this.form.patchValue({ file: null });
    const fileInput = this.el.nativeElement.querySelector<HTMLInputElement>('#im-file');
    if (fileInput) fileInput.value = '';
    this.cdr.markForCheck();
  }

  get fileName(): string {
    const f = this.form.value.file as File | null;
    return f ? f.name : '';
  }

  submit() {
    this.errorMsg = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Preencha os campos obrigatórios corretamente.';
      this.cdr.markForCheck();
      return;
    }

    this.submitting = true;
    this.cdr.markForCheck();

    const v = this.form.value;
    const payload: ImportMatrixPayload = {
      name: v.name,
      version: v.version,
      validFrom: v.validFrom,
      validTo: v.validTo,
      courseId: v.courseId,
      file: v.file ?? null
    };

    this._complete(payload);
  }

  cancel() {
    this._complete(null);
  }
}
