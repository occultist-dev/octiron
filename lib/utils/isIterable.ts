import type { IterableJSONLD, JSONValue } from '../types/common.ts';
import { isJSONObject } from "./isJSONObject.ts";

/**
 * @description
 * Returns true if a json-ld value is an array or has an iterable value,
 * i.e.: an object with an `@list` or `@set` array value.
 *
 * @param {JSONValue} value - A json-ld value
 */
export function isIterable(value: JSONValue): value is IterableJSONLD {
  if (Array.isArray(value)) {
    return true;
  } else if (isJSONObject(value)) {
    if (Array.isArray(value["@list"])) {
      return true;
    } else if (Array.isArray(value["@set"])) {
      return true;
    }
  }

  return false;
}
