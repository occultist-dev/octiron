import {JsonPointer} from 'json-ptr';
import m from 'mithril';
import {ActionSelectionRenderer} from "../renderers/ActionSelectionRenderer.ts";
import {ActionStateRenderer} from "../renderers/ActionStateRenderer.ts";
import type {Store} from "../store.ts";
import type {JSONArray, JSONObject, JSONValue, SCMAction} from "../types/common.ts";
import type {ActionParentArgs, ActionSelectionParentArgs, ActionSelectView, OctironAction, OctironActionSelectionArgs, OctironPerformArgs, OctironSelectArgs, PayloadValueMapper, PerformRendererArgs, SelectionParentArgs, Selector, SelectView, TypeHandlers, UpdateArgs, UpdatePointer} from "../types/octiron.ts";
import type {EntityState} from "../types/store.ts";
import {expandValue} from '../utils/expandValue.ts';
import {getSubmitDetails} from "../utils/getSubmitDetails.ts";
import {isJSONObject} from "../utils/isJSONObject.ts";
import {mithrilRedraw} from "../utils/mithrilRedraw.ts";
import {unravelArgs} from "../utils/unravelArgs.ts";
import {type FactoryRefs, type InstanceHooks, octironFactory} from "./octironFactory.ts";
import {isBrowserRender} from '../consts.ts';

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
    let isError = false;
    const { url, method, body, contentType, encodingType } = getSubmitDetails({
      payload,
      action: refs.rendererArgs.value as SCMAction,
    });


    self.submitting = true;
    self.url = new URL(url, self.store.rootIRI);

    mithrilRedraw();

    try {
      if (typeof args.onSubmit === 'function') {
        args.onSubmit(self as unknown as OctironAction);
      }

      submitResult = await refs.parentArgs.store.submit(url, {
        mainEntity: args.mainEntity,
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

    if (isError && typeof args.onSubmitFailure === 'function' && isBrowserRender) {
      args.onSubmitFailure(self as unknown as OctironAction);
    } else if (!isError && typeof args.onSubmitSuccess === 'function' && isBrowserRender) {
      args.onSubmitSuccess(self as unknown as OctironAction);
    }
  }

  function update(value: JSONObject): boolean | void {
    const prev = payload;
    const next = {
      ...prev,
      ...value,
    };

    if (typeof args.interceptor === 'function') {
      const res = args.interceptor({
        next,
        prev,
        actionValue: refs.parentArgs.parent.value as SCMAction,
        o: self as unknown as OctironAction,
      });

      if (res === false) {
        return false;
      }

      payload = res;
    } else {
      payload = next;
    }

    childArgs.value = self.value = value;

    if (args.submitOnChange) {
      submit();
    } else {
      mithrilRedraw();
    }
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

  const refs = {
    factoryArgs,
    parentArgs,
    rendererArgs,
    childArgs,
  } as FactoryRefs;

  const self = octironFactory(
    'action',
    refs,
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

    return m(ActionSelectionRenderer, {
      parentArgs: childArgs as ActionSelectionParentArgs,
      selector,
      value: self.value,
      actionValue: refs.parentArgs.parent.value as JSONObject,
      args,
      view,
    });
  };

  self.submit = async function (
    arg1?: PayloadValueMapper<JSONObject> | JSONObject
  ): Promise<void> {
    if (arg1 != null) {
      const res = typeof arg1 === 'function'
        ? update(arg1(payload))
        : update(arg1);

      if (res === false) return;
    }

    return submit();
  } as OctironAction['submit'];

  self.update = async function (
    arg1: PayloadValueMapper<JSONObject> | JSONObject,
    arg2?: UpdateArgs,
  ): Promise<void> {
    const res = typeof arg1 === 'function'
      ? update(arg1(payload))
      : update(arg1);

    if (res === false) return;

    if (arg2?.submit || args.submitOnChange) {
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
    const type = refs.parentArgs.store.expand(termOrType);

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
      action: refs.rendererArgs.value as SCMAction,
    });

    self.url = new URL(submitDetails.url);
    self.method = submitDetails.method;
  } catch (err) {
    console.error(err);
  }

  if (self.url != null) {
    submitResult = refs.parentArgs.store.entity(self.url.toString(), args.accept);

    console.log('SUBMIT RESULT')
    console.log(JSON.stringify(submitResult, null, 2));
  }

  if (
    isBrowserRender &&
    args.submitOnInit &&
    submitResult == null
  ) {
    submit();
  } else if (
    !isBrowserRender &&
    args.submitOnInit) {
    submit();
  }

  return self as OctironAction & InstanceHooks;
}
