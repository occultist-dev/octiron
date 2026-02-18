import type { IRIObject, JSONObject } from '../types/common.ts';

/**
 * @description
 * Some JSON-ld objects contain special JSON-ld values, such as @type which
 * can inform the software on what to expect when retrieving the object but
 * otherwise require fetching an entity from an endpoint to get the values
 * they relate to. For Octiron's purposes these are considered metadata objects.
 *
 * Objects containing `@value`, `@list`, `@set` are not considered metadata
 * objects as these properties references concrete values.
 *
 * @param value - The JSON object to check for non special properties in.
 */
export function isMetadataObject(value: JSONObject): value is IRIObject {
  const keys = Object.keys(value);

  if (keys.length === 0) {
    return false;
  }

  for (const term of keys) {
    if (!term.startsWith("@") ||
      term === '@value' ||
      term === '@list' ||
      term === '@set') {
      return false;
    }
  }

  return true;
}
