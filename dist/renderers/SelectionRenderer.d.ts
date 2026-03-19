import m from 'mithril';
import type { OctironSelectArgs, SelectionParentArgs, SelectView } from "../octiron.ts";
export type SelectionRendererAttrs = {
    entity?: boolean;
    selector?: string;
    args: OctironSelectArgs;
    view: SelectView;
    parentArgs: SelectionParentArgs;
};
export declare const SelectionRenderer: m.ClosureComponent<SelectionRendererAttrs>;
