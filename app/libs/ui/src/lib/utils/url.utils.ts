export interface SearchParams {
  [key: string]: string | string[];
}

export const searchParamsToObject = (params: URLSearchParams): SearchParams => {
  const obj = {};
  if (!params) {
    return obj;
  }
  params.forEach((val, key) => {
    if (params.getAll(key).length > 1) {
      obj[key] = params.getAll(key);
    } else {
      obj[key] = params.get(key);
    }
  })
  return obj;
}
