import m from 'mithril';
import {parseArgs} from "node:util";
import {ActionParentArgs, CommonRendererArgs, EntitySelectionResult, JSONObject, OctironPerformArgs, OctironSelection, PerformRendererArgs, ReadonlySelectionResult, SelectionDetails, SelectionParentArgs, SelectionResult, Store, ValueSelectionResult} from "../octiron";
import {isIRIObject} from "../utils/isIRIObject";
import {isJSONObject} from "@occultist/mini-jsonld";
import {selectionFactory} from "../factories/selectionFactory";
import {mithrilRedraw} from "../utils/mithrilRedraw";


export type PerformRendererAttrs = {
  selector?: string;
  args: OctironPerformArgs;
  parentArgs: ActionParentArgs;
};

type Instance = {
  octiron: OctironSelection;
  selectionResult: ReadonlySelectionResult;
};

/**
 * The perform renderer is responsible for selecting the target of
 * a call to `o.perform()`. If successful it passes the result of
 * the selection to the `ActionRenderer` or renders loading / failure
 * states.
 */
export const PerformRenderer: m.ComponentTypes<PerformRendererAttrs> = new class {

  state = new class {
    key: symbol = Symbol('PerformRenderer');
    store!: Store;
    attrs!: PerformRendererAttrs;
    instances!: Map<string, Instance>;
    selectionDetails!: SelectionDetails<ReadonlySelectionResult>;
  }

  async fetchRequired(): Promise<void> {
    if (this.state.selectionDetails.required.length === 0) return;

    const promises: Array<Promise<unknown>> = [];

    for (let i = 0, l = this.state.selectionDetails.required.length; i < l; i++) {
      promises.push(this.state.store.fetch(this.state.selectionDetails.required[i]));
    }

    await Promise.allSettled(promises);
  }

  createInstances() {
    let hasChanges = false;
    let firstPass = this.state.instances == null;
    const nextKeys: Array<string> = [];
    
    this.state.instances = new Map();

    for (let index = 0; index < this.state.selectionDetails.result.length; index++) {
      const selectionResult = this.state.selectionDetails.result[index];

      nextKeys.push(selectionResult.pointer);

      if (this.state.instances.has(selectionResult.pointer)) {
        const next = selectionResult;
        const prev = this.state.instances.get(selectionResult.pointer).selectionResult;

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

      const octiron = selectionFactory(
        this.state.attrs.args,
        this.state.attrs.parentArgs as SelectionParentArgs,
        {
          index,
          value: selectionResult.value,
          propType: selectionResult.type === 'entity' ? undefined : selectionResult.propType,
        } satisfies CommonRendererArgs,
      );

      this.state.instances.set(selectionResult.pointer, {
        octiron,
        selectionResult,
      });
    }

    for (const key of this.state.instances.keys()) {
      if (!nextKeys.includes(key)) {
        hasChanges = true;

        this.state.instances.delete(key);
      }
    }

    if (!firstPass && hasChanges) {
      mithrilRedraw();
    }
  }

  storeListener = (selectionDetails: SelectionDetails<ReadonlySelectionResult>) => {
    this.state.selectionDetails = selectionDetails;

    this.createInstances();
    this.fetchRequired();
  }

  subscribe() {
    if (this.state.attrs.selector != null &&
        !isJSONObject(this.state.attrs.parentArgs.parent.value)
    ) {
      // Actions can only be performed on JSON objects.
      return;
    }

    if (this.state.attrs.selector != null) {
      this.state.selectionDetails = this.state.store.subscribe({
        key: this.state.key,
        listener: this.storeListener,
        selector: this.state.attrs.selector,
        value: this.state.attrs.parentArgs.parent.value as JSONObject,
      });

      this.fetchRequired();
    } else {
      // If there is no selector this perform is being done against the
      // current value.
      this.state.selectionDetails = {
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
          value: this.state.attrs.parentArgs.parent.value as JSONObject,
        } satisfies ValueSelectionResult],
      }
    }

    this.createInstances();
  }
  
  oninit({ attrs }) {
    this.state.store = attrs.args
    this.state.attrs = attrs;
    
    this.subscribe();
  }

  onbeforeupdate({ attrs }) {
    this.state.attrs = attrs;
  }

  onbeforeremove() {
    this.state.store.unsubscribe(this.state.key);
  }
}
