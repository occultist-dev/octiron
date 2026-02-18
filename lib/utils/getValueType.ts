import type { JSONValue } from "../types/common.ts";
import { isTypeObject } from "./isTypedObject.ts";


/**
 * @description
 * Returns the type value of the input if it is a type object.
 *
 * @param value A JSON value which might be a typed JSON-ld object.
 */
export function getDataType(value: JSONValue): string | string[] | undefined {
  if (isTypeObject(value)) {
    return value['@type'];
  }
}
