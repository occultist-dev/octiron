import m from 'mithril';
import type { OctironActionSelection, OctironEditArgs, ActionSelectionParentArgs, ActionSelectionRendererArgs } from '../types/octiron.js';
export type EditRendererAttrs = {
    o: OctironActionSelection;
    args: OctironEditArgs;
    factoryArgs: OctironEditArgs;
    parentArgs: ActionSelectionParentArgs;
    rendererArgs: ActionSelectionRendererArgs;
};
export declare const EditRenderer: m.ComponentTypes<EditRendererAttrs>;
