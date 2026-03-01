import type { JSONValue } from "../types/common.ts";
import type { ActionSelectionParentArgs, ActionSelectionRendererArgs, OctironActionSelection, OctironActionSelectionArgs, UpdateArgs } from "../types/octiron.ts";
import { type InstanceHooks } from "./octironFactory.ts";
export type OnActionSelectionSubmit = () => Promise<void>;
export type OnActionSelectionUpdate = (pointer: string, value: JSONValue, args?: UpdateArgs) => void;
export declare function actionSelectionFactory<Attrs extends Record<string, unknown> = Record<string, unknown>>(args: OctironActionSelectionArgs<Attrs>, parentArgs: ActionSelectionParentArgs, rendererArgs: ActionSelectionRendererArgs): [octiron: OctironActionSelection, hooks: InstanceHooks];
