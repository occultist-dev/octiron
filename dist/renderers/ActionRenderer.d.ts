import m from 'mithril';
import type { ActionParentArgs, OctironPerformArgs, OctironSelection, PerformRendererArgs, PerformView, Selector } from "../octiron.ts";
export type ActionRendererAttrs = {
    args: OctironPerformArgs;
    parentArgs: ActionParentArgs;
    rendererArgs: PerformRendererArgs;
    selection: OctironSelection;
    selector?: Selector;
    view: PerformView;
};
/**
 * The action renderer creates an Octiron action instance
 * and holds the current state of the current response
 * object. The response object is held at this level
 * because an Octiron instance is not plumbed into Mithril's
 * lifecycle methods and cannot teardown subscriptions if
 * the action is unmounted. It also does not make sense to
 * manipulate the response object in the `ActionStateRenderer`
 * component, since many of these components can be mounted and
 * there would be no clear source of truth.
 */
export declare const ActionRenderer: m.ComponentTypes<ActionRendererAttrs>;
