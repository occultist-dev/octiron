import m from 'mithril';
import type {ActionParentArgs, AlternativeSelectionResult, EntityState, OctironPerformArgs, PerformRendererArgs, PerformView, ReadonlySelectionResult, SelectionDetails, SelectionResult, Selector, ValueSelectionResult} from "../octiron";
import {isIRIObject} from '../utils/isIRIObject';


export type ActionSelectionDetailsListener = (selectionDetails: SelectionDetails<ReadonlySelectionResult>) => void;


export type ActionRendererAttrs = {
  args: OctironPerformArgs;
  parentArgs: ActionParentArgs;
  rendererArgs: PerformRendererArgs;
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
export const ActionRenderer: m.ComponentTypes<ActionRendererAttrs> = new class implements m.Component<ActionRendererAttrs> {

  state = new class {
    key: symbol = Symbol('ActionRenderer');
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

    listener(this.state.selectionDetails);
  }

  removeChildListener = (listener: ActionSelectionDetailsListener) => {
    const index = this.listeners.indexOf(listener);

    this.listeners.splice(index, 1);
  }

  storeListener = (selectionDetails: SelectionDetails<ReadonlySelectionResult>) => {
    this.state.selectionDetails = selectionDetails;

    for (let i = 0, l = this.listeners.length; i < l; i++) {
      this.listeners[i](this.state.selectionDetails);
    }
  }

  onSubmitResult = (submitResult: EntityState) => {
    let selectionResult: SelectionResult;

    this.state.submitResult = submitResult;

    if (isIRIObject(this.state.submitResult.value)) {
      // If the response is an IRI object subscribe to it so any
      // updates to that entity in the store automatically apply to
      // the value held by this action.
      this.state.selectionDetails = this.state.attrs.parentArgs.store.subscribe({
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
          integration: this.state.attrs.parentArgs.store.integration(submitResult.contentType),
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

      this.state.attrs.parentArgs.store.unsubscribe(this.state.key);
  
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
      this.listeners[i](this.state.selectionDetails);
    }
  }

  oninit(vnode: m.Vnode<ActionRendererAttrs>) {
    this.state.attrs = vnode.attrs;
  }

  onbeforeupdate(vnode: m.Vnode<ActionRendererAttrs>): boolean | void {
    this.state.attrs = vnode.attrs;
  }

  onbeforeremove() {
    this.state.attrs.parentArgs.store.unsubscribe(this.state.key);
  }

  view() {

  }

}
