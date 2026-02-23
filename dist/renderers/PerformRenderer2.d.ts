import m from 'mithril';
import type { ActionParentArgs, OctironPerformArgs, PerformView } from "../octiron.ts";
export type PerformRendererAttrs = {
    selector?: string;
    args: OctironPerformArgs;
    view: PerformView;
    parentArgs: ActionParentArgs;
};
/**
 * The perform renderer is responsible for selecting the target of
 * a call to `o.perform()`. If successful it passes the result of
 * the selection to the `ActionRenderer` or renders loading / failure
 * states.
 */
export declare const PerformRenderer: m.ComponentTypes<PerformRendererAttrs>;
