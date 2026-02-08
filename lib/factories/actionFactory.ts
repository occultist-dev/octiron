import m from 'mithril';
import { JsonPointer } from 'json-ptr';
import { ActionStateRenderer } from "../renderers/ActionStateRenderer.js";
import type { Store } from "../store.js";
import type { JSONArray, JSONObject, JSONValue, SCMAction } from "../types/common.js";
import type { ActionParentArgs, ActionSelectionParentArgs, ActionSelectView, CommonParentArgs, CommonRendererArgs, OctironAction, OctironActionSelectionArgs, OctironPerformArgs, OctironSelectArgs, PayloadValueMapper, PerformRendererArgs, Predicate, PresentComponent, SelectionParentArgs, Selector, SelectView, Submitable, TypeHandlers, UpdateArgs, UpdatePointer } from "../types/octiron.js";
import type { EntityState } from "../types/store.js";
import { getSubmitDetails } from "../utils/getSubmitDetails.js";
import { unravelArgs } from "../utils/unravelArgs.js";
import { mithrilRedraw } from "../utils/mithrilRedraw.js";
import { ActionSelectionRenderer } from "../renderers/ActionSelectionRenderer.js";
import { isJSONObject } from "../utils/isJSONObject.js";
import { type ChildArgs, type CommonArgs, type InstanceHooks, octironFactory } from "./octironFactory.js";
import {expandValue} from '../utils/expandValue.js';

export type ActionRefs = {
  url?: string;
  method?: string;
  submitting: boolean;
  payload: JSONObject;
  store: Store;
  typeHandlers: TypeHandlers;
  submitResult?: EntityState;
};

export function actionFactory<
  Attrs extends Record<string, unknown> = Record<string, unknown>,
