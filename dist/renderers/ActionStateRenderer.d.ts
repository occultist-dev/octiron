import type m from 'mithril';
import type { OctironSelectArgs, SelectionParentArgs, SelectView, TypeDefs } from '../types/octiron.js';
import type { EntityState } from '../types/store.js';
import type { Store } from "../store.js";
export type ActionRendererRef = {
    submitting: boolean;
    submitResult?: EntityState;
    store: Store;
    typeDefs: TypeDefs;
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
