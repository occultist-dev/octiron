import { JsonPointer } from 'json-ptr';
import m from 'mithril';
import { EditRenderer } from '../renderers/EditRenderer.ts';
import { ActionSelectionRenderer } from "../renderers/ActionSelectionRenderer.ts";
import type { JSONObject, JSONValue } from "../types/common.ts";
import type { Spec, ActionSelectionParentArgs, ActionSelectionRendererArgs, ActionSelectView, BaseAttrs, CommonParentArgs, CommonRendererArgs, EditComponent, OctironActionSelection, OctironActionSelectionArgs, OctironDefaultArgs, OctironEditArgs, OctironPresentArgs, PayloadValueMapper, Selector, UpdateArgs } from "../types/octiron.ts";
import { isJSONObject } from "../utils/isJSONObject.ts";
import { mithrilRedraw } from "../utils/mithrilRedraw.ts";
import { unravelArgs } from "../utils/unravelArgs.ts";
import { type ChildArgs, type CommonArgs, type InstanceHooks, octironFactory } from "./octironFactory.ts";
import { isIterable } from "../utils/isIterable.ts";
import { getIterableValue } from "../utils/getIterableValue.ts";
import { selectComponentFromArgs } from "../utils/selectComponentFromArgs.ts";
import {expandValue} from '../utils/expandValue.ts';


export type OnActionSelectionSubmit = () => Promise<void>;

export type OnActionSelectionUpdate = (
  pointer: string,
  value: JSONValue,
  args?: UpdateArgs,
) => void;


export function actionSelectionFactory<
  // deno-lint-ignore no-explicit-any
  Attrs extends Record<string, any> = Record<string, any>
>(
  args: OctironActionSelectionArgs<Attrs>,
  parentArgs: ActionSelectionParentArgs,
  rendererArgs: ActionSelectionRendererArgs,
): OctironActionSelection & InstanceHooks {
  const factoryArgs = Object.assign({}, args);
  const childArgs: Partial<ChildArgs> = {
    action: parentArgs.action,
    submitting: parentArgs.submitting,
    value: rendererArgs.value,
  };

  const self = octironFactory(
    'action-selection',
    factoryArgs as CommonArgs,
    parentArgs as CommonParentArgs,
    rendererArgs as CommonRendererArgs,
    childArgs as ChildArgs,
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
    const prev = rendererArgs.value as JSONObject;

    if (!isJSONObject(prev)) {
      console.warn(`Non object action change intercepted.`);
      return;
    }

    let next: Partial<JSONObject> = Object.assign({}, prev);
    const ptr = JsonPointer.create(pointer);

    if (value == null) {
      ptr.unset(next);
    } else {
      ptr.set(next, value, true);
    }

    if (typeof interceptor === 'function') {
      next = interceptor(next, prev, rendererArgs.actionValue?.value as JSONObject);
    }

    parentArgs.updatePointer(rendererArgs.pointer, next, args);
  }

  self.update = async (
    arg1: PayloadValueMapper<JSONObject> | JSONObject,
    args?: UpdateArgs,
  ): Promise<void> => {
    const value = rendererArgs.value;

    if (!isJSONObject(value)) {
      throw new Error(`Cannot call update on a non object selection instance`);
    }

    if (typeof arg1 === 'function') {
      rendererArgs.update(arg1(value));
    } else if (arg1 != null) {
      rendererArgs.update(arg1);
    }

    if (args?.submit || args?.submitOnChange) {
      await parentArgs.submit();
    } else {
      mithrilRedraw();
    }
  };

  self.submit = (): Promise<void> => {
    return parentArgs.submit();
  };

  self.select = (
    arg1: Selector,
    arg2?: OctironActionSelectionArgs | ActionSelectView,
    arg3?: ActionSelectView,
  ): m.Children => {
    if (!isJSONObject(rendererArgs.value)) {
      return null;
    }

    const [selector, args, view] = unravelArgs(arg1, arg2, arg3);

    return m(
      ActionSelectionRenderer,
      {
        parentArgs: childArgs as ActionSelectionParentArgs,
        selector,
        value: rendererArgs.value,
        actionValue: rendererArgs.actionValue.value as JSONObject,
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
      o: self,
      args,
      factoryArgs,
      parentArgs,
      rendererArgs,
    });

    const [attrs, component] = selectComponentFromArgs(
      'edit',
      parentArgs,
      rendererArgs,
      args,
      factoryArgs as OctironEditArgs,
    );

    if (component == null) {
      return null;
    }

    return m(component as EditComponent<JSONValue, BaseAttrs>, {
      o: self as unknown as OctironActionSelection,
      spec: rendererArgs.spec as Spec,
      renderType: "edit",
      name: self.inputName,
      value: rendererArgs.value,
      attrs,
      onchange: rendererArgs.update,
      onChange: rendererArgs.update,
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
    if (rendererArgs.propType == null) {
      return;
    }

    const parentValue = parentArgs.parent.value as JSONObject;
    const value = parentValue[rendererArgs.propType];

    if (isIterable(value)) {
      const arrValue = getIterableValue(value);

      arrValue.splice(self.index, 1);

      if (arrValue.length === 0) {
        delete parentValue[rendererArgs.propType];
      }
    } else if (isJSONObject(value)) {
      delete parentValue[rendererArgs.propType];
    }

    mithrilRedraw()
  };

  self.append = (
    termOrType: string,
    value: JSONValue = {},
    args: UpdateArgs = {},
  ) => {
    if (!isJSONObject(rendererArgs.value)) {
      console.warn(`Attempt to append to non object octiron selection ${termOrType}`);
      return;
    }

    let nextValue: JSONValue;
    const type = parentArgs.store.expand(termOrType);
    const lastValue = rendererArgs.value[type];

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

    return parentArgs.updatePointer(
      rendererArgs.pointer,
      Object.assign({}, rendererArgs.value, { [type]: nextValue }),
      args,
    );
  };

  return self as unknown as OctironActionSelection & InstanceHooks;
}

