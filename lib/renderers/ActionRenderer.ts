import m from 'mithril';
import {actionFactory} from '../factories/actionFactory.ts';
import type {ActionParentArgs, ActionSelectionDetailsListener, AlternativeSelectionResult, EntityState, OctironAction, OctironPerformArgs, OctironSelection, PerformRendererArgs, PerformView, ReadonlySelectionResult, SelectionDetails, SelectionListener, SelectionResult, Selector, Store, ValueSelectionResult} from '../octiron.ts';
import {isIRIObject} from '../utils/isIRIObject.ts';
import type {InstanceHooks} from '../factories/octironFactory.ts';


export type ActionRendererAttrs = {
  args: OctironPerformArgs;
  parentArgs: ActionParentArgs;
  rendererArgs: PerformRendererArgs;
  selection: OctironSelection;
  selector?: Selector;
  view: PerformView;
};


function applySubmission(
  key: symbol,
  listener: SelectionListener,
  store: Store,
  args: OctironPerformArgs,
  submitResult: EntityState,
  listeners: ActionSelectionDetailsListener[],
) {
  let selectionResult: SelectionResult;
  let selectionDetails: SelectionDetails<ReadonlySelectionResult>;

  if (submitResult.type !== 'alternative-success' &&
    isIRIObject(submitResult.value)) {
    selectionDetails = store.subscribe({
      key,
      listener,
      selector: submitResult.value['@id'],
    });
  } else {
    if (submitResult.type === 'entity-success') {
      selectionResult = {
        key: '/',
        pointer: '/',
        type: 'value',
        readonly: true,
        status: submitResult.status,
        reason: submitResult.reason,
        value: submitResult.value,
      } satisfies ValueSelectionResult;
    } else if (submitResult.type === 'alternative-success') {
      selectionResult = {
        key: '/',
        pointer: '/',
        type: 'alternative',
        iri: submitResult.iri,
        fragment: submitResult.fragment,
        accept: args.accept,
        ok: submitResult.ok,
        status: submitResult.status,
        contentType: submitResult.contentType,
        reason: submitResult.reason,
        integration: store.integration(submitResult.contentType),
      } satisfies AlternativeSelectionResult;
    }
    
    store.unsubscribe(key);
    
    selectionDetails = {
      complete: true,
      hasErrors: !submitResult.ok,
      hasMissing: false,
      isProblem: submitResult.isProblem,
      fragment: args.fragment,
      accept: args.accept,
      dependencies: [],
      required: [],
      result: [selectionResult as ReadonlySelectionResult],
      selector: submitResult.iri,
    };
  }

  for (let i = 0, l = listeners.length; i < l; i++) {
    listeners[i](
      submitResult,
      selectionDetails,
    );
  }

  return selectionDetails;
}

export const ActionRenderer: m.ClosureComponent<ActionRendererAttrs> = () => {
  const key = Symbol('ActionRenderer');
  let octiron!: OctironAction;
  let hooks!: InstanceHooks;
  let store!: Store;
  let args!: OctironPerformArgs;
  let parentArgs!: ActionParentArgs;
  let submitResult: EntityState | undefined;
  let selectionDetails: SelectionDetails<ReadonlySelectionResult> | undefined;
  const listeners: ActionSelectionDetailsListener[] = [];

  const addListener = (listener: ActionSelectionDetailsListener) => {
    listeners.push(listener);

    if (submitResult != null) {
      listener(submitResult, selectionDetails);
    }
  }

  const removeListener = (listener: ActionSelectionDetailsListener) => {
    listeners.splice(listeners.indexOf(listener), 1);
  }

  const listener = (next: SelectionDetails<ReadonlySelectionResult>) => {
    selectionDetails = next;

    for (let i = 0, l = listeners.length; i < l; i++) {
      listeners[i](submitResult, selectionDetails);
    }
  }

  const onSubmitResult = (next: EntityState) => {
    submitResult = next;

    selectionDetails = applySubmission(key, listener, store, args, submitResult, listeners);
  }

  return {
    oninit(vnode) {
      store = vnode.attrs.args.store ?? vnode.attrs.parentArgs.store;
      args = vnode.attrs.args;
      parentArgs = vnode.attrs.parentArgs;
      [octiron, hooks] = actionFactory(
        args,
        parentArgs,
        vnode.attrs.rendererArgs,
        {
          onSubmitResult,
          addListener,
          removeListener,
        },
      );
    },
    onbeforeupdate(vnode) {
      const prev = store;
      const changed = prev !== (vnode.attrs.args.store ?? vnode.attrs.parentArgs.store);

      args = vnode.attrs.args;
      parentArgs = vnode.attrs.parentArgs;
      store = args.store ?? parentArgs.store;

      if (changed) {
        store.unsubscribe(key);

        if (submitResult != null) {
          onSubmitResult(submitResult);
        }
      }
    },
    onbeforeremove() {
      store.unsubscribe(key);
    },
    view(vnode) {
      return vnode.attrs.view(octiron);
    },
  };
}
