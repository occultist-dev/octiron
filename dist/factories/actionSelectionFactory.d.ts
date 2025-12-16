import type { JSONValue } from "../types/common.js";
import type { ActionSelectionParentArgs, ActionSelectionRendererArgs, OctironActionSelection, OctironActionSelectionArgs, UpdateArgs } from "../types/octiron.js";
import { type InstanceHooks } from "./octironFactory.js";
export type OnActionSelectionSubmit = () => Promise<void>;
export type OnActionSelectionUpdate = (pointer: string, value: JSONValue, args?: UpdateArgs) => void;
export declare function actionSelectionFactory<Attrs extends Record<string, any> = Record<string, any>>(args: OctironActionSelectionArgs<Attrs>, parentArgs: ActionSelectionParentArgs, rendererArgs: ActionSelectionRendererArgs): OctironActionSelection & InstanceHooks;
