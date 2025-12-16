import type { IRIObject, JSONObject } from '../types/common.js';
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
export declare function isMetadataObject(value: JSONObject): value is IRIObject;
