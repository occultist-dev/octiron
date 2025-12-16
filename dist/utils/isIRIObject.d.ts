import type { IRIObject, JSONObject, JSONValue } from "../types/common.js";
/**
 * @description
 * Returns true if the given value is a JSON object with a JSON-ld @id value.
 *
 * @param value Any value which should come from a JSON source.
 */
export declare function isIRIObject<Properties extends JSONObject = JSONObject>(value: JSONValue): value is IRIObject<Properties>;
