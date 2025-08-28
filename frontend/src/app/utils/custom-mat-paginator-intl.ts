// frontend/src/app/shared/custom-mat-paginator-intl.ts
import { MatPaginatorIntl } from '@angular/material/paginator';

/**
 * Classe de internacionalização personalizada para o MatPaginator.
 * Traduz as strings padrão do paginador para o português.
 */
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
  // Rótulo para o seletor de itens por página
  override itemsPerPageLabel = 'Itens por página:';
  
  // Rótulo para a página anterior
 override nextPageLabel = 'Próxima página';
  
  // Rótulo para a página anterior
  override previousPageLabel = 'Página anterior';
  
  // Rótulo para a primeira página
  override firstPageLabel = 'Primeira página';
  
  // Rótulo para a última página
override  lastPageLabel = 'Última página';

  /**
   * Retorna o rótulo de intervalo para o paginador (ex: "1-10 de 100").
   * @param page O índice da página atual (base zero).
   * @param pageSize O número de itens por página.
   * @param length O número total de itens.
   * @returns A string do rótulo de intervalo formatada.
   */
  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // Se o índice inicial exceder o comprimento da lista, não tenta fixar o índice final no final.
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };
}
