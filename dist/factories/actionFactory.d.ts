import type { Store } from "../store.ts";
import type { JSONObject } from "../types/common.ts";
import type { ActionParentArgs, OctironAction, OctironPerformArgs, PerformRendererArgs, TypeHandlers } from "../types/octiron.ts";
import type { EntityState } from "../types/store.ts";
import { type InstanceHooks } from "./octironFactory.ts";
export type ActionRefs = {
    url?: string;
    method?: string;
    submitting: boolean;
    payload: JSONObject;
    store: Store;
    typeHandlers: TypeHandlers;
    submitResult?: EntityState;
};
export declare function actionFactory<Attrs extends Record<string, unknown> = Record<string, unknown>>(args: OctironPerformArgs<Attrs>, parentArgs: ActionParentArgs, rendererArgs: PerformRendererArgs): OctironAction & InstanceHooks;
