import type { IterableJSONLD, JSONArray } from '../types/common.ts';


/**
 * @description
 * Returns true if a json-ld value is an array or has an iterable value,
 * i.e.: an object with an `@list` or `@set` array value.
 *
 * This function returns an empty array in the cases where a non-iterable value
 * is given.
 *
 * @param {JSONValue} value - A json-ld value
 */
export function getIterableValue(value: IterableJSONLD): JSONArray {
  if (Array.isArray(value)) {
    return value;
  } else if (Array.isArray(value['@list'])) {
    return value['@list'];
  } else if (Array.isArray(value['@set'])) {
    return value['@set'];
  }

  return [];
}
