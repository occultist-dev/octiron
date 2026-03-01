import type m from "mithril";
import {actionSelectionFactory} from '../factories/actionSelectionFactory.ts';
import type {InstanceHooks} from "../factories/octironFactory.ts";
import {selectionFactory} from '../factories/selectionFactory.ts';
import type {Store} from "../store.ts";
import type {JSONObject, JSONValue, Mutable} from '../types/common.ts';
import type {ActionSelectionParentArgs, ActionSelectionRendererArgs, ActionSelectView, CommonRendererArgs, OctironActionSelection, OctironActionSelectionArgs, OctironSelectArgs, OctironSelection, SelectionParentArgs, Selector, Update} from '../types/octiron.ts';
import type {ActionSelectionResult, SelectionDetails} from '../types/store.ts';
import {getSelection} from '../utils/getSelection.ts';
import {isJSONObject} from '../utils/isJSONObject.ts';
import {mithrilRedraw} from '../utils/mithrilRedraw.ts';


export type ActionSelectionRendererAttrs = {
  value: JSONObject;
  actionValue: JSONObject;
  selector: Selector;
  parentArgs: ActionSelectionParentArgs;
  args: OctironActionSelectionArgs;
  view: ActionSelectView;
  selectionArgs?: OctironActionSelectionArgs;
};

type InternalPrevCache = {
  selector: Selector;
  value: JSONValue;
  actionValue: JSONValue;
  args: {
    fragment?: string;
  };
  parentArgs: {
    store: Store;
  },
};


function cachePrev(attrs: ActionSelectionRendererAttrs): InternalPrevCache {
  return {
    selector: attrs.selector,
    value: attrs.value,
    actionValue: attrs.actionValue,
    args: {
      fragment: attrs.args.fragment,
    },
    parentArgs: {
      store: attrs.parentArgs.store,
    },
  };
}

function shouldReselect(
  next: ActionSelectionRendererAttrs,
  prev: InternalPrevCache,
) {
  return next.parentArgs.store !== prev.parentArgs.store ||
    next.selector !== prev.selector ||
    next.args.fragment !== prev.args.fragment ||
    next.value !== prev.value;
}


export const ActionSelectionRenderer: m.FactoryComponent<ActionSelectionRendererAttrs> = (
  vnode,
) => {
  let currentAttrs = vnode.attrs;
  let details: SelectionDetails<ActionSelectionResult>;
  let prev!: InternalPrevCache;

  const instances: Map<string, {
    rendererArgs: ActionSelectionRendererArgs;
    selection: OctironSelection;
    selectionHooks: InstanceHooks;
    octiron: OctironActionSelection;
    hooks: InstanceHooks;
    selectionResult: ActionSelectionResult;
  }> = new Map();

  function createInstances() {
    let hasChanges = false;
    const { parentArgs, selectionArgs } = currentAttrs;

    const nextKeys: Array<string> = [];

    for (let index = 0; index < details.result.length; index++) {
      const selectionResult = details.result[index];

      nextKeys.push(selectionResult.pointer);

      if (instances.has(selectionResult.pointer)) {
        const { rendererArgs, octiron } = instances.get(selectionResult.pointer);

        const update: Update = (value) => {
          return parentArgs.updatePointer(
            selectionResult.pointer,
            value,
            selectionArgs,
          );
        };

        rendererArgs.value = (octiron as unknown as { value: JSONValue }).value = selectionResult.value;
        rendererArgs.spec = selectionResult.spec;
        rendererArgs.update = update;

        continue;
      }

      hasChanges = true;

      const update: Update = (value) => {
        return parentArgs.updatePointer(
          selectionResult.pointer,
          value,
          selectionArgs,
        );
      };

      const actionValueRendererArgs: CommonRendererArgs = {
        index,
        value: selectionResult.actionValue,
        propType: selectionResult.propType,
      }

      const [actionValue, hooks] = selectionFactory(
        currentAttrs.args as OctironSelectArgs,
        parentArgs as unknown as SelectionParentArgs,
        actionValueRendererArgs,
      );

      const rendererArgs: ActionSelectionRendererArgs = {
        index,
        update,
        actionValue,
        pointer: selectionResult.pointer,
        propType: selectionResult.propType,
        value: selectionResult.value,
        spec: selectionResult.spec,
      };

      const [actionSelection, actionSelectionHooks] = actionSelectionFactory(
        currentAttrs.args,
        parentArgs,
        rendererArgs,
      );

      instances.set(selectionResult.pointer, {
        rendererArgs,
        selection: actionValue,
        selectionHooks: hooks,
        octiron: actionSelection,
        hooks: actionSelectionHooks,
        selectionResult,
      });
    }

    const prevKeys = instances.keys();

    for (const key of prevKeys) {
      if (!nextKeys.includes(key)) {
        hasChanges = true;

        instances.delete(key);
      }
    }

    if (hasChanges && typeof window !== 'undefined') {
      mithrilRedraw();
    }
  }

  function updateSelection() {
    const { selector, value, actionValue } = currentAttrs;
    const { store } = currentAttrs.parentArgs;

    if (!isJSONObject(value)) {
      return;
    }

    details = getSelection<ActionSelectionResult>({
      selector,
      store,
      actionValue,
      value,
      defaultValue: currentAttrs.args.initialValue,
    });

    createInstances();
  }

  return {
    oninit: ({ attrs }) => {
      currentAttrs = attrs;
      prev = cachePrev(attrs);

      updateSelection();
    },
    onbeforeupdate: ({ attrs }) => {
      const reselect = shouldReselect(attrs, prev);

      currentAttrs = attrs;

      if (reselect) {
        updateSelection();
      } else {
        for (const instance of instances.values()) {
        }
      }
    },
    view: ({ attrs: { view, args } }) => {
      if (details == null) {
        return null;
      }

      const {
        pre,
        sep,
        post,
        fallback,
      } = args;

      if (typeof view === 'undefined') {
        return;
      }

      const list = Array.from(instances.values());
      const children = [pre];

      for (let index = 0; index < list.length; index++) {
        const { octiron, selectionResult } = list[index];

        (octiron as Mutable<OctironActionSelection>).position = index + 1;

        if (index !== 0) {
          children.push(sep);
        }

        if (selectionResult.value == null && typeof fallback === 'function') {
          children.push(null)
          // children.push(fallback(octiron));
        } else if (selectionResult.value == null && fallback != null) {
          children.push(fallback as m.Children);
        } else {
          children.push(view(octiron));
        }
      }

      children.push(post);

      return children;
    },
  };
};
