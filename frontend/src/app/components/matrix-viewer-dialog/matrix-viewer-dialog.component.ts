import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatrixViewerDialogService } from './matrix-viewer-dialog.service';
import { MatricesService } from '../../services/matrices.service';
import { MatrixDetail } from '../../models/matrix.model';

type ConhecimentoMin = {
  id: string;
  codigo: number;
  nome: string;
};

type FlatCompetencia = { id: string; nome: string; catId: string; catNome: string };

@Component({
  selector: 'app-matrix-viewer-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './matrix-viewer-dialog.component.html',
  styleUrls: ['./matrix-viewer-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixViewerDialogComponent implements OnInit, OnDestroy {
  private bus = inject(MatrixViewerDialogService);
  private matrices = inject(MatricesService);
  private cdr = inject(ChangeDetectorRef);

  private sub?: Subscription;

  visible = false;
  loading = false;
  error = '';

  data?: MatrixDetail;

  categorias: MatrixDetail['categorias'] = [];
  funcoes: MatrixDetail['funcoes'] = [];
  competenciasFlat: FlatCompetencia[] = [];

  cellMap = new Map<string, ConhecimentoMin[]>();
  private key = (subId: string, compId: string) => `${subId}__${compId}`;

  // colapse/expand
  expandedSubfuncoes = new Set<string>();
  expandedFuncoes = new Set<string>();
  expandedCats = new Set<string>();
  expandedComps = new Set<string>();

  toggleSubfunc(id: string) { this._toggle(this.expandedSubfuncoes, id); }
  isSubfuncExpanded(id: string) { return this.expandedSubfuncoes.has(id); }

  toggleFunc(id: string) { this._toggle(this.expandedFuncoes, id); }
  isFuncExpanded(id: string) { return this.expandedFuncoes.has(id); }

  toggleCat(id: string) { this._toggle(this.expandedCats, id); }
  isCatExpanded(id: string) { return this.expandedCats.has(id); }

  toggleComp(id: string) { this._toggle(this.expandedComps, id); }
  isCompExpanded(id: string) { return this.expandedComps.has(id); }

  private _toggle(set: Set<string>, id: string) {
    if (set.has(id)) set.delete(id); else set.add(id);
  }

  popoverVisible = false;
  popoverText = '';
  popoverX = 0;
  popoverY = 0;

  @ViewChild('gridScroller', { static: false }) gridScroller?: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.sub = this.bus.open$.subscribe((id) => this.openAndLoad(id));
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  close(): void {
    this.visible = false;
    this.loading = false;
    this.error = '';
    this.data = undefined;
    this.categorias = [];
    this.funcoes = [];
    this.competenciasFlat = [];
    this.cellMap.clear();
    this.expandedSubfuncoes.clear();
    this.expandedFuncoes.clear();
    this.expandedCats.clear();
    this.expandedComps.clear();
    this.hidePopover();
    this.cdr.markForCheck();
  }

  private openAndLoad(id: string) {
    this.visible = true;
    this.loading = true;
    this.error = '';
    this.hidePopover();
    this.cdr.markForCheck();

    this.matrices.getMatrix(id).subscribe({
      next: (resp: any) => {
        const d: MatrixDetail = (resp?.data ?? resp) as MatrixDetail;

        this.data = d;
        this.categorias = d.categorias ?? [];
        this.funcoes = d.funcoes ?? [];

        const list: FlatCompetencia[] = [];
        for (const cat of this.categorias) {
          for (const c of cat.competencias ?? []) {
            list.push({ id: c.id, nome: c.nome, catId: cat.id, catNome: cat.nome });
          }
        }
        this.competenciasFlat = list;

        this.cellMap.clear();
        for (const x of d.cruzamentos ?? []) {
          const k = this.key(x.subfuncao_id, x.competencia_id);
          const prev = this.cellMap.get(k) ?? [];
          
          if (x.conhecimento_id) {
            const conhecimento = d.conhecimentos?.find(c => c.id === x.conhecimento_id);
            if (conhecimento) {
              prev.push({
                id: conhecimento.id,
                codigo: conhecimento.codigo,
                nome: conhecimento.nome
              });
            }
          }
          this.cellMap.set(k, prev);
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Falha ao carregar a matriz.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  countCompetenciasBy(catId: string) {
    return this.competenciasFlat.filter((c) => c.catId === catId).length;
  }

  validityLabel(d?: MatrixDetail) {
    const fmt = (s?: string | null) => {
      if (!s) return '—';
      const dt = new Date(s);
      return isNaN(dt.getTime()) ? '—' : new Intl.DateTimeFormat('pt-BR').format(dt);
    };
    return `${fmt(d?.validFrom)} — ${fmt(d?.validTo)}`;
  }

  onCodeClick(ev: MouseEvent, item: ConhecimentoMin) {
    ev.preventDefault();
    ev.stopPropagation();
    const t = ev.currentTarget as HTMLElement;
    const r = t.getBoundingClientRect();
    const pad = 8, width = 260;
    const left = Math.min(Math.max(r.left + r.width / 2 - width / 2, pad), window.innerWidth - width - pad);
    const top = Math.max(r.top - 10, 10);
    this.popoverX = left;
    this.popoverY = top;
    this.popoverText = `${item.codigo} — ${item.nome}`;
    this.popoverVisible = true;
    this.cdr.markForCheck();
  }

  maybeHidePopover(ev: MouseEvent) {
    const el = ev.target as HTMLElement;
    if (!el.closest('.code')) this.hidePopover();
  }
  onGridScroll() {
    if (this.popoverVisible) this.hidePopover();
  }
  private hidePopover() { this.popoverVisible = false; this.popoverText = ''; }
}
