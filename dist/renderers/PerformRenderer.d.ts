import type m from 'mithril';
import type { ActionParentArgs, OctironPerformArgs, PerformView, RegisterParentArgsChangeListener, SelectionParentArgs, Selector } from '../types/octiron.ts';
export type PerformRendererAttrs = {
    parentArgs: SelectionParentArgs & ActionParentArgs;
    selector?: Selector;
    args: OctironPerformArgs;
    view: PerformView;
    register: RegisterParentArgsChangeListener<SelectionParentArgs & ActionParentArgs>;
};
export declare const PerformRenderer: m.FactoryComponent<PerformRendererAttrs>;
