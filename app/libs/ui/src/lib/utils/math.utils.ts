/**
 * Filters non-numbers from the supplied array
 */
const filterNonNumbers: (vals: any[]) => number[] = (vals: any[]) => {
  return vals.filter(val => typeof val === 'number' && !isNaN(val));
};

/**
 * Extension of Math.max that ignores non-number values.
 */
export const max: (...vals: number[]) => number = (...vals: number[]) => Math.max(...filterNonNumbers(vals));

/**
 * Extension of Math.min that ignores non-number values.
 */
export const min: (...vals: number[]) => number = (...vals: number[]) => Math.min(...filterNonNumbers(vals));
