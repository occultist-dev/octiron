import m, {type Vnode} from 'mithril';
import type {ActionEvents, ActionSelectionDetailsListener, EntityState, JSONObject, OctironSelectArgs, OctironSelection, ReadonlySelectionResult, SelectionDetails, SelectionParentArgs, SelectView} from '../octiron.ts';
import {selectionFactory} from '../factories/selectionFactory.ts';


export type ActionStateRendererAttrs = {
  not?: boolean;
  type: 'success' | 'failure';
  events: ActionEvents;
  selector?: string;
  args: OctironSelectArgs;
  parentArgs: SelectionParentArgs;
  view?: SelectView;
};

export const ActionStateRenderer2: m.ComponentTypes<ActionStateRendererAttrs> = class {

  data = new class {
    render!: boolean;
    not!: boolean;
    type!: 'success' | 'failure';
    successful?: boolean;
    octiron?: OctironSelection;
    args: OctironSelectArgs;
    parentArgs: SelectionParentArgs;
  }

  listener: ActionSelectionDetailsListener = (
    submitResult,
    selectionDetails,
  ) => {
    //if ((this.state.not && submitResult.ok && this.state.type === 'failure') ||
    //   (!this.state.not && !submitResult.ok && this.state.type === 'failure') ||
    //   (this.state.not && submitResult.ok && this.state.type === 'success') ||
    //   (!this.state.not && !submitResult.ok && this.state.type === 'success')
    //   ) {
    //  this.state.render = false;
    //  return;
    //}

    this.data.render = true;

    // TODO: handle updates
    this.data.octiron = selectionFactory(
      this.data.args,
      this.data.parentArgs,
      {
        index: 0,
        value: selectionDetails.result[0].value,
      },
    );
  }

  oninit(vnode: Vnode<ActionStateRendererAttrs>) {
    this.data.not = vnode.attrs.not ?? false;
    this.data.type = vnode.attrs.type;
    this.data.args = vnode.attrs.args;
    this.data.parentArgs = vnode.attrs.parentArgs;

    this.data.render = vnode.attrs.not &&
      vnode.attrs.selector == null &&
      vnode.attrs.view == null;

    vnode.attrs.events.addListener(this.listener);
  }

  onbeforeupdate(vnode: Vnode<ActionStateRendererAttrs>) {
    this.data.not = vnode.attrs.not ?? false;
    this.data.type = vnode.attrs.type;
  }

  onbeforeremove(vnode: Vnode<ActionStateRendererAttrs>) {
    vnode.attrs.events.removeListener(this.listener);
  }

  view(vnode: Vnode<ActionStateRendererAttrs>) {
    if (!this.data.render) return;

    if (vnode.attrs.selector != null) {
      return this.data.octiron.select(
        vnode.attrs.selector,
        vnode.attrs.args,
        vnode.attrs.view,
      );
    } else if (vnode.attrs.view != null) {
      return vnode.attrs.view(this.data.octiron);
    }

    return vnode.children;
  }
};
