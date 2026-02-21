import type m from "mithril";
import type { JSONObject } from '../types/common.ts';
import type { ActionSelectionParentArgs, ActionSelectView, OctironActionSelectionArgs, Selector } from '../types/octiron.ts';
export type ActionSelectionRendererAttrs = {
    value: JSONObject;
    actionValue: JSONObject;
    selector: Selector;
    parentArgs: ActionSelectionParentArgs;
    args: OctironActionSelectionArgs;
    view: ActionSelectView;
    selectionArgs?: OctironActionSelectionArgs;
};
export declare const ActionSelectionRenderer: m.FactoryComponent<ActionSelectionRendererAttrs>;
