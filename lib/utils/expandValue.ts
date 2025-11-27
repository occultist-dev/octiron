import type {JSONObject} from '../types/common.ts';
import type {Store} from '../store.ts';


/**
 * Expands a object's keys to be their RDF type equivlent.
 *
 * @param store   - An Octiron store with expansion context.
 * @param value   - A JSON object to expand.
 */
export function expandValue(store: Store, value: JSONObject): JSONObject {
  let expanded: JSONObject = {};

  for (let [key, item] of Object.entries(value)) {
    expanded[store.expand(key)] = item;
  }

  return expanded;
}
