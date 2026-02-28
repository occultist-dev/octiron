import {isJSONObject} from "@occultist/mini-jsonld";
import m from 'mithril';
import {selectionFactory} from "../factories/selectionFactory.ts";
import type {CommonRendererArgs, JSONObject, Mutable, OctironSelectArgs, OctironSelection, ReadonlySelectionResult, SelectionDetails, SelectionListener, SelectionParentArgs, SelectionResult, SelectView, Store} from "../octiron.ts";
import {setDefaultResultOrder} from "node:dns";


export type SelectionRendererAttrs = {
  entity?: boolean;
  selector?: string;
  args: OctironSelectArgs;
  view: SelectView;
  parentArgs: SelectionParentArgs;
}

type SelectionRefs = {
  args: OctironSelectArgs;
  parentArgs: SelectionParentArgs;
  rendererArgs: CommonRendererArgs;
};

type Instance = {
  refs: SelectionRefs,
  selectionResult: ReadonlySelectionResult;
  octiron: OctironSelection;
};


/**
 * Creates Octiron instances used when rendering this selection.
 * If an instance is an entity it will get re-ordered into the
 * next selection. Otherwise it will be re-purposed.
 */
function createInstances(
  instances: Map<string, Instance>,
  args: OctironSelectArgs,
  parentArgs: SelectionParentArgs,
  selectionDetails: SelectionDetails<ReadonlySelectionResult>,
): void {
  let selectionResult: ReadonlySelectionResult;
  const prev = new Map(instances);

  if (selectionDetails.result.length === 2)
  //console.log('PREV', prev)

  instances.clear();

  for (const key of instances.keys()) {
    instances.delete(key);
  }

  console.log(JSON.stringify(selectionDetails, null, 2));

  console.log('INSTANCES', new Map(instances.entries()));
  console.log('KEYS', selectionDetails.result.map((r) => r.key));


  for (let i = 0, l = selectionDetails.result.length; i < l; i++) {
    selectionResult = selectionDetails.result[i];

    //console.log('KEY', selectionResult.key);

    if (prev.has(selectionResult.key)) {
      const instance = prev.get(selectionResult.key);

      instance.refs.rendererArgs.index = i;
      instance.refs.rendererArgs.value = selectionResult.value;
      instance.refs.rendererArgs.propType = selectionResult.type === 'entity'
        ? undefined
        : selectionResult.propType;
      
      (instance.octiron as any).index = i;
      (instance.octiron as any).value = instance.refs.rendererArgs.value;
      (instance.octiron as any).propType = instance.refs.rendererArgs.propType;
      
      instances.set(selectionResult.key, instance);
    } else {
      const rendererArgs = {
        index: i,
        value: selectionResult.value,
        propType: selectionResult.type === 'entity' ? undefined : selectionResult.propType,
      } satisfies CommonRendererArgs;

      const octiron = selectionFactory(
        args,
        parentArgs as SelectionParentArgs,
        rendererArgs,
      );

      const refs = {
        args,
        parentArgs,
        rendererArgs,
      };
  
      instances.set(selectionResult.key, {
        refs,
        octiron,
        selectionResult,
      });
    }
  }
}

