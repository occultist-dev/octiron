import m from 'mithril';
import type {ActionEvents, ActionParentArgs, ActionSelectionDetailsListener, AlternativeSelectionResult, EntityState, OctironAction, OctironPerformArgs, OctironSelection, PerformRendererArgs, PerformView, ReadonlySelectionResult, SelectionDetails, SelectionResult, Selector, Store, ValueSelectionResult} from "../octiron.ts";
import {isIRIObject} from '../utils/isIRIObject.ts';
import {actionFactory} from '../factories/actionFactory.ts';


export type ActionRendererAttrs = {
  args: OctironPerformArgs;
  parentArgs: ActionParentArgs;
  rendererArgs: PerformRendererArgs;
  selection: OctironSelection;
  selector?: Selector;
  view: PerformView;
};


/**
 * The action renderer creates an Octiron action instance
 * and holds the current state of the current response
 * object. The response object is held at this level
 * because an Octiron instance is not plumbed into Mithril's
 * lifecycle methods and cannot teardown subscriptions if 
 * the action is unmounted. It also does not make sense to
 * manipulate the response object in the `ActionStateRenderer`
 * component, since many of these components can be mounted and
 * there would be no clear source of truth.
 */
export const ActionRenderer: m.ComponentTypes<ActionRendererAttrs> = class implements m.Component<ActionRendererAttrs> {

  state = new class {
    key: symbol = Symbol('ActionRenderer');
    events!: ActionEvents;
    octiron!: OctironAction;
    store!: Store;
    attrs!: ActionRendererAttrs;
    submitResult?: EntityState;
    selectionDetails?: SelectionDetails<ReadonlySelectionResult>;
  }

  /**
   * The `o.success()` and `o.failure()` methods both need to have up to data
   * information on the current value held by the action.
   */
  listeners: ActionSelectionDetailsListener[] = [];

  addChildLister = (listener: ActionSelectionDetailsListener) => {
    this.listeners.push(listener);

    if (this.state.submitResult != null) {
      listener(
        this.state.submitResult,
        this.state.selectionDetails,
      );
    }
  }

  removeChildListener = (listener: ActionSelectionDetailsListener) => {
    const index = this.listeners.indexOf(listener);

    this.listeners.splice(index, 1);
  }

  storeListener = (selectionDetails: SelectionDetails<ReadonlySelectionResult>) => {
    this.state.selectionDetails = selectionDetails;

    for (let i = 0, l = this.listeners.length; i < l; i++) {
      this.listeners[i](
        this.state.submitResult,
        this.state.selectionDetails,
      );
    }
  }

  onSubmitResult = (submitResult: EntityState) => {
    let selectionResult: SelectionResult;

    this.state.submitResult = submitResult;

    if (isIRIObject(this.state.submitResult.value)) {
      // If the response is an IRI object subscribe to it so any
      // updates to that entity in the store automatically apply to
      // the value held by this action.
      this.state.selectionDetails = this.state.store.subscribe({
        key: this.state.key,
        listener: this.storeListener,
        selector: submitResult.iri,
      });
    } else {
      if (submitResult.type === 'alternative-success') {
        selectionResult = {
          key: '/',
          pointer: '/',
          type: 'alternative',
          iri: submitResult.iri,
          fragment: this.state.attrs.args.fragment,
          accept: this.state.attrs.args.accept,
          ok: submitResult.ok,
          status: submitResult.status,
          contentType: submitResult.contentType,
          reason: submitResult.reason,
          integration: this.state.store.integration(submitResult.contentType),
        } satisfies AlternativeSelectionResult;
      } else if (submitResult.type === 'entity-success') {
        selectionResult = {
          key: '/',
          pointer: '/',
          type: 'value',
          readonly: true,
          status: submitResult.status,
          reason: submitResult.reason,
          value: submitResult.value,
        } satisfies ValueSelectionResult;
      }

      this.state.store.unsubscribe(this.state.key);
  
      this.state.selectionDetails = {
        complete: true,
        hasErrors: !submitResult.ok,
        hasMissing: false,
        isProblem: submitResult.isProblem,
        fragment: this.state.attrs.args.fragment,
        accept: this.state.attrs.args.accept,
        dependencies: [],
        required: [],
        result: [selectionResult as ReadonlySelectionResult],
        selector: submitResult.iri,
      };
    }

    for (let i = 0, l = this.listeners.length; i < l; i++) {
      this.listeners[i](
        this.state.submitResult,
        this.state.selectionDetails,
      );
    }
  }

  oninit(vnode: m.Vnode<ActionRendererAttrs>) {
    this.state.store = vnode.attrs.args.store ?? vnode.attrs.parentArgs.store;
    this.state.attrs = vnode.attrs;
    this.state.octiron = actionFactory(
      vnode.attrs.args,
      vnode.attrs.parentArgs,
      vnode.attrs.rendererArgs,
      {
        onSubmitResult: this.onSubmitResult,
        addListener: this.addChildLister,
        removeListener: this.removeChildListener,
      },
    );
  }

  onbeforeupdate(vnode: m.Vnode<ActionRendererAttrs>): boolean | void {
    const store = vnode.attrs.args.store ?? vnode.attrs.parentArgs.store;
    this.state.attrs = vnode.attrs;

    if (store !== this.state.store) {
      this.state.store.unsubscribe(this.state.key);
      this.state.store = store;

      if (this.state.submitResult != null) {
        this.onSubmitResult(this.state.submitResult);
      }
    } else {
      this.state.store = store;
    }
  }

  onbeforeremove() {
    this.state.store.unsubscribe(this.state.key);
  }

  view(vnode: m.Vnode<ActionRendererAttrs>) {
    console.log('ACTION RENDERER', this.state.octiron);
    return vnode.attrs.view(this.state.octiron);
  }

}
