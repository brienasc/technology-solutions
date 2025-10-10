import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MatrixViewerDialogService {
  private _open$ = new Subject<string>();
  private _close$ = new Subject<void>();

  open(id: string) { this._open$.next(id); }
  close() { this._close$.next(); }

  get open$() { return this._open$.asObservable(); }
  get close$() { return this._close$.asObservable(); }
}
