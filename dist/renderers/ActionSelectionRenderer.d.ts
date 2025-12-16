import type m from "mithril";
import type { ActionSelectionParentArgs, ActionSelectView, OctironActionSelectionArgs, Selector } from '../types/octiron.js';
import type { JSONObject } from '../types/common.js';
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