>(
  args: OctironPerformArgs<Attrs>,
  parentArgs: ActionParentArgs,
  rendererArgs: PerformRendererArgs,
): OctironAction & InstanceHooks {
  const factoryArgs = Object.assign(Object.create(null), args);
  let payload: JSONObject = Object.create(null);
  let submitResult: EntityState | undefined;

  if (isJSONObject(args.initialValue)) {
    payload = expandValue(parentArgs.store, args.initialValue);
  } else if (args.initialValue != null) {
    console.warn('o.perform() only supports receiving JSON objects as initial values.');
  }

  async function submit() {
    let isError: false;
    const { url, method, body, contentType, encodingType } = getSubmitDetails({
      payload,
      action: rendererArgs.value as SCMAction,
    });

    self.submitting = true;
    self.url = new URL(url, self.store.rootIRI);

    mithrilRedraw();

    try {
      if (typeof args.onSubmit === 'function') {
        args.onSubmit();
      }

      submitResult = await parentArgs.store.submit(url, {
        method,
        body,
        contentType,
        encodingType,
      });
    } catch (err) {
      console.error(err);
      
      isError = true;
    }

    self.submitting = false;

    mithrilRedraw();

    if (isError && typeof args.onSubmitFailure === 'function') {
      args.onSubmitFailure();
    } else if (!isError && typeof args.onSubmitSuccess === 'function') {
      args.onSubmitSuccess();
    }
  }

  function update(value: JSONObject) {
    const prev = payload;
    const next = {
      ...prev,
      ...value,
    };

    if (typeof args.interceptor === 'function') {
      payload = args.interceptor(
        next,
        prev,
        parentArgs.parent.value as SCMAction,
      );
    } else {
      payload = next;
    }

    childArgs.value = self.value = value;

    mithrilRedraw();
  }

  const updatePointer: UpdatePointer = (
    pointer: string,
    value: JSONValue,
    _args?: UpdateArgs,
  ) => {
    const next: Partial<JSONObject> = Object.assign({}, payload);
    const ptr = JsonPointer.create(pointer);

    if (value == null) {
      ptr.unset(next);
    } else {
      ptr.set(next, value, true);
    }

    update(next);
  }

  const childArgs = {
    value: payload,
    submitting: false,
    submit,
    updatePointer,
  } as Partial<SelectionParentArgs & ActionParentArgs & ActionSelectionParentArgs>;

  const self = octironFactory(
    'action',
    factoryArgs as CommonArgs,
    parentArgs as CommonParentArgs,
    rendererArgs as CommonRendererArgs,
    childArgs as ChildArgs,
  );

  self.value = payload;
  self.action = parentArgs.parent;
  self.actionValue = rendererArgs.actionValue;

  childArgs.action = self as unknown as OctironAction;
  childArgs.submitting = self.submitting;

  self.select = (
    arg1: Selector,
    arg2?: OctironActionSelectionArgs | ActionSelectView,
    arg3?: ActionSelectView,
  ): m.Children => {
    const [selector, args, view] = unravelArgs(arg1, arg2, arg3);

    return m(
      ActionSelectionRenderer,
      {
        parentArgs: childArgs as ActionSelectionParentArgs,
        selector,
        value: self.value,
        actionValue: parentArgs.parent.value as JSONObject,
        args,
        view,
      }
    );
  };

  self.submit = async function (
    arg1?: PayloadValueMapper<JSONObject> | JSONObject
  ): Promise<void> {
    if (typeof arg1 === 'function') {
      update(arg1(payload));
    } else if (arg1 != null) {
      update(arg1);
    }

    return await submit();
  } as OctironAction['submit'];

  self.update = async function (
    arg1: PayloadValueMapper<JSONObject> | JSONObject,
    args?: UpdateArgs,
  ): Promise<void> {
    if (typeof arg1 === 'function') {
      update(arg1(payload));
    } else if (arg1 != null) {
      update(arg1);
    }

    if (args?.submit || args?.submitOnChange) {
      await submit();
    } else {
      mithrilRedraw();
    }
  } as OctironAction['update'];

  self.append = (
    termOrType: string,
    value: JSONValue = {},
    args: UpdateArgs = {},
  ) => {
    const type = parentArgs.store.expand(termOrType);

    if (!isJSONObject(self.value)) {
      return;
    }
    const prevValue = self.value[type];
    let nextValue: JSONArray = [];

    if (prevValue != null && !Array.isArray(prevValue)) {
      nextValue.push(prevValue);
    } else if (Array.isArray(prevValue)) {
      nextValue = [...prevValue.filter((value) => value != undefined)];
    }

    nextValue.push(value);

    return self.update({
      ...self.value,
      [type]: nextValue,
    }, args);
  };

  const makeInitialStateMethod = (
    not?: true,
  ) => {
    return (
      children: m.Children,
    ) => {
      return m(
        ActionStateRenderer,
        {
          not,
          type: 'initial',
          args: {},
          submitResult,
          parentArgs: childArgs as SelectionParentArgs,
        },
        children,
      );
    }
  }

  const makeActionStateMethod = (
    type: 'success' | 'failure',
    not?: true,
  ) => {
    return (
      arg1?: Selector | OctironSelectArgs | SelectView,
      arg2?: OctironSelectArgs | SelectView,
      arg3?: SelectView,
    ) => {
      const [selector, args, view] = unravelArgs(arg1, arg2, arg3);

      return m(ActionStateRenderer, {
        not,
        type,
        selector,
        args,
        view,
        submitResult,
        parentArgs: childArgs as SelectionParentArgs,
      });
    }
  }

  self.initial = makeInitialStateMethod();
  self.not.initial = makeInitialStateMethod(true);
  self.success = makeActionStateMethod('success');
  self.not.success = makeActionStateMethod('success', true);
  self.failure = makeActionStateMethod('failure');
  self.not.failure = makeActionStateMethod('failure', true);

  try {
    const submitDetails = getSubmitDetails({
      payload: self.value,
      action: rendererArgs.value as SCMAction,
    });
    self.url = new URL(submitDetails.url);
    self.method = submitDetails.method;
  } catch (err) {
    console.error(err);
  }

  if (self.url != null) {
    submitResult = parentArgs.store.entity(self.url.toString());
  }

  if (
    typeof window === 'undefined' && args.submitOnInit &&
    submitResult == null
  ) {
    self.submit();
  } else if (typeof window !== 'undefined' && args.submitOnInit) {
    self.submit();
  }

  return self as OctironAction & InstanceHooks;
}
