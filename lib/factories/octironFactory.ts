import m from 'mithril';
import type { Octiron } from "../types/octiron.ts";
import type { Mutable } from "../types/common.ts";
import type { ActionParentArgs, ActionSelectionParentArgs, AnyAttrs, AnyComponent, BaseAttrs, CommonParentArgs, CommonRendererArgs, EditAttrs, EditComponent, OctironAction, OctironActionSelection, OctironActionSelectionArgs, OctironDefaultArgs, OctironPerformArgs, OctironPresentArgs, OctironRoot, OctironSelectArgs, OctironSelection, PerformView, Predicate, PresentAttrs, PresentComponent, SelectionParentArgs, Selector, SelectView, TypeDefs } from "../types/octiron.ts";
import { isJSONObject } from "../utils/isJSONObject.ts";
import { unravelArgs } from "../utils/unravelArgs.ts";
import type { Store } from "../store.ts";
import { SelectionRenderer } from "../renderers/SelectionRenderer.ts";
import { PresentRenderer } from '../renderers/PresentRenderer.ts';
import { getDataType } from "../utils/getValueType.ts";
import { isIterable } from "../utils/isIterable.ts";
import { getIterableValue } from "../utils/getIterableValue.ts";
import { PerformRenderer } from "../renderers/PerformRenderer.ts";
import { isIRIObject } from "../utils/isIRIObject.ts";

const TypeKeys = {
  'root': 0,
  'selection': 1,
  'action': 2,
  'action-selection': 3,
} as const;

export type CommonArgs = {
  pre?: m.Children,
  sep?: m.Children,
  post?: m.Children,
  start?: number,
  end?: number,
  predicate?: Predicate,
  store?: Store,
  typeDefs?: TypeDefs,
  attrs?: PresentAttrs | EditAttrs | AnyAttrs,
  component?: PresentComponent | EditComponent | AnyComponent,
  fallbackComponent?: AnyComponent,
};

export type ChildArgs =
  & Partial<SelectionParentArgs>
  & Partial<ActionParentArgs>
  & Partial<ActionSelectionParentArgs>
  & CommonParentArgs
;

export type InstanceHooks = {
  _updateArgs: (
    type: 'args' | 'renderer' | 'parent',
    args: OctironSelectArgs | OctironPerformArgs | OctironActionSelectionArgs,
  ) => void;
}

export function octironFactory(
  octironType: 'root',
  factoryArgs: CommonArgs,
  parentArgs: CommonParentArgs,
): Mutable<OctironRoot>;

export function octironFactory(
  octironType: 'selection',
  factoryArgs: CommonArgs,
  parentArgs: CommonParentArgs,
  rendererArgs: CommonRendererArgs,
  childArgs: ChildArgs,
): Mutable<OctironSelection & InstanceHooks>;

export function octironFactory(
  octironType: 'action',
  factoryArgs: CommonArgs,
  parentArgs: CommonParentArgs,
  rendererArgs: CommonRendererArgs,
  childArgs: ChildArgs,
): Mutable<OctironAction & InstanceHooks>;

export function octironFactory(
  octironType: 'action-selection',
  factoryArgs: CommonArgs,
  parentArgs: CommonParentArgs,
  rendererArgs: CommonRendererArgs,
  childArgs: ChildArgs,
): Mutable<OctironActionSelection & InstanceHooks>;

/**
 * Creates the base Octiron instance.
 *
 * @param octironType - The Octiron instance type to create.
 * @param factoryArgs - User specified args passed to the Octiron method creating the factory.
 * @param parentArgs - Args passed from the Octiron parent instance of this instance.
 * @param rendererArgs - Args passed from the Mithril renderer component.
 * @param childArgs - Args to pass through to any child renderers, to be their parent args.
 */