function createInstancesOld(
  instances: Map<string, Instance>,
  args: OctironSelectArgs,
  parentArgs: SelectionParentArgs,
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

    instances.set(selectionResult.pointer, {
      octiron,
      selectionResult,
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
  args: OctironSelectArgs,
  selectionDetails: SelectionDetails<ReadonlySelectionResult>,
) {
  if (selectionDetails.required.length === 0) return;

  const promises: Array<Promise<unknown>> = [];

  for (let i = 0, l = selectionDetails.required.length; i < l; i++) {
    promises.push(store.fetch(selectionDetails.required[i], args));
  }

  await Promise.allSettled(promises)
}

function subscribe(
  key: symbol,
  listener: SelectionListener,
  instances: Map<string, Instance>,
  store: Store,
  entity: boolean,
  selector: string | undefined,
  args: OctironSelectArgs,
  parentArgs: SelectionParentArgs,
): SelectionDetails<ReadonlySelectionResult> {
  if (!entity && !isJSONObject(parentArgs.parent.value)) {
    store.unsubscribe(key);
    instances.clear();

    return;
  }

  const selectionDetails = store.subscribe({
    key,
    selector,
    listener,
    fragment: args.fragment,
    accept: args.accept,
    value: entity ? undefined : parentArgs.value as JSONObject,
    mainEntity: args.mainEntity,
  });

  if (selectionDetails.required.length > 0) {
    fetchRequired(store, args, selectionDetails);
  }

  createInstances(
    instances,
    args,
    parentArgs,
    selectionDetails,
  );

  return selectionDetails;
}


export const SelectionRenderer2: m.ClosureComponent<SelectionRendererAttrs> = () => {
  let key = Symbol('SelectionRenderer');
  let loading!: boolean;
  let store!: Store;
  let entity!: boolean;
  let selector: string | undefined;
  let args!: OctironSelectArgs;
  let parentArgs!: SelectionParentArgs;
  let instances!: Map<string, Instance>;

  const listener = (selectionDetails: SelectionDetails<ReadonlySelectionResult>) => {
    loading = !selectionDetails.complete;

    if (selectionDetails.required.length > 0) {
      fetchRequired(
        store,
        args,
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
      entity = vnode.attrs.entity ?? false;
      selector = vnode.attrs.selector;
      args = vnode.attrs.args;
      parentArgs = vnode.attrs.parentArgs;
      instances = new Map();
      
      loading = !subscribe(key, listener, instances, store, entity, selector, args, parentArgs)?.complete;
    },
    onbeforeupdate(vnode) {
      const prev = store;
      const changed = 
        entity != vnode.attrs.entity ||
        store !== (vnode.attrs.args.store ?? vnode.attrs.parentArgs.store) ||
        selector !== vnode.attrs.selector;

      store = vnode.attrs.args.store ?? vnode.attrs.parentArgs.store;
      entity = vnode.attrs.entity ?? false;
      selector = vnode.attrs.selector;
      args = vnode.attrs.args;
      parentArgs = vnode.attrs.parentArgs;
      
      if (changed) {
        prev.unsubscribe(key);
        loading = !subscribe(key, listener, instances, store, entity, selector, args, parentArgs)?.complete;
      }
    },
    onbeforeremove() {
      store.unsubscribe(key);
    },
    view(vnode) {
      if (loading) {
        return vnode.attrs.args.loading;
      }

      const children: m.Children[] = [m.fragment({ key: '@pre' }, [vnode.attrs.args.pre])];
      let child: m.Children[];
      let l1: Instance[] = Array.from(instances.values())
      let l2: Instance[];

      if (vnode.attrs.args.predicate != null) {
        l2 = [];
        for (let i = 0, l = l1.length; i < l; i++) {
          if (vnode.attrs.args.predicate(l1[i].octiron)) {
            l2.push(l1[i]);
          }
        }
      } else {
        l2 = l1;
      }

      if (vnode.attrs.args.end != null) {
        l2.splice(0, vnode.attrs.args.end);
      }

      if (vnode.attrs.args.start != null) {
        l2.splice(vnode.attrs.args.start);
      }

      for (let i = 0, l = l2.length; i < l; i++) {
        child = [];

        (l2[i].octiron as Mutable<OctironSelection>).position = i + 1;

        if (i !== 0) child.push(m.fragment({ key: '@sep' }, [vnode.attrs.args.sep]));

        if (l2[i].selectionResult.type === 'value') {
          child.push(m.fragment({ key: '@value' }, [vnode.attrs.view(l2[i].octiron)]))
        } else if (!l2[i].selectionResult.ok && typeof vnode.attrs.args.fallback === 'function') {
          throw new Error(`Fallback functions are not yet supported`);
        } else if (!l2[i].selectionResult.ok) {
          child.push(m.fragment({ key: '@value' }, [vnode.attrs.args.fallback as m.Children]));
        } else {
          child.push(m.fragment({ key: '@value' }, [vnode.attrs.view(l2[i].octiron)]));
        }

        children.push(m.fragment({ key: l2[i].selectionResult.key }, child));
      }

      children.push(m.fragment({ key: '@post' }, [vnode.attrs.args.post]));
      
      return children;
    },
  };
}
