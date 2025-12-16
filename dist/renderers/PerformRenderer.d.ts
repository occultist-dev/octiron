import type m from 'mithril';
import type { ActionParentArgs, OctironPerformArgs, PerformView, SelectionParentArgs, Selector } from '../types/octiron.js';
export type PerformRendererAttrs = {
    parentArgs: SelectionParentArgs & ActionParentArgs;
    selector?: Selector;
    args: OctironPerformArgs;
    view: PerformView;
};
export declare const PerformRenderer: m.FactoryComponent<PerformRendererAttrs>;
