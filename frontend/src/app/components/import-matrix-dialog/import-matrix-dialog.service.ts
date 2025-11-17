import { Injectable, ApplicationRef, EnvironmentInjector, createComponent, ComponentRef, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, of, catchError, tap } from 'rxjs';
import { ImportMatrixDialogComponent } from './import-matrix-dialog.component';
import { ImportMatrixPayload } from '../../models/matrix.model';

import { environment } from '../../../environments/environment';

export type CourseOption = { id: string; nome: string };

@Injectable({ providedIn: 'root' })
export class ImportMatrixDialogService {
  private appRef = inject(ApplicationRef);
  private env = inject(EnvironmentInjector);
  private http = inject(HttpClient);
  private cmpRef: ComponentRef<ImportMatrixDialogComponent> | null = null;
  private readonly baseUrl = environment.apiUrl
  private cachedCourses: CourseOption[] = [];

  openAndWait(): Promise<ImportMatrixPayload | null> {
    this.close();
    this.cmpRef = createComponent(ImportMatrixDialogComponent, {
      environmentInjector: this.env
    });
    document.body.appendChild(this.cmpRef.location.nativeElement);
    this.appRef.attachView(this.cmpRef.hostView);
    return new Promise<ImportMatrixPayload | null>((resolve) => {
      const inst = this.cmpRef!.instance;
      inst._complete = (result: ImportMatrixPayload | null) => {
        resolve(result);
        this.close();
      };
      inst.show();
    });
  }

  close() {
    if (!this.cmpRef) return;
    this.appRef.detachView(this.cmpRef.hostView);
    this.cmpRef.destroy();
    this.cmpRef = null;
  }

  getCourses(term: string) {
    if (this.cachedCourses.length) {
      return of(this.filter(term, this.cachedCourses));
    }
    return this.http.get<{ status: string; data: CourseOption[] }>(`${this.baseUrl}/cursos/summary`).pipe(
      map(res => res?.data ?? []),
      tap(list => this.cachedCourses = list),
      map(list => this.filter(term, list)),
      catchError(() => {
        this.cachedCourses = [];
        return of<CourseOption[]>([]);
      })
    );
  }

  private filter(q: string, list: CourseOption[]): CourseOption[] {
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
}
