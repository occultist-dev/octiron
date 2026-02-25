import {isJSONObject} from "@occultist/mini-jsonld";
import m from 'mithril';
import {selectionFactory} from "../factories/selectionFactory.ts";
import {Store} from '../store.ts';
import type {ActionParentArgs, CommonRendererArgs, JSONObject, Mutable, OctironPerformArgs, OctironSelection, PerformRendererArgs, PerformView, ReadonlySelectionResult, SelectionDetails, SelectionParentArgs, ValueSelectionResult} from "../octiron.ts";
import {mithrilRedraw} from "../utils/mithrilRedraw.ts";
import {ActionRenderer} from "./ActionRenderer.ts";


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

/**
 * The perform renderer is responsible for selecting the target of
 * a call to `o.perform()`. If successful it passes the result of
 * the selection to the `ActionRenderer` or renders loading / failure
 * states.
 */
export const PerformRenderer: m.ComponentTypes<PerformRendererAttrs> = class {

  data = new class {
    key: symbol = Symbol('PerformRenderer');
    store!: Store;
    selector?: string;
    attrs!: PerformRendererAttrs;
    instances!: Map<string, Instance>;
    selectionDetails!: SelectionDetails<ReadonlySelectionResult>;
  }

  async fetchRequired(): Promise<void> {
    if (this.data.selectionDetails.required.length === 0) return;

    const promises: Array<Promise<unknown>> = [];

    for (let i = 0, l = this.data.selectionDetails.required.length; i < l; i++) {
      promises.push(this.data.store.fetch(this.data.selectionDetails.required[i]));
    }

    await Promise.allSettled(promises);
  }

  createInstances() {
    let hasChanges = false;
    let firstPass = this.data.instances == null;
    const nextKeys: Array<string> = [];
    
    this.data.instances = new Map();

    for (let index = 0; index < this.data.selectionDetails.result.length; index++) {
      const selectionResult = this.data.selectionDetails.result[index];

      nextKeys.push(selectionResult.pointer);

      if (this.data.instances.has(selectionResult.pointer)) {
        const next = selectionResult;
        const prev = this.data.instances.get(selectionResult.pointer).selectionResult;

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

      hasChanges = true;
      const selectionRendererArgs = {
        index,
        value: selectionResult.value,
        propType: selectionResult.type === 'entity' ? undefined : selectionResult.propType,
      } satisfies CommonRendererArgs;
      const octiron = selectionFactory(
        this.data.attrs.args,
        this.data.attrs.parentArgs as SelectionParentArgs,
        selectionRendererArgs,
      );
      const rendererArgs: PerformRendererArgs = {
        index,
        value: selectionResult.value,
        propType: selectionResult.type === 'entity' ? undefined : selectionResult.propType,
        actionValue: octiron as OctironSelection,
      };

      this.data.instances.set(selectionResult.pointer, {
        octiron,
        selectionResult,
        rendererArgs,
      });
    }

    for (const key of this.data.instances.keys()) {
      if (!nextKeys.includes(key)) {
        hasChanges = true;

        this.data.instances.delete(key);
      }
    }

    if (!firstPass && hasChanges) {
      mithrilRedraw();
    }
  }

  storeListener = (selectionDetails: SelectionDetails<ReadonlySelectionResult>) => {
    this.data.selectionDetails = selectionDetails;

    this.createInstances();
    this.fetchRequired();
  }

  subscribe() {
    if (this.data.attrs.selector != null &&
        !isJSONObject(this.data.attrs.parentArgs.parent.value)
    ) {
      // Actions can only be performed on JSON objects.
      return;
    }

    if (this.data.attrs.selector != null) {
      this.data.selectionDetails = this.data.store.subscribe({
        key: this.data.key,
        listener: this.storeListener,
        selector: this.data.attrs.selector,
        value: this.data.attrs.parentArgs.parent.value as JSONObject,
      });

      this.fetchRequired();
    } else {
      // If there is no selector this perform is being done against the
      // current value.
      this.data.selectionDetails = {
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
          value: this.data.attrs.parentArgs.parent.value as JSONObject,
        } satisfies ValueSelectionResult],
      }
    }

    this.createInstances();
  }
  
  oninit(vnode: m.Vnode<PerformRendererAttrs>) {
    this.data.store = vnode.attrs.args.store ?? vnode.attrs.parentArgs.store;
    this.data.attrs = vnode.attrs;
    
    this.subscribe();
  }

  onbeforeupdate(vnode: m.Vnode<PerformRendererAttrs>) {
    const store = vnode.attrs.args.store ?? vnode.attrs.parentArgs.store;
    this.data.attrs = vnode.attrs;

    if (store !== this.data.store) {
      this.data.store.unsubscribe(this.data.key);
      this.data.store = store;
      this.subscribe();
    } else {
      this.data.store = store;
    }
  }

  onbeforeremove() {
    this.data.store.unsubscribe(this.data.key);
  }

  view(vnode: m.Vnode<PerformRendererAttrs>) {
    if (!this.data.selectionDetails?.complete) {
      return vnode.attrs.args.loading;
    }

    const children: m.Children[] = [vnode.attrs.args.pre];
    const list = Array.from(this.data.instances.values())

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
        children.push(m(ActionRenderer, {
          args: vnode.attrs.args,
          parentArgs: vnode.attrs.parentArgs,
          rendererArgs: list[i].rendererArgs,
          selection: list[i].octiron,
          view: vnode.attrs.view,
        }));
      }
    }

    children.push(vnode.attrs.args.post);

    if (vnode.attrs.selector != null) {
    console.log('PERFORM 2');
      console.log(children)
    }

    return children;
  }
}
