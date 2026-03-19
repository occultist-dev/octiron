import m from 'mithril';
import type { ActionParentArgs, OctironPerformArgs, PerformView } from '../octiron.ts';
export type PerformRendererAttrs = {
    selector?: string;
    args: OctironPerformArgs;
    view: PerformView;
    parentArgs: ActionParentArgs;
};
export declare const PerformRenderer: m.ClosureComponent<PerformRendererAttrs>;
