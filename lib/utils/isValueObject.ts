import type { JSONObject, ValueObject } from '../types/common.ts';

/**
 * @description
 * A value object contains a `@value` value. Often this is used to provide
 * further information about the value like what `@type` it holds, allowing
 * filters to be applied to the referenced value.
 *
 * @param value - A JSON value.
 */
export function isValueObject(
  value: JSONObject,
): value is ValueObject {
  return typeof value['@value'] !== 'undefined';
}
