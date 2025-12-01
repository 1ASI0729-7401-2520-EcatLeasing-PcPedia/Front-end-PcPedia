export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface Pageable {
  page: number;
  size: number;
  sort?: string;
}

export interface PageParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  [key: string]: string | number | undefined;
}
