import {isJSONObject} from "@occultist/mini-jsonld";
import m from 'mithril';
import {selectionFactory} from "../factories/selectionFactory.ts";
import type {CommonRendererArgs, JSONObject, JSONValue, Mutable, OctironSelectArgs, OctironSelection, ReadonlySelectionResult, SelectionDetails, SelectionListener, SelectionParentArgs, SelectView, Store} from "../octiron.ts";
import type {InstanceHooks} from "../factories/octironFactory.ts";


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
  selectionResult: ReadonlySelectionResult;
  refs?: SelectionRefs,
  octiron?: OctironSelection;
  hooks?: InstanceHooks;
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

  instances.clear();

  for (let i = 0, l = selectionDetails.result.length; i < l; i++) {
    selectionResult = selectionDetails.result[i];
    
    if (prev.has(selectionResult.key) && selectionResult.type !== 'alternative') {
      const instance = prev.get(selectionResult.key);

      instance.refs.rendererArgs.index = i;
      instance.refs.rendererArgs.value = selectionResult.value;
      instance.refs.rendererArgs.propType = selectionResult.type === 'entity'
        ? undefined
        : selectionResult.propType;

      instance.hooks.rendererArgsChanged();
      
      instances.set(selectionResult.key, instance);
    } else if (selectionResult.type != 'alternative') {
      const rendererArgs = {
        index: i,
        value: selectionResult.value,
        propType: selectionResult.type === 'entity' ? undefined : selectionResult.propType,
      } satisfies CommonRendererArgs;

      const [octiron, hooks] = selectionFactory(
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
        selectionResult,
        octiron,
        hooks,
      });
    } else {
      instances.set(selectionResult.key, {
        selectionResult,
      });
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
  let value!: JSONValue;
  let instances!: Map<string, Instance>;

  const listener = (selectionDetails: SelectionDetails<ReadonlySelectionResult>) => {
    loading = !selectionDetails.complete;

    if (selectionDetails.required.length > 0) {
      fetchRequired(
        store,
        args,
        selectionDetails,
      );
    } else if (!loading) {
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
      value = parentArgs.value;
      instances = new Map();
      
      loading = !subscribe(key, listener, instances, store, entity, selector, args, parentArgs)?.complete;
    },
    onbeforeupdate(vnode) {
      const prev = store;
      const changed = 
        entity != (vnode.attrs.entity ?? false) ||
        store !== (vnode.attrs.args.store ?? vnode.attrs.parentArgs.store) ||
        selector !== vnode.attrs.selector ||
        value !== vnode.attrs.parentArgs.value;

      store = vnode.attrs.args.store ?? vnode.attrs.parentArgs.store;
      entity = vnode.attrs.entity ?? false;
      selector = vnode.attrs.selector;
      args = vnode.attrs.args;
      parentArgs = vnode.attrs.parentArgs;
      value = parentArgs.value;
      
      if (changed) {
        prev.unsubscribe(key);
        loading = !subscribe(key, listener, instances, store, entity, selector, args, parentArgs)?.complete;
      }
    },
    onbeforeremove() {
      store.unsubscribe(key);
    },
    view(vnode) {
      if (loading && instances.size === 0) {
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

        if (l2[i].octiron !== undefined) {
          (l2[i].octiron as Mutable<OctironSelection>).position = i + 1;
        }

        if (i !== 0) child.push(m.fragment({ key: '@sep' }, [vnode.attrs.args.sep]));

        if (l2[i].selectionResult.type === 'value') {
          child.push(m.fragment({ key: '@value' }, [vnode.attrs.view(l2[i].octiron)]));
        } else if (!l2[i].selectionResult.ok && typeof vnode.attrs.args.fallback === 'function') {
          throw new Error(`Fallback functions are not yet supported`);
        } else if (!l2[i].selectionResult.ok) {
          child.push(m.fragment({ key: '@value' }, [vnode.attrs.args.fallback as m.Children]));
        } else if (l2[i].selectionResult.type === 'entity') {
          child.push(m.fragment({ key: '@value' }, [vnode.attrs.view(l2[i].octiron)]));
        } else {
          child.push(m.fragment({ key: '@value' }, [
            l2[i].selectionResult.integration.render(
              vnode.attrs.parentArgs.parent,
              vnode.attrs.args.fragment,
            ),
          ]));
        }

        children.push(m.fragment({ key: l2[i].selectionResult.key }, child));
      }

      children.push(m.fragment({ key: '@post' }, [vnode.attrs.args.post]));
      
      return children;
    },
  };
}
