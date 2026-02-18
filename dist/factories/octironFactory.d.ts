import m from 'mithril';
import type { Store } from "../store.js";
import type { Mutable } from "../types/common.js";
import type { ActionParentArgs, ActionSelectionParentArgs, AnyAttrs, AnyComponent, CommonParentArgs, CommonRendererArgs, EditAttrs, EditComponent, OctironAction, OctironActionSelection, OctironActionSelectionArgs, OctironPerformArgs, OctironRoot, OctironSelectArgs, OctironSelection, Predicate, PresentAttrs, PresentComponent, SelectionParentArgs, TypeHandlers } from "../types/octiron.js";
export type CommonArgs = {
    pre?: m.Children;
    sep?: m.Children;
    post?: m.Children;
    start?: number;
    end?: number;
    predicate?: Predicate;
    store?: Store;
    typeHandlers?: TypeHandlers;
    attrs?: PresentAttrs | EditAttrs | AnyAttrs;
    component?: PresentComponent | EditComponent | AnyComponent;
    fallbackComponent?: AnyComponent;
};
export type ChildArgs = Partial<SelectionParentArgs> & Partial<ActionParentArgs> & Partial<ActionSelectionParentArgs> & CommonParentArgs;
export type InstanceHooks = {
    _updateArgs: (args: OctironSelectArgs | OctironPerformArgs | OctironActionSelectionArgs) => void;
};
export type FactoryRefs = {
    factoryArgs: CommonArgs;
    parentArgs: CommonParentArgs;
    rendererArgs: CommonRendererArgs;
    childArgs: ChildArgs;
};
export declare function octironFactory(octironType: 'root', refs: {
    factoryArgs: CommonArgs;
    parentArgs: CommonParentArgs;
}): Mutable<OctironRoot>;
export declare function octironFactory(octironType: 'selection', refs: {
    factoryArgs: CommonArgs;
    parentArgs: CommonParentArgs;
    rendererArgs: CommonRendererArgs;
    childArgs: ChildArgs;
}): Mutable<OctironSelection & InstanceHooks>;
export declare function octironFactory(octironType: 'action', refs: {
    factoryArgs: CommonArgs;
    parentArgs: CommonParentArgs;
    rendererArgs: CommonRendererArgs;
    childArgs: ChildArgs;
}): Mutable<OctironAction & InstanceHooks>;
export declare function octironFactory(octironType: 'action-selection', refs: {
    factoryArgs: CommonArgs;
    parentArgs: CommonParentArgs;
    rendererArgs: CommonRendererArgs;
    childArgs: ChildArgs;
}): Mutable<OctironActionSelection & InstanceHooks>;