export function octironFactory<O extends Octiron>(
  octironType: 'root' | 'selection' | 'action' | 'action-selection',
  factoryArgs: CommonArgs,
  parentArgs: CommonParentArgs,
  rendererArgs: CommonRendererArgs = {} as CommonRendererArgs,
  childArgs: ChildArgs = {} as ChildArgs,
): Mutable<O> {
  const typeKey = TypeKeys[octironType];
  const name = isIRIObject(rendererArgs.value) ? rendererArgs.value['@id'] : rendererArgs.propType ?? 'octiron';

  // hack to give the function a dynamically set name...
  const self: Mutable<O & InstanceHooks> = ({ [name]: (
    predicate: Predicate,
    children: m.Children,
  ): m.Children => {
    const passes = predicate(self as O);

    if (passes) {
      return children;
    }

    return null;
  } })[name] as unknown as O & InstanceHooks;

  self.id = parentArgs.store.key();
  self.isOctiron = true;
  self.octironType = octironType;
  self.readonly = true;
  self.value = rendererArgs.value ?? null;
  self.store = parentArgs.store;
  self.index = rendererArgs.index ?? 0;
  self.position = -1;
  self.expand = (typeOrTerm: string) => parentArgs.store.expand(typeOrTerm);

  // easiest to define the common child args here
  // but the object is passed in from the parent factory
  // so it has references and control over the values.
  childArgs.parent = self as unknown as Octiron;
  childArgs.store = factoryArgs.store ?? parentArgs.store;
  childArgs.typeDefs = factoryArgs.typeDefs ?? parentArgs.typeDefs;

  if (typeKey !== TypeKeys['root']) {
    self.propType = rendererArgs.propType;
    self.dataType = getDataType(rendererArgs.value);
  }

  self.not = (
    predicate: Predicate,
    children: m.Children,
  ): m.Children => {
    if (self == null) {
      return null;
    }

    const passes = predicate(self as O);

    if (!passes) {
      return children;
    }

    return null;
  };

  self.get = (termOrType) => {
    if (!isJSONObject(self.value)) {
      return null;
    }

    if (termOrType.startsWith('@')) {
      return self.value[termOrType];
    }

    const type = self.store.expand(termOrType);
    const value = self.value[type] ?? null;

    if (isIterable(value)) {
      return getIterableValue(value);
    }

    return self.value[type] ?? null;
  }

  self.enter = (
    arg1: Selector,
    arg2?: OctironSelectArgs | SelectView,
    arg3?: SelectView,
  ): m.Children => {
    const [selector, args, view] = unravelArgs(arg1, arg2, arg3);

    return m(SelectionRenderer, {
      entity: true,
      selector,
      args,
      view,
      parentArgs: childArgs as SelectionParentArgs,
    });
  };

  const rootChildArgs = {
    ...childArgs,
    value: parentArgs.store.entity(parentArgs.store.rootIRI)?.value,
  }

  self.root = (
    arg1?: Selector | OctironSelectArgs | SelectView,
    arg2?: OctironSelectArgs | SelectView,
    arg3?: SelectView,
  ): m.Children => {
    let selector: string;
    const [childSelector, args, view] = unravelArgs(arg1, arg2, arg3);

    if (childSelector == null) {
      selector = parentArgs.store.rootIRI;
    } else {
      selector = `${parentArgs.store.rootIRI} ${childSelector}`;
    }

    return m(SelectionRenderer, {
      entity: true,
      selector,
      args,
      view,
      parentArgs: rootChildArgs as SelectionParentArgs,
    });

    // return self.enter(selector, args, view);
  };

  // action and action selection define their own select method
  switch (typeKey) {
    case TypeKeys['root']:
      self.select = self.root;
    break;
    case TypeKeys['selection']:
      self.select = (
        arg1: Selector,
        arg2?: OctironSelectArgs | SelectView,
        arg3?: SelectView,
    ): m.Children => {
      const [selector, args, view] = unravelArgs(arg1, arg2, arg3);

      if (!isJSONObject(rendererArgs.value)) {
        return null;
      }

      return m(
        SelectionRenderer,
        {
          selector,
          args,
          view,
          parentArgs: childArgs as SelectionParentArgs,
        },
      );
    };
  }

  switch (typeKey) {
    case TypeKeys['root']:
      self.present = self.root;
    break;
    default:
      self.present = (
        args?: OctironPresentArgs<BaseAttrs>,
    ): m.Children => {
      return m(PresentRenderer, {
        o: self as unknown as Octiron,
        args: args as OctironPresentArgs,
        factoryArgs: factoryArgs as OctironPresentArgs,
        parentArgs,
        rendererArgs,
      });
    };
  }

  self.default = (
    args?: OctironDefaultArgs,
  ) => {
    return self.present(Object.assign({ component: null }, args));
  };

  switch (typeKey) {
    case TypeKeys['root']:
      self.perform = (
        arg1?: Selector | OctironPerformArgs | PerformView,
        arg2?: OctironPerformArgs | PerformView,
        arg3?: PerformView,
    ) => {
      if (typeof arg1 === 'string') {
        return self.root(arg1, (o) => o.perform(
          arg2 as OctironPerformArgs,
          arg3 as PerformView,
        ));
      }

      return self.root((o) => o.perform(
          arg2 as OctironPerformArgs,
          arg3 as PerformView,
        ));
      };
      break;
    default: {
      self.perform = (
        arg1?: Selector | OctironPerformArgs | PerformView,
        arg2?: OctironPerformArgs | PerformView,
        arg3?: PerformView,
      ) => {
        const [selector, args, view] = unravelArgs(arg1, arg2, arg3);

        if (typeof selector === 'string') {
          return self.select(selector, (o: OctironAction) => o.perform(args, view));
        }

        return m(PerformRenderer, {
          selector,
          args,
          view,
          parentArgs: childArgs as SelectionParentArgs & ActionParentArgs,
        });
      };
      break;
    }
  }

  if (typeKey !== TypeKeys['root']) {
    const updateArgs: InstanceHooks['_updateArgs'] = (type, args) => {
      const currentArgs = type === 'args'
        ? factoryArgs
        : type === 'parent'
        ? parentArgs
        : rendererArgs;

      // Hack, still don't know if it will work...
      for (const key of Object.keys(currentArgs)) {
        // deno-lint-ignore no-explicit-any
        delete (currentArgs as Record<string, any>)[key];
      }

      for (const [key, value] of Object.entries(args)) {
        // deno-lint-ignore no-explicit-any
        (currentArgs as Record<string, any>)[key] = value;
      }
    };

    // deno-lint-ignore no-explicit-any
    self._updateArgs = updateArgs as any;
  }

  return self;
}
