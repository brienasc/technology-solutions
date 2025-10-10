import { Injectable, ApplicationRef, EnvironmentInjector, createComponent, ComponentRef, inject } from '@angular/core';
import { ImportMatrixDialogComponent } from './import-matrix-dialog.component';
import { ImportMatrixPayload } from '../../models/matrix.model';

@Injectable({ providedIn: 'root' })
export class ImportMatrixDialogService {
  private appRef = inject(ApplicationRef);
  private env = inject(EnvironmentInjector);
  private cmpRef: ComponentRef<ImportMatrixDialogComponent> | null = null;

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
}
