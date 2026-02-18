import type m from 'mithril';
import { actionFactory } from '../factories/actionFactory.ts';
import { selectionFactory } from '../factories/selectionFactory.ts';
import type { JSONObject, Mutable } from '../types/common.ts';
import type { ActionParentArgs, CommonRendererArgs, OctironAction, OctironPerformArgs, OctironSelection, PerformRendererArgs, PerformView, RegisterParentArgsChangeListener, SelectionParentArgs, Selector, UnlistenFn } from '../types/octiron.ts';
import type { Failure, ReadonlySelectionResult, SelectionDetails } from '../types/store.ts';
import { isIRIObject } from '../utils/isIRIObject.ts';
import { mithrilRedraw } from '../utils/mithrilRedraw.ts';
import type { InstanceHooks } from "../factories/octironFactory.ts";


export type PerformRendererAttrs = {
  parentArgs: SelectionParentArgs & ActionParentArgs,
  selector?: Selector;
  args: OctironPerformArgs;
  view: PerformView;
  register: RegisterParentArgsChangeListener<SelectionParentArgs & ActionParentArgs>;
};

export const PerformRenderer: m.FactoryComponent<PerformRendererAttrs> = ({ attrs }) => {
  const key = Symbol('PerformRenderer');
  let unlisten!: UnlistenFn;
  let currentAttrs = attrs;
  let details: SelectionDetails<ReadonlySelectionResult>;

  const instances: Record<string, {
    octiron: OctironSelection;
    action: OctironAction & InstanceHooks;
    selectionResult: ReadonlySelectionResult;
  }> = {};

  function createInstances() {
    let hasChanges = false;
    const { args, parentArgs } = currentAttrs;

    const nextKeys: Array<string> = [];

    for (let index = 0; index < details.result.length; index++) {
      const selectionResult = details.result[index];

      nextKeys.push(selectionResult.pointer);

      if (Object.hasOwn(instances, selectionResult.pointer)) {
        const next = selectionResult;
        const prev = instances[selectionResult.pointer].selectionResult;

        if (
          prev.type === 'value' &&
          next.type === 'value' &&
          next.value === prev.value
        ) {
          continue;
        } else if (
          prev.type === 'entity' &&
          next.type === 'entity' &&
          (
            next.ok !== prev.ok ||
            next.status !== prev.status ||
            next.value !== prev.value
          )
        ) {
          continue;
        }
        continue;
      }

      hasChanges = true;

      const actionValueRendererArgs: CommonRendererArgs = {
        index,
        value: selectionResult.value,
      } as PerformRendererArgs;

      const actionValue = selectionFactory(
        args,
        parentArgs,
        actionValueRendererArgs,
      );

      const rendererArgs = {
        index,
        value: selectionResult.value,
        actionValue,
      } as PerformRendererArgs;

      const action = actionFactory(
        args,
        parentArgs,
        rendererArgs,
      );

      instances[selectionResult.pointer] = {
        action,
        octiron: actionValue,
        selectionResult,
      };
    }

    const prevKeys = Object.keys(instances);

    for (const key of prevKeys) {
      if (!nextKeys.includes(key)) {
        hasChanges = true;

        delete instances[key];
      }
    }

    if (hasChanges) {
      mithrilRedraw();
    }
  }

  async function fetchRequired(required: string[]) {
    if (required.length === 0) {
      return;
    }

    // deno-lint-ignore no-explicit-any
    const promises: Promise<any>[] = [];

    for (const iri of required) {
      promises.push(currentAttrs.parentArgs.store.fetch(iri));
    }

    await Promise.allSettled(promises);
  }

  function listener(next: SelectionDetails<ReadonlySelectionResult>) {
    let required: string[] = [];

    if (typeof details === 'undefined') {
      required = next.required;
    } else {
      for (const iri of next.required) {
        if (!details.required.includes(iri)) {
          required.push(iri);
        }
      }
    }

    details = next;

    if (required.length > 0) {
      fetchRequired(required);
    }

    createInstances();
  }

  function subscribe() {
    const { selector, parentArgs } = currentAttrs;

    if (selector == null) {
      // The value is the action
      let result: ReadonlySelectionResult;

      if (isIRIObject(parentArgs.parent.value)) {
        result = {
          pointer: '/local',
          key: '@local',
          type: 'entity',
          iri: parentArgs.parent.value['@id'],
          ok: true,
          value: parentArgs.parent.value,
        };
      } else {
        result = {
          pointer: '/local',
          key: '@local',
          type: 'value',
          value: parentArgs.parent.value,
          readonly: true,
        };
      }

      details = {
        selector: '',
        complete: true,
        hasErrors: false,
        hasMissing: false,
        isProblem: false,
        dependencies: [],
        required: [],
        result: [result],
      };
    } else {
      // Perform needs to select the action value
      details = parentArgs.store.subscribe({
        key,
        selector: selector,
        value: parentArgs.parent.value as JSONObject,
        listener,
      });

      fetchRequired(details.required);
    }

    createInstances();
  }

  return {
    oninit: ({ attrs }) => {
      currentAttrs = attrs;

      subscribe();
    },
    onbeforeupdate: ({ attrs }) => {
      if (attrs.selector !== currentAttrs.selector) {
        attrs.parentArgs.store.unsubscribe(key);

        subscribe();
      }

      currentAttrs = attrs;

      for (const instance of Object.values(instances)) {
        instance.action._updateArgs(attrs.args);
      }
    },
    onbeforeremove: ({ attrs }) => {
      currentAttrs = attrs;

      attrs.parentArgs.store.unsubscribe(key);
    },
    view: ({ attrs: { view, args } }): m.Children => {
      if (details == null || !details.complete) {
        return args.loading;
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

      const list = Object.values(instances);
      const children = [pre];

      for (let index = 0; index < list.length; index++) {
        const { selectionResult, action, octiron } = list[index];

        (action as Mutable<OctironAction>).position = index + 1;

        if (index !== 0) {
          children.push(sep);
        }

        if (selectionResult.type === 'value') {
          children.push(view(action));
        } else if (!selectionResult.ok && typeof fallback === 'function') {
          children.push(fallback(octiron, selectionResult.reason as Failure));
        } else if (!selectionResult.ok) {
          children.push(fallback as m.Children);
        } else {
          children.push(view(action));
        }
      }

      children.push(post);

      return children;
    },
  };
};
