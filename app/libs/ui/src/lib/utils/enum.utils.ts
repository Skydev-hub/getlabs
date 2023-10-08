type Not<T> = [T] extends [never] ? unknown : never
type Extractable<T, U> = Not<U extends any ? Not<T extends U ? unknown : never> : never>

export const enumKeys = (e: object) => Object.keys(e);
export const enumValues = (e: object) => enumKeys(e).map(k => e[k as any]);

export const asEnum = <E extends Record<keyof E, string | number>, K extends string | number>(e: E, k: K & Extractable<E[keyof E], K>): Extract<E[keyof E], K> => {
  if (Object.values(e).indexOf(k) < 0) {
    throw new Error("Expected one of " + Object.values(e).join(", "));
  }
  return k as any;
};
