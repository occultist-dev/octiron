import type m from 'mithril';
import { selectionFactory } from '../factories/selectionFactory.ts';
import type { CommonRendererArgs, OctironSelectArgs, OctironSelection, SelectionParentArgs, SelectView, TypeHandlers } from '../types/octiron.ts';
import type { EntityState, ReadonlySelectionResult, SelectionDetails } from '../types/store.ts';
import type { Store } from "../store.ts";
import type { Mutable } from "../types/common.ts";
import {SelectionRenderer} from './SelectionRenderer.ts';

export type ActionRendererRef = {
  submitting: boolean;
  submitResult?: EntityState;
  store: Store;
  typeHandlers: TypeHandlers;
};

export type ActionStateRendererAttrs = {
  not?: boolean;
  type: 'initial' | 'success' | 'failure';
  children?: m.Children;
  selector?: string;
  args: OctironSelectArgs;
  view?: SelectView;
  submitResult?: EntityState;
  parentArgs: SelectionParentArgs,
};

export const ActionStateRenderer: m.ClosureComponent<ActionStateRendererAttrs> = () => {
  let key = Symbol('ActionStateRenderer');
  let submitResult: EntityState | undefined;
  let o: OctironSelection | undefined;

  function setInstance(attrs: ActionStateRendererAttrs) {
    if (attrs.submitResult == null) {
      submitResult = undefined;
      o = undefined;
    } else if (
      submitResult == null ||
      attrs.submitResult.ok !== submitResult.ok ||
      attrs.submitResult.status !== submitResult.status ||
      attrs.submitResult.value !== submitResult.value
    ) {
      submitResult = attrs.submitResult;

      const rendererArgs: CommonRendererArgs = {
        index: 0,
        value: attrs.submitResult.value,
      }
      o = selectionFactory(
        attrs.args,
        attrs.parentArgs,
        rendererArgs,
      );
    }
  }

  let unsubscribe;

  function listener(next: SelectionDetails<ReadonlySelectionResult>) {
    console.log('SUBSCRIPTION UPDATED', next.result[0].value);
    if (next.result.length === 1 && next.result[0].value != null) {
      submitResult.value = next.result[0].value;
    }
  }

  function updateSubscription(attrs: ActionStateRendererAttrs) {
    if (attrs.submitResult == null || attrs.submitResult.loading) {
      attrs.parentArgs.store.unsubscribe(key);
      return;
    }
    
    console.log('UPDATING SUBSCRIPTION', attrs.submitResult.iri);

    attrs.parentArgs.store.unsubscribe(key);
    attrs.parentArgs.store.subscribe({
      key,
      listener,
      selector: attrs.submitResult.iri,
      accept: attrs.args.accept,
      fragment: attrs.args.fragment,
      mainEntity: attrs.args.mainEntity,
    });
  }

  return {
    oninit: ({ attrs }) => {
      updateSubscription(attrs);
      setInstance(attrs);
    },
    onbeforeupdate: ({ attrs }) => {
      updateSubscription(attrs);
      setInstance(attrs);
    },
    view: ({ attrs: { type, selector, args, view, ...attrs }, children }) => {
      if (type === 'initial' && submitResult == null) {
        return children;
      } else if (submitResult == null || o == null) {
        return null;
      }

      let shouldRender = (type === 'success' && submitResult.ok) ||
        (type === 'failure' && !submitResult.ok);

      if (attrs.not) {
        shouldRender = !shouldRender;
      }

      (o as Mutable<OctironSelection>).position = 1;

      if (shouldRender && selector != null) {
        return o.select(selector, args as OctironSelectArgs, view as SelectView);
      } else if (shouldRender && view != null) {
        return view(o);
      } else if (shouldRender && args != null) {
        return o.present(args);
      }

      (o as Mutable<OctironSelection>).position = -1

      return null;
    },
  };
};
