import type m from 'mithril';
import { selectionFactory } from '../factories/selectionFactory.ts';
import type { CommonRendererArgs, OctironSelectArgs, OctironSelection, SelectionParentArgs, SelectView, TypeDefs } from '../types/octiron.ts';
import type { EntityState } from '../types/store.ts';
import type { Store } from "../store.ts";
import type { Mutable } from "../types/common.ts";

export type ActionRendererRef = {
  submitting: boolean;
  submitResult?: EntityState;
  store: Store;
  typeDefs: TypeDefs;
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

  return {
    oninit: ({ attrs }) => {
      setInstance(attrs);
    },
    onbeforeupdate: ({ attrs }) => {
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
