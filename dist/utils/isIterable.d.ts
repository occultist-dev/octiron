import type { IterableJSONLD, JSONValue } from '../types/common.js';
/**
 * @description
 * Returns true if a json-ld value is an array or has an iterable value,
 * i.e.: an object with an `@list` or `@set` array value.
 *
 * @param {JSONValue} value - A json-ld value
 */
export declare function isIterable(value: JSONValue): value is IterableJSONLD;
