import m from 'mithril';
import {selectionFactory} from '../factories/selectionFactory.ts';
import type {ActionEvents, ActionSelectionDetailsListener, OctironSelectArgs, OctironSelection, SelectionParentArgs, SelectView} from '../octiron.ts';
import type {InstanceHooks} from '../factories/octironFactory.ts';


export type ActionState =
  | 'success'
  | 'failure'
;

export type ActionStateRendererAttrs = {
  not?: boolean;
  type: ActionState;
  events: ActionEvents;
  selector?: string;
  args: OctironSelectArgs;
  parentArgs: SelectionParentArgs;
  view?: SelectView;
};

export const ActionStateRenderer3: m.ClosureComponent<ActionStateRendererAttrs> = () => {
  let render!: boolean;
  let not!: boolean;
  let type!: ActionState;
  let octiron: OctironSelection | undefined;
  let hooks: InstanceHooks | undefined;
  let args!: OctironSelectArgs;
  let parentArgs!: SelectionParentArgs;

  const listener: ActionSelectionDetailsListener = (
    submitResult,
    selectionDetails,
  ) => {
    if (submitResult.loading) {
      return;
    }

    if ((!not && type === 'failure' && submitResult.ok) ||
        (not && type === 'failure' && !submitResult.ok) ||
        (not && type === 'success' && submitResult.ok) ||
        (!not && type === 'success' && !submitResult.ok)
    ) {
      render = false;

      return;
    }

    render = true;
    [octiron, hooks] = selectionFactory(
      args,
      parentArgs,
      {
        index: 0,
        value: selectionDetails.result[0].value,
      },
    );
  };

  return {
    oninit(vnode) {
      not = vnode.attrs.not ?? false;
      type = vnode.attrs.type;
      args = vnode.attrs.args;
      parentArgs = vnode.attrs.parentArgs;
      render = not &&
        vnode.attrs.selector == null &&
        vnode.attrs.view == null;

      vnode.attrs.events.addListener(listener);
    },
    onbeforeupdate(vnode) {
      not = vnode.attrs.not ?? false;
      type = vnode.attrs.type;
    },
    onbeforeremove(vnode) {
      vnode.attrs.events.removeListener(listener);
    },
    view(vnode) {
      if (!render) return;

      if (vnode.attrs.selector != null && octiron != null) {
        return octiron.select(
          vnode.attrs.selector,
          vnode.attrs.args,
          vnode.attrs.view,
        );
      } else if (vnode.attrs.view != null && octiron != null) {
        return vnode.attrs.view(octiron);
      }

      return vnode.children;
    },
  };
}
