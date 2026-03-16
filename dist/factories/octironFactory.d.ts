import m from 'mithril';
import type { Mutable } from "../types/common.ts";
import type { ActionParentArgs, ActionSelectionParentArgs, AnyAttrs, AnyComponent, CommonParentArgs, CommonRendererArgs, EditAttrs, EditComponent, OctironAction, OctironActionSelection, OctironRoot, OctironSelection, Predicate, PresentAttrs, PresentComponent, SelectionParentArgs, TypeHandlers } from "../types/octiron.ts";
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
    argsChanged: () => void;
    parentArgsChanged: () => void;
    rendererArgsChanged: () => void;
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
}): [octiron: Mutable<OctironRoot>, hooks: InstanceHooks];
export declare function octironFactory(octironType: 'selection', refs: {
    factoryArgs: CommonArgs;
    parentArgs: CommonParentArgs;
    rendererArgs: CommonRendererArgs;
    childArgs: ChildArgs;
}): [octiron: Mutable<OctironSelection>, hooks: InstanceHooks];
export declare function octironFactory(octironType: 'action', refs: {
    factoryArgs: CommonArgs;
    parentArgs: CommonParentArgs;
    rendererArgs: CommonRendererArgs;
    childArgs: ChildArgs;
}): [octiron: Mutable<OctironAction>, hooks: InstanceHooks];
export declare function octironFactory(octironType: 'action-selection', refs: {
    factoryArgs: CommonArgs;
    parentArgs: CommonParentArgs;
    rendererArgs: CommonRendererArgs;
    childArgs: ChildArgs;
}): [octiron: Mutable<OctironActionSelection>, hooks: InstanceHooks];
