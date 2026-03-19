import type { JSONObject } from "../types/common.ts";
import type { ActionEvents, ActionParentArgs, OctironAction, OctironPerformArgs, PerformRendererArgs, TypeHandlers } from "../types/octiron.ts";
import type { EntityState } from "../types/store.ts";
import { type InstanceHooks } from "./octironFactory.ts";
import type { StoreType } from '../store.ts';
export type ActionRefs = {
    url?: string;
    method?: string;
    submitting: boolean;
    payload: JSONObject;
    store: StoreType;
    typeHandlers: TypeHandlers;
    submitResult?: EntityState;
};
export declare function actionFactory<Attrs extends Record<string, unknown> = Record<string, unknown>>(args: OctironPerformArgs<Attrs>, parentArgs: ActionParentArgs, rendererArgs: PerformRendererArgs, events: ActionEvents): [octiron: OctironAction, hooks: InstanceHooks];
