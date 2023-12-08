import { RequestOptions } from "../interfaces/common";

export function prepareRequestOptions(options: RequestOptions): string {
  let preparedArr = [];
  if (options.pageSize) {
    preparedArr.push(`pagination[pageSize]=${options.pageSize}`);
  }
  if (options.page) {
    preparedArr.push(`pagination[page]=${options.page}`);
  }
  if (options.filter) {
    preparedArr.push(`filters[name][$containsi]=${options.filter}`);
  }
  if (options.sort?.length) {
    options.sort.forEach((sort, i) => {
      preparedArr.push(`sort[${i}]=${sort}`);
    });
  }

  return preparedArr.length > 0 ? preparedArr.join('&') : '';
}