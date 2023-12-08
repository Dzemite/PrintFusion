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
  filter?: {
    name: string,
    value: string
  },
  pageSize?: number,
  page?: number,
  sort?: string[],
}

export interface InfinitAutocompleteItem {
  id: number;
  name: string;

  [key: string]: any;
}
