import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ImportMatrixPayload } from '../../models/matrix.model';
import { ImportMatrixDialogService, CourseOption } from './import-matrix-dialog.service';

function validityRangeValidator(group: AbstractControl) {
  const from = group.get('validFrom')?.value as string | null;
  const to = group.get('validTo')?.value as string | null;
  if (!from || !to) return null;
  const dFrom = new Date(from);
  const dTo = new Date(to);
  return dFrom.getTime() <= dTo.getTime() ? null : { range: true };
}

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
  private cdr = inject(ChangeDetectorRef);
  private el: ElementRef<HTMLElement> = inject(ElementRef);
  private svc = inject(ImportMatrixDialogService);

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
  }, { validators: validityRangeValidator });

  courseOpen = false;
  courseQuery = '';
  courseOptions: CourseOption[] = [];

  show() {
    this.visible = true;
    this.errorMsg = null;
    this.submitting = false;
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
    this.fetchCourses(q);
  }

  private fetchCourses(q: string) {
    this.loadingCourses = true;
    this.cdr.markForCheck();
    this.svc.getCourses(q).subscribe({
      next: list => {
        this.courseOptions = list;
        this.loadingCourses = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.courseOptions = [];
        this.loadingCourses = false;
        this.cdr.markForCheck();
      }
    });
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
