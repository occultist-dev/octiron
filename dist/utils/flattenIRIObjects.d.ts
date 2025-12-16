import type { IRIObject, JSONValue } from '../types/common.js';
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
export declare function flattenIRIObjects(value: JSONValue, agg?: IRIObject[]): IRIObject[];
