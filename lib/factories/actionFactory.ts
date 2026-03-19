import {JsonPointer} from 'json-ptr';
import m from 'mithril';
import {ActionSelectionRenderer} from "../renderers/ActionSelectionRenderer.ts";
import type {JSONArray, JSONObject, JSONValue, SCMAction} from "../types/common.ts";
import type {ActionEvents, ActionParentArgs, ActionSelectionParentArgs, ActionSelectView, OctironAction, OctironActionSelectionArgs, OctironPerformArgs, OctironSelectArgs, PayloadValueMapper, PerformRendererArgs, SelectionParentArgs, Selector, SelectView, TypeHandlers, UpdateArgs, UpdatePointer} from "../types/octiron.ts";
import type {EntityState} from "../types/store.ts";
import {expandValue} from '../utils/expandValue.ts';
import {getSubmitDetails} from "../utils/getSubmitDetails.ts";
import {isJSONObject} from "../utils/isJSONObject.ts";
import {mithrilRedraw} from "../utils/mithrilRedraw.ts";
import {unravelArgs} from "../utils/unravelArgs.ts";
import {type FactoryRefs, type InstanceHooks, octironFactory} from "./octironFactory.ts";
import {isBrowserRender} from '../consts.ts';
import {ActionStateRenderer} from '../renderers/ActionStateRenderer.ts';
import {ActionInitialStateRenderer} from '../renderers/ActionInitialStateRenderer.ts';
import type {StoreType} from '../store.ts';

const noProblem = Object.freeze(Object.create(null));

export type ActionRefs = {
  url?: string;
  method?: string;
  submitting: boolean;
  payload: JSONObject;
  store: StoreType;
  typeHandlers: TypeHandlers;
  submitResult?: EntityState;
};

export function actionFactory<
  Attrs extends Record<string, unknown> = Record<string, unknown>,
>(
  args: OctironPerformArgs<Attrs>,
  parentArgs: ActionParentArgs,
  rendererArgs: PerformRendererArgs,
  events: ActionEvents,
): [octiron: OctironAction, hooks: InstanceHooks] {
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
    const { url, method, contentType, body } = getSubmitDetails({
      payload,
      action: refs.rendererArgs.value as SCMAction,
    });


    self.submitting = true;
    self.problem = noProblem;
    self.url = new URL(url, self.store.rootIRI);

    if (self.url.hash !== '' && self.url.hash !== '#') {
      self.fragment = self.url.hash.replace(/^#/, '');
    } else {
      self.fragment = undefined;
    }

    mithrilRedraw();

    try {
      if (typeof args.onSubmit === 'function') {
        args.onSubmit(self as unknown as OctironAction);
      }

      submitResult = await refs.parentArgs.store.submit(url, {
        method,
        mainEntity: args.mainEntity,
        accept: args.accept,
        contentType: contentType ?? 'application/ld+json',
        body,
      });

      if (submitResult.integration?.integrationType === 'problem') {
        self.problem = submitResult.integration.problem;
      }

      if (submitResult != null) events.onSubmitResult(submitResult);
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

  function update(value: JSONObject, args2?: UpdateArgs): boolean | void {
    const prev = payload;
    let next = {
      ...prev,
      ...expandValue(parentArgs.store, value),
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

    childArgs.value = self.value = next;

    if (args2?.submit !== false && (args2?.submit || args.submitOnChange)) {
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

  const [self, hooks] = octironFactory(
    'action',
    refs,
  );

  self.value = payload;
  self.action = parentArgs.parent;
  self.actionValue = rendererArgs.actionValue;
  self.url = undefined;
  self.fragment = undefined;
  self.submitting = false;
  self.problem = noProblem;

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
      actionValue: refs.rendererArgs.actionValue.value as JSONObject,
      args,
      view,
    });
  };

  self.submit = async function (
    arg1?: PayloadValueMapper<JSONObject> | JSONObject
  ): Promise<void> {
    if (arg1 != null) {
      const res = typeof arg1 === 'function'
        ? update(arg1(payload), { submit: false })
        : update(arg1, { submit: false });

      if (res === false) return;
    }

    return submit();
  } as OctironAction['submit'];

  self.update = async function (
    arg1: PayloadValueMapper<JSONObject> | JSONObject,
    arg2?: UpdateArgs,
  ): Promise<void> {
    const res = typeof arg1 === 'function'
      ? update(arg1(payload), arg2)
      : update(arg1, arg2);

    if (res === false) return;
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
        ActionInitialStateRenderer,
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
        parentArgs: childArgs as SelectionParentArgs,
        events,
      });
    }
  }

  self.initial = makeInitialStateMethod();
  self.not.initial = makeInitialStateMethod(true);
  self.success = makeActionStateMethod('success');
  self.not.success = makeActionStateMethod('success', true);
  self.failure = makeActionStateMethod('failure');
  self.not.failure = makeActionStateMethod('failure', true);

  self.clearProblems = () => {
    self.problem = noProblem;
  };

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
    submitResult = refs.parentArgs.store.entity(self.url, {
      method: self.method,
    });
  }

  if (args.submitOnInit) {
    if (submitResult == null || submitResult.type === 'entity-loading') {
      submit();
    } else if (submitResult != null) {
      events.onSubmitResult(submitResult);
    }
  }

  Object.seal(self);

  const wrappedHooks: InstanceHooks = {
    argsChanged: () => {
      hooks.argsChanged();
    },
    parentArgsChanged: () => {
      hooks.parentArgsChanged();
    },
    rendererArgsChanged: () => {
      self.index = refs.rendererArgs.index;
    },
  };

  return [self, wrappedHooks] as [OctironAction, InstanceHooks];
}
