import type { OctironSelectArgs, SelectionParentArgs, Selector, SelectView } from "../types/octiron.js";
import m from "mithril";
export type SelectionRendererAttrs = {
    entity?: boolean;
    selector: Selector;
    args: OctironSelectArgs;
    view: SelectView;
    parentArgs: SelectionParentArgs;
};
/**
 * @description
 * Subscribes to a selection's result using the Octiron store. Each selection
 * result is feed to an Octiron instance and is only removed if a later
 * selection update does not include the same result. Selection results are
 * given a unique key in the form of a json-path.
 *
 * Once an Octiron instance is created using a selection, further changes via
 * the upstream parentArgs object or user given args applied to the downstream
 * Octiron instances using their internal update hooks.
 */
export declare const SelectionRenderer: m.FactoryComponent<SelectionRendererAttrs>;
