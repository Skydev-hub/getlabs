import { customAlphabet } from 'nanoid';

// Filter out look alike and non alphanumeric chars
export const secureid = (size?: number, alphabet?: string) => {
  return customAlphabet(alphabet || '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstwxyz', size || 21)();
};
