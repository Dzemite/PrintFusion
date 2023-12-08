export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface RequestOptions {
  filter?: string,
  pageSize?: number,
  page?: number,
}
