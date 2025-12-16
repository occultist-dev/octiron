import type { JSONValue } from "../types/common.js";
/**
 * @description
 * Returns the type value of the input if it is a type object.
 *
 * @param value A JSON value which might be a typed JSON-ld object.
 */
export declare function getDataType(value: JSONValue): string | string[] | undefined;
