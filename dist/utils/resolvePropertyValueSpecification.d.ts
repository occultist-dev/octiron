import type { StoreType } from "../store.ts";
import type { JSONObject } from '../types/common.ts';
import type { Spec } from '../types/octiron.ts';
export declare function resolvePropertyValueSpecification({ spec, store, }: {
    spec: JSONObject;
    store: StoreType;
}): Spec;
