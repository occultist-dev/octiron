import type { JSONObject, Mutable } from "../types/common.ts";
import type {
CommonRendererArgs,
  OctironSelectArgs,
  OctironSelection,
  SelectionParentArgs,
  Selector,
  SelectView,
} from "../types/octiron.ts";
import type {
  Failure,
  ReadonlySelectionResult,
  SelectionDetails,
} from "../types/store.ts";
import m from "mithril";
import { selectionFactory } from "../factories/selectionFactory.ts";
import { isJSONObject } from "../utils/isJSONObject.ts";
import { mithrilRedraw } from "../utils/mithrilRedraw.ts";


export type SelectionRendererAttrs = {
  entity?: boolean;
  selector: Selector;
  fragment?: string;
  args: OctironSelectArgs;
  view: SelectView;
  parentArgs: SelectionParentArgs;
};

const preKey = Symbol.for('@pre');
const postKey = Symbol.for('@post');

function shouldReselect(
  next: SelectionRendererAttrs,
  prev: SelectionRendererAttrs,
) {
  return next.parentArgs.store !== prev.parentArgs.store ||
    next.selector !== prev.selector ||
    next.parentArgs.value !== prev.parentArgs.value;
}

/**
 * @description
 * Subscribes to a selection's result using the Octiron store. Each selection
 * result is feed to an Octiron instance and is only removed if a later
 * selection update does not include the same result. Selection results are
 * given a unique key in the form of a json-path.
 *
 * Once an Octiron instance is created using a selection, further changes via
 * the upstream parentArgs object or user given args applied to the downstream
 * Octiron instances using their internal update hooks.
 */
export const SelectionRenderer: m.FactoryComponent<SelectionRendererAttrs> = (
  vnode,
) => {
  const key = Symbol(`SelectionRenderer`);
  let currentAttrs = vnode.attrs;
  let details: undefined | SelectionDetails<ReadonlySelectionResult>;

  const instances: Record<symbol, {
    octiron: OctironSelection;
    selectionResult: ReadonlySelectionResult;
  }> = {};

  function createInstances() {
    let hasChanges = false;
    let initialDetails = details == null;
    const nextKeys: Array<symbol> = [];

    if (details == null) {
      const prevKeys = Reflect.ownKeys(instances) as symbol[];

      for (const key of prevKeys) {
        if (!nextKeys.includes(key)) {
          hasChanges = true;

          delete instances[key];
        }
      }

      if (hasChanges) {
        mithrilRedraw();
      }

      return;
    }

    for (let index = 0; index < details.result.length; index++) {
      const selectionResult = details.result[index];
      const key = Symbol.for(selectionResult.pointer);

      nextKeys.push(key);

      if (Object.hasOwn(instances, key)) {
        const next = selectionResult;
        const prev = instances[key].selectionResult;

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
      }

      hasChanges = true;

      const rendererArgs: CommonRendererArgs = {
        index,
        value: selectionResult.value,
        propType: selectionResult.type === 'entity' ? undefined : selectionResult.propType,
      }
      const octiron = selectionFactory(
        currentAttrs.args,
        currentAttrs.parentArgs,
        rendererArgs,
      );

      instances[key] = {
        octiron,
        selectionResult,
      };
    }

    const prevKeys = Reflect.ownKeys(instances) as symbol[];

    for (const key of prevKeys) {
      if (!nextKeys.includes(key)) {
        hasChanges = true;

        delete instances[key];
      }
    }

    if (!initialDetails && hasChanges) {
      mithrilRedraw();
    }
  }

  async function fetchRequired(required: string[], accept?: string) {
    if (required.length === 0) {
      return;
    }

    // deno-lint-ignore no-explicit-any
    const promises: Promise<any>[] = [];

    for (const iri of required) {
      promises.push(currentAttrs.parentArgs.store.fetch(iri, accept));
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
      fetchRequired(required, currentAttrs.args.accept);
    }

    createInstances();
  }

  function subscribe() {
    const { entity, selector, parentArgs: { value, store }, args: { accept, fragment } } = currentAttrs;

    if (
      !entity &&
      !isJSONObject(value)
    ) {
      store.unsubscribe(key);
      createInstances();

      return;
    }

    details = store.subscribe({
      key,
      selector,
      fragment,
      accept,
      value: entity ? undefined : value as JSONObject,
      listener,
    });

    fetchRequired(details.required, accept);

    createInstances();
  }

  return {
    oninit: ({ attrs }) => {
      currentAttrs = attrs;

      subscribe();
    },
    onbeforeupdate: ({ attrs }) => {
      const reselect = shouldReselect(attrs, currentAttrs);

      currentAttrs = attrs;

      if (reselect) {
        attrs.parentArgs.store.unsubscribe(key);
        subscribe();
      }
    },
    onbeforeremove: ({ attrs }) => {
      currentAttrs = attrs;

      attrs.parentArgs.store.unsubscribe(key);
    },
    view: ({ attrs }): m.Children => {
      if (details == null || !details.complete) {
        return attrs.args.loading;
      } else if ((details.hasErrors || details.hasMissing) && typeof attrs.args.fallback !== 'function') {
        return attrs.args.fallback;
      } else if (details.result[0].type === 'alternative') {
        return details.result[0].integration.render(null, attrs.args.fragment);
      }

      const view = currentAttrs.view;
      const {
        pre,
        sep,
        post,
        start,
        end,
        predicate,
        fallback,
      } = currentAttrs.args;

      const children: m.Children = [];
      let list = Reflect.ownKeys(instances).map(((key) => {
        const instance = instances[key as symbol];

        (instance.octiron as Mutable<OctironSelection>).position = -1;

        return instance;
      }));

      if (start != null || end != null) {
        list = list.slice(
          start ?? 0,
          end,
        );
      }

      if (predicate != null) {
        list = list.filter(({ octiron }) => predicate(octiron));
      }

      if (pre != null) {
        children.push(m.fragment({ key: preKey }, [pre]));
      }

      for (let index = 0; index < list.length; index++) {
        const { selectionResult, octiron } = list[index];
        const { key } = selectionResult;

        (octiron as Mutable<OctironSelection>).position = index + 1;


        if (index !== 0) {
          children.push(m.fragment({ key: `@${Symbol.keyFor(key)}` }, [sep]));
        }

        if (selectionResult.type === 'value') {
          children.push(m.fragment({ key }, [view(octiron)]));
        } else if (!selectionResult.ok && typeof fallback === 'function') {
          children.push(
            m.fragment({ key }, [fallback(octiron, selectionResult.reason as Failure)]),
          );
        } else if (!selectionResult.ok) {
          children.push(m.fragment({ key }, [fallback as m.Children]));
        } else {
          children.push(m.fragment({ key }, [view(octiron)]));
        }
      }

      if (post != null) {
        children.push(m.fragment({ key: postKey }, [post]));
      }

      return children;
    },
  };
};
