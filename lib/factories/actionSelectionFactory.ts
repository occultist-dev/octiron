import {JsonPointer} from 'json-ptr';
import m from 'mithril';
import {ActionSelectionRenderer} from "../renderers/ActionSelectionRenderer.ts";
import {EditRenderer} from '../renderers/EditRenderer.ts';
import type {JSONObject, JSONValue} from "../types/common.ts";
import type {ActionSelectionParentArgs, ActionSelectionRendererArgs, ActionSelectView, BaseAttrs, OctironActionSelection, OctironActionSelectionArgs, OctironDefaultArgs, OctironEditArgs, OctironPresentArgs, PayloadValueMapper, Selector, UpdateArgs} from "../types/octiron.ts";
import {expandValue} from '../utils/expandValue.ts';
import {getIterableValue} from "../utils/getIterableValue.ts";
import {isIterable} from "../utils/isIterable.ts";
import {isJSONObject} from "../utils/isJSONObject.ts";
import {mithrilRedraw} from "../utils/mithrilRedraw.ts";
import {unravelArgs} from "../utils/unravelArgs.ts";
import {type ChildArgs, type FactoryRefs, type InstanceHooks, octironFactory} from "./octironFactory.ts";


export type OnActionSelectionSubmit = () => Promise<void>;

export type OnActionSelectionUpdate = (
  pointer: string,
  value: JSONValue,
  args?: UpdateArgs,
) => void;


export function actionSelectionFactory<
  Attrs extends Record<string, unknown> = Record<string, unknown>
