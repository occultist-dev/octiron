import type { JSONObject, JSONValue } from '../types/common.js';
/**
 * @description
 * Returns true if the input value is an object.
 *
 * @param value Any value which should come from a JSON source.
 */
export declare function isJSONObject(value: JSONValue): value is JSONObject;
