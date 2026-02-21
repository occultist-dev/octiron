import type { JSONValue } from "../types/common.ts";
import type { ActionSelectionParentArgs, ActionSelectionRendererArgs, OctironActionSelection, OctironActionSelectionArgs, UpdateArgs } from "../types/octiron.ts";
import { type InstanceHooks } from "./octironFactory.ts";
export type OnActionSelectionSubmit = () => Promise<void>;
export type OnActionSelectionUpdate = (pointer: string, value: JSONValue, args?: UpdateArgs) => void;
export declare function actionSelectionFactory<Attrs extends Record<string, any> = Record<string, any>>(args: OctironActionSelectionArgs<Attrs>, parentArgs: ActionSelectionParentArgs, rendererArgs: ActionSelectionRendererArgs): OctironActionSelection & InstanceHooks;
