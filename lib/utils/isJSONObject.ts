import type { JSONObject, JSONValue } from '../types/common.ts';

/**
 * @description
 * Returns true if the input value is an object.
 *
 * @param value Any value which should come from a JSON source.
 */
export function isJSONObject(value: JSONValue): value is JSONObject {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
}
