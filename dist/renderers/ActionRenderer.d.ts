import m from 'mithril';
import type { ActionParentArgs, OctironPerformArgs, OctironSelection, PerformRendererArgs, PerformView, Selector } from '../octiron.ts';
export type ActionRendererAttrs = {
    args: OctironPerformArgs;
    parentArgs: ActionParentArgs;
    rendererArgs: PerformRendererArgs;
    selection: OctironSelection;
    selector?: Selector;
    view: PerformView;
};
export declare const ActionRenderer: m.ClosureComponent<ActionRendererAttrs>;
