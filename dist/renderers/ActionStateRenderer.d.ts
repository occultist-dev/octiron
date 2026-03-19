import m from 'mithril';
import type { ActionEvents, OctironSelectArgs, SelectionParentArgs, SelectView } from '../octiron.ts';
export type ActionState = 'success' | 'failure';
export type ActionStateRendererAttrs = {
    not?: boolean;
    type: ActionState;
    events: ActionEvents;
    selector?: string;
    args: OctironSelectArgs;
    parentArgs: SelectionParentArgs;
    view?: SelectView;
};
export declare const ActionStateRenderer: m.ClosureComponent<ActionStateRendererAttrs>;
