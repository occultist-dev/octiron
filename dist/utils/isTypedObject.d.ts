import type { JSONObject, JSONValue, TypeObject } from '../types/common.js';
/**
 * @description
 * Returns true if the given value is a JSON object with a JSON-ld @type value.
 *
 * @param value Any value which should come from a JSON source.
 */
export declare function isTypeObject<Properties extends JSONObject = JSONObject>(value: JSONValue): value is TypeObject<Properties>;
