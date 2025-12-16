import type { Store } from "../store.js";
import type { JSONObject } from "../types/common.js";
import type { ActionParentArgs, OctironAction, OctironPerformArgs, PerformRendererArgs, TypeDefs } from "../types/octiron.js";
import type { EntityState } from "../types/store.js";
import { type InstanceHooks } from "./octironFactory.js";
export type ActionRefs = {
    url?: string;
    method?: string;
    submitting: boolean;
    payload: JSONObject;
    store: Store;
    typeDefs: TypeDefs;
    submitResult?: EntityState;
};
export declare function actionFactory<Attrs extends Record<string, unknown> = Record<string, unknown>>(args: OctironPerformArgs<Attrs>, parentArgs: ActionParentArgs, rendererArgs: PerformRendererArgs): OctironAction & InstanceHooks;
