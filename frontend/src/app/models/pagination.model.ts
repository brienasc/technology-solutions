export interface Paginated<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}
