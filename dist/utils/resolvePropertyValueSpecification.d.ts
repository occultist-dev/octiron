import type { Store } from "../store.js";
import type { JSONObject } from '../types/common.js';
import type { Spec } from '../types/octiron.js';
export declare function resolvePropertyValueSpecification({ spec, store, }: {
    spec: JSONObject;
    store: Store;
}): Spec;
