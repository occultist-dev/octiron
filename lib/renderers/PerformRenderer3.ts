import {isJSONObject} from '@occultist/mini-jsonld';
import m from 'mithril';
import {selectionFactory} from '../factories/selectionFactory.ts';
import type {ActionParentArgs, CommonRendererArgs, JSONObject, Mutable, OctironPerformArgs, OctironSelection, PerformRendererArgs, PerformView, ReadonlySelectionResult, SelectionDetails, SelectionListener, SelectionParentArgs, Store, ValueSelectionResult} from '../octiron.ts';
import {ActionRenderer2} from './ActionRenderer2.ts';


export type PerformRendererAttrs = {
  selector?: string;
  args: OctironPerformArgs;
  view: PerformView;
  parentArgs: ActionParentArgs;
};

type Instance = {
  octiron: OctironSelection;
  selectionResult: ReadonlySelectionResult;
  rendererArgs: PerformRendererArgs;
};


function createInstances(
  instances: Map<string, Instance>,
  args: OctironPerformArgs,
  parentArgs: ActionParentArgs,
  selectionDetails: SelectionDetails<ReadonlySelectionResult>,
) {
  const prevKeys = Array.from(instances.keys());
  const nextKeys: Array<string> = [];

  for (let i = 0, l = selectionDetails.result.length; i < l; i++) {
    const selectionResult = selectionDetails.result[i];

    nextKeys.push(selectionResult.pointer);

    if (instances.has(selectionResult.pointer)) {
      const next = selectionResult;
      const prev = instances.get(selectionResult.pointer).selectionResult;

      if (
        prev.type === 'value' &&
        next.type === 'value' &&
        next.value === prev.value
      ) {
        continue;
      } else if (
        prev.type === 'entity' &&
        next.type === 'entity' &&
        next.ok === prev.ok &&
        next.status === prev.status &&
        next.value === prev.value
      ) {
        continue;
      }
    }

    const selectionRendererArgs = {
      index: i,
      value: selectionResult.value,
      propType: selectionResult.type === 'entity' ? undefined : selectionResult.propType,
    } satisfies CommonRendererArgs;
    const octiron = selectionFactory(
      args,
      parentArgs as SelectionParentArgs,
      selectionRendererArgs,
    );
    const rendererArgs: PerformRendererArgs = {
      index: i,
      value: selectionResult.value,
      propType: selectionResult.type === 'entity' ? undefined : selectionResult.propType,
      actionValue: octiron as OctironSelection,
    };

    instances.set(selectionResult.pointer, {
      octiron,
      selectionResult,
      rendererArgs,
    });
  }

  if (prevKeys.length > 0) {
    for (let i = 0, l = prevKeys.length; i < l; i++) {
      if (!nextKeys.includes(prevKeys[i])) {
        instances.delete(prevKeys[i]);
      }
    }
  }
}

async function fetchRequired(
  store: Store,
  selectionDetails: SelectionDetails<ReadonlySelectionResult>,
) {
  if (selectionDetails.required.length === 0) return;

  const promises: Array<Promise<unknown>> = [];

  for (let i = 0, l = selectionDetails.required.length; i < l; i++) {
    promises.push(store.fetch(selectionDetails.required[i]));
  }

  await Promise.allSettled(promises)
}

function subscribe(
  key: symbol,
  listener: SelectionListener,
  instances: Map<string, Instance>,
  store: Store,
  selector: string | undefined,
  args: OctironPerformArgs,
  parentArgs: ActionParentArgs,
): SelectionDetails<ReadonlySelectionResult> {
  if (selector != null &&
      !isJSONObject(parentArgs.parent.value)
  ) {
    // Actions can only be performed on JSON objects.
    return;
  }

  let selectionDetails: SelectionDetails<ReadonlySelectionResult>;

  if (selector != null) {
    selectionDetails = store.subscribe({
      key,
      listener,
      selector,
      value: parentArgs.parent.value as JSONObject,
    });
  } else {
    // If there is no selector this perform is being done against the
    // current value.
    selectionDetails = {
      selector: '/',
      complete: true,
      hasErrors: false,
      hasMissing: false,
      isProblem: false,
      dependencies: [],
      required: [],
      result: [{
        key: '/',
        pointer: '/',
        type: 'value',
        readonly: true,
        value: parentArgs.parent.value as JSONObject,
      } satisfies ValueSelectionResult],
    }

    createInstances(
      instances,
      args,
      parentArgs,
      selectionDetails,
    );
  }

  return selectionDetails;
}

export const PerformRenderer3: m.ClosureComponent<PerformRendererAttrs> = () => {
  let key = Symbol('PerformRenderer');
  let loading!: boolean;
  let store!: Store;
  let selector: string | undefined;
  let args!: OctironPerformArgs;
  let parentArgs!: ActionParentArgs;
  let instances!: Map<string, Instance>;

  const listener = (selectionDetails: SelectionDetails<ReadonlySelectionResult>) => {
    loading = !selectionDetails.complete;

    if (selectionDetails.required.length > 0) {
      fetchRequired(
        store,
        selectionDetails,
      );
    } else {
      createInstances(
        instances,
        args,
        parentArgs,
        selectionDetails,
      );
    }
  };

  return {
    oninit(vnode) {
      store = vnode.attrs.args.store ?? vnode.attrs.parentArgs.store;
      selector = vnode.attrs.selector;
      args = vnode.attrs.args;
      parentArgs = vnode.attrs.parentArgs;
      instances = new Map();
      
      loading = !subscribe(key, listener, instances, store, selector, args, parentArgs).complete;
    },
    onbeforeupdate(vnode) {
      const prev = store;
      const changed = 
        store !== (vnode.attrs.args.store ?? vnode.attrs.parentArgs.store) ||
        selector !== vnode.attrs.selector;

      store = vnode.attrs.args.store ?? vnode.attrs.parentArgs.store;
      selector = vnode.attrs.selector;
      args = vnode.attrs.args;
      parentArgs = vnode.attrs.parentArgs;
      
      if (changed) {
        prev.unsubscribe(key);
        loading = !subscribe(key, listener, instances, store, selector, args, parentArgs).complete;
      }
    },
    onbeforeremove() {
      store.unsubscribe(key);
    },
    view(vnode) {
      if (loading) {
        return vnode.attrs.args.loading;
      }

      const children: m.Children[] = [vnode.attrs.args.pre];
      const list = Array.from(instances.values())

      for (let i = 0, l = list.length; i < l; i++) {
        (list[i].octiron as Mutable<OctironSelection>).position = i + 1;

        if (i !== 0) children.push(vnode.attrs.args.sep);

        if (list[i].selectionResult.type !== 'value' &&
            !list[i].selectionResult.ok) {
          if (typeof vnode.attrs.args.fallback === 'function') {
            children.push(vnode.attrs.args.fallback(
              list[i].octiron,
              list[i].selectionResult.reason,
            ));
          } else {
            children.push(vnode.attrs.args.fallback);
          }
        } else {
          children.push(m(ActionRenderer2, {
            args: vnode.attrs.args,
            parentArgs: vnode.attrs.parentArgs,
            rendererArgs: list[i].rendererArgs,
            selection: list[i].octiron,
            view: vnode.attrs.view,
          }));
        }
      }

      children.push(vnode.attrs.args.post);

      return children;
    },
  };
}
