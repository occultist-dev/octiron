import type { IRIObject, JSONValue } from '../types/common.ts';
import { getIterableValue } from "./getIterableValue.ts";
import { isIRIObject } from "./isIRIObject.ts";
import { isIterable } from "./isIterable.ts";
import { isJSONObject } from "./isJSONObject.ts";
import { isMetadataObject } from "./isMetadataObject.ts";
import { isValueObject } from "./isValueObject.ts";


/**
 * @description
 * Locates all IRI objects in a potentially deeply nested JSON-ld structure and
 * returns an array of the located IRI objects.
 *
 * Objects identified as IRI objects are not modified beyond being placed in
 * an array together.
 *
 * @param value - The value to flatten.
 * @param agg - An array to fill with the flattened IRI objects.
 *              This is required for the internal recursing performed by this
 *              function and isn't required by upstream callers.
 */
export function flattenIRIObjects(value: JSONValue, agg: IRIObject[] = []): IRIObject[] {
  if (Array.isArray(value)) {
    for (const item of value) {
      flattenIRIObjects(item, agg);
    }
  } else if (isJSONObject(value)) {
    if (isMetadataObject(value)) {
      return agg;
    }

    if (isIRIObject(value)) {
      agg.push(value);
    }

    if (isValueObject(value)) {
      flattenIRIObjects(value['@value'], agg);
    } else if (isIterable(value)) {
      flattenIRIObjects(getIterableValue(value), agg);
    } else {
      for (const [term, item] of Object.entries(value)) {
        if (term.startsWith('@')) {
          continue;
        }

        flattenIRIObjects(item, agg);
      }
    }
  }

  return agg;
}
