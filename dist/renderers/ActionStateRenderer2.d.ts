import m from 'mithril';
import type { ActionEvents, OctironSelectArgs, SelectionParentArgs, SelectView } from '../octiron.ts';
export type ActionStateRendererAttrs = {
    not?: boolean;
    type: 'success' | 'failure';
    events: ActionEvents;
    selector?: string;
    args: OctironSelectArgs;
    parentArgs: SelectionParentArgs;
    view?: SelectView;
};
export declare const ActionStateRenderer2: m.ComponentTypes<ActionStateRendererAttrs>;
