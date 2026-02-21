import type m from 'mithril';
import type { OctironSelectArgs, SelectionParentArgs, SelectView, TypeHandlers } from '../types/octiron.ts';
import type { EntityState } from '../types/store.ts';
import type { Store } from "../store.ts";
export type ActionRendererRef = {
    submitting: boolean;
    submitResult?: EntityState;
    store: Store;
    typeHandlers: TypeHandlers;
};
export type ActionStateRendererAttrs = {
    not?: boolean;
    type: 'initial' | 'success' | 'failure';
    children?: m.Children;
    selector?: string;
    args: OctironSelectArgs;
    view?: SelectView;
    submitResult?: EntityState;
    parentArgs: SelectionParentArgs;
};
export declare const ActionStateRenderer: m.ClosureComponent<ActionStateRendererAttrs>;
