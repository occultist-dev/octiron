import type { JSONObject, JSONValue, TypeObject } from '../types/common.ts';
import { isJSONObject } from "./isJSONObject.ts";

/**
 * @description
 * Returns true if the given value is a JSON object with a JSON-ld @type value.
 *
 * @param value Any value which should come from a JSON source.
 */
export function isTypeObject<
  Properties extends JSONObject = JSONObject
>(value: JSONValue): value is TypeObject<Properties> {
  if (!isJSONObject(value)) {
    return false;
  } else if (typeof value['@type'] === 'string') {
    return true;
  } else if (!Array.isArray(value['@type'])) {
    return false;
  }

  for (const item of value['@type']) {
    if (typeof item !== 'string') {
      return false;
    }
  }

  return true;
}