>(
  args: OctironActionSelectionArgs<Attrs>,
  parentArgs: ActionSelectionParentArgs,
  rendererArgs: ActionSelectionRendererArgs,
): [octiron: OctironActionSelection, hooks: InstanceHooks] {
  const factoryArgs = Object.assign({}, args);
  const childArgs: Partial<ChildArgs> = {
    action: parentArgs.action,
    submitting: parentArgs.submitting,
    value: rendererArgs.value,
  };

  const refs = {
    factoryArgs,
    parentArgs,
    rendererArgs,
    childArgs,
  } as unknown as FactoryRefs;
  const [self, hooks] = octironFactory(
    'action-selection',
    refs,
  );

  self.readonly = rendererArgs.spec == null ? true : (rendererArgs.spec.readonly ?? false);
  self.inputName = rendererArgs.spec?.name != null ? rendererArgs.spec?.name : rendererArgs.propType as string;
  self.submitting = parentArgs.submitting;
  self.action = parentArgs.action;

  childArgs.updatePointer = (
    pointer: string,
    value: JSONValue,
    args?: UpdateArgs,
    interceptor = factoryArgs.interceptor,
  ) => {
    const prev = refs.rendererArgs.value as JSONObject;

    if (!isJSONObject(prev)) {
      console.warn(`Non object action change intercepted.`);
      return;
    }

    let next: Partial<JSONObject> | boolean = Object.assign({}, prev);
    const ptr = JsonPointer.create(pointer);

    if (value == null) {
      ptr.unset(next);
    } else {
      ptr.set(next, value, true);
    }

    if (typeof interceptor === 'function') {
      next = interceptor({
        next,
        prev,
        o: self as unknown as OctironActionSelection,
        actionValue: self.actionValue.value as JSONObject,
      });

      if (next === false) return;
    }

    refs.parentArgs.updatePointer(refs.rendererArgs.pointer, next, args);
  }

  self.update = async (
    arg1: PayloadValueMapper<JSONObject> | JSONObject,
    args?: UpdateArgs,
  ): Promise<void> => {
    const value = refs.rendererArgs.value;

    if (!isJSONObject(value)) {
      throw new Error(`Cannot call update on a non object selection instance`);
    }

    if (typeof arg1 === 'function') {
      refs.rendererArgs.update(arg1(value));
    } else if (arg1 != null) {
      refs.rendererArgs.update(arg1);
    }

    if (args?.submit || args?.submitOnChange) {
      await refs.parentArgs.submit();
    } else {
      mithrilRedraw();
    }
  };

  self.submit = (): Promise<void> => {
    return refs.parentArgs.submit();
  };

  self.select = (
    arg1: Selector,
    arg2?: OctironActionSelectionArgs | ActionSelectView,
    arg3?: ActionSelectView,
  ): m.Children => {
    if (!isJSONObject(refs.rendererArgs.value)) {
      return null;
    }

    const [selector, args, view] = unravelArgs(arg1, arg2, arg3);

    return m(
      ActionSelectionRenderer,
      {
        parentArgs: childArgs as ActionSelectionParentArgs,
        selector,
        value: refs.rendererArgs.value,
        actionValue: refs.rendererArgs.actionValue.value as JSONObject,
        args,
        view,
      },
    );
  };

  self.edit = (
    args?: OctironEditArgs<BaseAttrs>,
  ): m.Children => {
    if (self.readonly) {
      return self.present(args as OctironPresentArgs<BaseAttrs>);
    }

    return m(EditRenderer, {
      o: self as unknown as OctironActionSelection,
      args,
      factoryArgs,
      parentArgs: refs.parentArgs,
      rendererArgs: refs.rendererArgs,
    });
  };

  self.default = (args?: OctironDefaultArgs<BaseAttrs>) => {
    return self.edit(Object.assign({ component: null }, args) as OctironEditArgs<BaseAttrs>)
  }

  self.initial = parentArgs.action.initial;
  self.success = parentArgs.action.success;
  self.failure = parentArgs.action.failure;

  self.remove = (
    _args: UpdateArgs = {},
  ) => {
    if (refs.rendererArgs.propType == null) {
      return;
    }

    const parentValue = refs.parentArgs.parent.value as JSONObject;
    const value = parentValue[refs.rendererArgs.propType];

    if (isIterable(value)) {
      const arrValue = getIterableValue(value);

      arrValue.splice(self.index, 1);

      if (arrValue.length === 0) {
        delete parentValue[refs.rendererArgs.propType];
      }
    } else if (isJSONObject(value)) {
      delete parentValue[refs.rendererArgs.propType];
    }

    mithrilRedraw()
  };

  self.append = (
    termOrType: string,
    value: JSONValue = {},
    args: UpdateArgs = {},
  ) => {
    if (!isJSONObject(refs.rendererArgs.value)) {
      console.warn(`Attempt to append to non object octiron selection ${termOrType}`);
      return;
    }

    let nextValue: JSONValue;
    const type = refs.parentArgs.store.expand(termOrType);
    const lastValue = refs.rendererArgs.value[type];

    if (isJSONObject(value)) {
      value = expandValue(self.store, value);
    }

    if (lastValue == null) {
      nextValue = value;
    } else if (Array.isArray(lastValue)) {
      nextValue = [...lastValue, value];
    } else {
      nextValue = [lastValue, value];
    }

    return refs.parentArgs.updatePointer(
      refs.rendererArgs.pointer,
      Object.assign({}, refs.rendererArgs.value, { [type]: nextValue }),
      args,
    );
  };

  const wrappedHooks: InstanceHooks = {
    argsChanged: () => {
      hooks.argsChanged();
    },
    parentArgsChanged: () => {
      hooks.parentArgsChanged();
      self.submitting = parentArgs.submitting;
      self.action = parentArgs.action;
    },
    rendererArgsChanged: () => {
      self.index = refs.rendererArgs.index;
      self.readonly = rendererArgs.spec == null ? true : (rendererArgs.spec.readonly ?? false);
      self.inputName = rendererArgs.spec?.name != null ? rendererArgs.spec?.name : rendererArgs.propType as string;
    },
  };

  return [self, wrappedHooks] as [OctironActionSelection, InstanceHooks];
}

