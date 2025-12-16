import type { JSONObject } from '../types/common.js';
import type { Store } from '../store.js';
/**
 * Expands a object's keys to be their RDF type equivlent.
 *
 * @param store   - An Octiron store with expansion context.
 * @param value   - A JSON object to expand.
 */
export declare function expandValue(store: Store, value: JSONObject): JSONObject;
