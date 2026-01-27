import type {Store} from '../store.js';
import type {JSONArray, JSONObject, JSONValue, SCMPropertyValueSpecification} from '../types/common.js';
import type {EntityState, SelectionDetails, SelectionResult} from '../types/store.js';
import {escapeJSONPointerParts} from './escapeJSONPointerParts.js';
import {getIterableValue} from "./getIterableValue.js";
import {isIRIObject} from "./isIRIObject.js";
import {isIterable} from "./isIterable.js";
import {isJSONObject} from './isJSONObject.js';
import {isMetadataObject} from "./isMetadataObject.js";
import {isTypeObject} from "./isTypedObject.js";
import {isValueObject} from "./isValueObject.js";
import {parseSelectorString, type SelectorObject} from './parseSelectorString.js';
import {resolvePropertyValueSpecification} from "./resolvePropertyValueSpecification.js";

/**
 * A circular selection error occurs when two or more
 * entities contain no concrete values and their '@id'
 * values point to each other in a way that creates a
 * loop. The `getSelection` function will throw when
 * this scenario is detected to prevent an infinite
 * loop.
 */
export class CircularSelectionError extends Error {}

/**
 * @description
 * Selects from the given context value and store state.
 *
 * If no `value` is provided the `selector` is assumed to begin with an iri
 * instead of a type. An entity will be selected from the store using the iri,
 * if it exists, to begin the selection.
 *
 * A type selector selects values from the context of a provided value
 * and will pull from the store if any iri objects are selected in the process.
 *
 * @param {string} args.selector            Selector string beginning with a type.
 * @param {string} [args.fragment]          A fragment if passed in as select args.
 * @param {JSONObject} [args.value]         Context object to begin the selection from.
 * @param {JSONObject} [args.actionValue]   The action, or point in the action definition which describes this value.
 * @param {JSONValue} [args.defaultValue]   A default value when used to select action values.
 * @param {Store} args.store                Octiron store to search using.
 * @returns {SelectionDetails}              Selection contained in a details object.
 */
export function getSelection<T extends SelectionResult>({
  selector: selectorStr,
  value,
  fragment,
  accept,
  actionValue,
  defaultValue,
  store,
}: {
  selector: string;
  value?: JSONObject;
  fragment?: string;
  accept?: string;
  actionValue?: JSONObject;
  defaultValue?: JSONValue;
  store: Store;
}): SelectionDetails<T> {
  const details: SelectionDetails<T> = {
    selector: selectorStr,
    complete: false,
    hasErrors: false,
    hasMissing: false,
    required: [],
    dependencies: [],
    result: [],
  };

  if (value == null) {
    const [{ subject, filter }, ...selector] =
      parseSelectorString(selectorStr, store);

    const [iri, iriFragment] = subject.split('#');

    selectEntity({
      key: '',
      pointer: '',
      iri,
      fragment: iriFragment ?? fragment,
      accept,
      filter,
      selector: selector.length > 0 ? selector : undefined,
      store,
      details,
    });

    details.complete = details.required.length === 0;

    return details;
  }

  const selector = parseSelectorString(selectorStr, store);

  traverseSelector({
    key: '',
    pointer: '',
    value,
    actionValue,
    selector,
    store,
    details,
    defaultValue,
  });

  details.complete = details.required.length === 0;

  return details;
}

function makePointer(pointer: string, addition: string | number) {
  return `${pointer}/${escapeJSONPointerParts(addition.toString())}`;
}

/**
 * Filters apply to objects with `@type` properties. These can be strings or
 * arrays of strings and are considered a pass if any of the values match the
 * filter.
 *
 * If an object is provided which does not contain an `@type` property it is
 * considered a fail.
 */
function passesFilter({
  value,
  filter,
}: {
  value: JSONObject;
  filter?: string;
}): boolean {
  if (typeof filter !== 'string') {
    return true;
  }

  if (Array.isArray(value['@type'])) {
    return value['@type'].includes(filter);
  }

  return value['@type'] === filter;
}

/**
 * If a scala value is pulled before a selection is complete the branch
 * can exit early.
 */
function isTraversable(value: JSONValue): value is JSONObject | JSONArray {
  return (
    value !== null &&
    typeof value !== 'boolean' &&
    typeof value !== 'number' &&
    typeof value !== 'string'
  );
}


/**
 * Handles the final value found in a selection.
 * If a @id, @value jsonld object is provided further
 * recursion might be nessacary.
 */
function resolveValue({
  key,
  pointer,
  value,
  propType,
  filter,
  spec,
  actionValue,
  store,
  details,
}: {
  key: string;
  pointer: string;
  value: JSONValue;
  spec?: JSONObject;
  actionValue?: JSONValue;
  propType: string;
  filter?: string;
  store: Store;
  details: SelectionDetails;
}) {
  if (value === undefined) {
    details.hasMissing = true;

    return;
  } else if (value === null && isJSONObject(actionValue)) {
    for (const item of Object.values(actionValue)) {
      if (isTypeObject(item) && item["@type"] === 'https://schema.org/PropertyValueSpecification') {
        return;
      }
    }
  }

  if (
    spec != null && (
      // hit the for loop below if the action value
      // has editable properties and the value is an
      // array
      !isIterable(value) || !isJSONObject(actionValue)
    )
  ) {
    const pvs = resolvePropertyValueSpecification({
      spec,
      store,
    });

    if (isJSONObject(value) && isValueObject(value)) {
      value = value['@value'];
    }

    details.result.push({
      key: pointer,
      pointer,
      type: 'action-value',
      propType,
      value,
      actionValue,
      spec: pvs,
      readonly: pvs.readonly,
    });

    return;
  }

  if (!isTraversable(value)) {
    details.result.push({
      key: pointer,
      pointer: pointer,
      type: 'value',
      propType,
      value,
      readonly: true,
    });

    return;
  } else if (isIterable(value)) {
    const list = getIterableValue(value);

    for (let index = 0; index < list.length; index++) {
      const item = list[index];

      if (!isIRIObject(item)) {
        key = makePointer(key, index);
      }

      resolveValue({
        key,
        pointer: makePointer(pointer, index),
        value: item,
        spec,
        actionValue,
        propType,
        filter,
        store,
        details,
      });

      if (details.hasErrors || details.hasMissing) {
        return;
      }
    }

    return;
  }
  if (typeof filter === 'string' && !passesFilter({ value, filter })) {
    return;
  }

  if (isValueObject(value)) {
    resolveValue({
      key,
      pointer,
      value: value['@value'],
      propType,
      store,
      details,
    });

    return;
  } else if (isMetadataObject(value)) {
    selectEntity({
      key,
      pointer,
      iri: value['@id'],
      filter,
      store,
      details,
    });

    return;
  }

  if (isIRIObject(value)) {
    const iri = value['@id'];

    details.result.push({
      key,
      pointer,
      type: 'entity',
      iri,
      ok: true,
      value,
    });

    return;
  }

  details.result.push({
    key,
    pointer,
    type: 'value',
    readonly: true,
    propType,
    value,
  });
}

/**
 * Selects a type from a json value, handling invalid situations.
 */
function selectTypedValue({
  key,
  pointer,
  propType,
  value,
  actionValue,
  filter,
  store,
  details,
}: {
  key: string;
  pointer: string;
  propType: string;
  value: JSONValue;
  actionValue?: JSONObject;
  filter?: string;
  store: Store;
  details: SelectionDetails;
}): void {
  pointer = makePointer(pointer, propType);

  if (!isTraversable(value)) {
    return;
  }

  if (isIterable(value)) {
    const list = getIterableValue(value);

    for (let index = 0; index < list.length; index++) {
      const item = list[index];

      if (!isIRIObject(item)) {
        key = makePointer(key, index);
      }

      selectTypedValue({
        key,
        pointer: makePointer(pointer, index),
        propType,
        value: item,
        actionValue,
        filter,
        store,
        details,
      });

      if (details.hasErrors || details.hasMissing) {
        return;
      }
    }

    return;
  }

  if (isMetadataObject(value) && isIRIObject(value)) {
    selectEntity({
      key,
      pointer,
      iri: value['@id'],
      selector: [{ subject: propType, filter }],
      store,
      details,
    });

    return;
  } else if (isMetadataObject(value)) {
    return;
  }

  let spec: JSONObject | undefined;

  if (isJSONObject(actionValue) && actionValue[`${propType}-input`] == null) {
    // selecting for an action but the type is not editable
    return;
  } else if (isJSONObject(actionValue)) {
    spec = actionValue[`${propType}-input`] as JSONObject;
  }

  resolveValue({
    key,
    pointer,
    value: value[propType],
    spec,
    actionValue: actionValue?.[propType],
    propType,
    filter,
    store,
    details,
  });
}

/**
 * Recurses through the selection until there are no further selection items.
 */
function traverseSelector({
  key,
  pointer,
  selector,
  value,
  actionValue,
  store,
  details,
  defaultValue,
}: {
  key: string;
  pointer: string;
  selector: SelectorObject[];
  value: JSONValue;
  actionValue?: JSONObject;
  store: Store;
  details: SelectionDetails;
  defaultValue?: JSONValue;
}): void {
  if (selector.length === 0) {
    return;
  } else if (!isTraversable(value)) {
    return;
  }

  if (isIterable(value)) {
    const list = getIterableValue(value);

    for (let index = 0; index < list.length; index++) {
      const item = list[index];

      if (!isIRIObject(item)) {
        key = makePointer(key, index);
      }

      // keep nesting on the full selector
      // as only objects can be subscripted
      // with propTypes
      traverseSelector({
        key,
        pointer: makePointer(pointer, index),
        selector,
        value: item,
        actionValue,
        store,
        details,
        defaultValue,
      });

      if (details.hasErrors || details.hasMissing) {
        return;
      }
    }

    return;
  } else if (isValueObject(value)) {
    traverseSelector({
      key,
      pointer,
      selector,
      value: value['@value'],
      actionValue,
      store,
      details,
      defaultValue,
    });
  }

  if (isMetadataObject(value) && isIRIObject(value)) {
    selectEntity({
      key,
      pointer,
      selector,
      iri: value['@id'],
      store,
      details,
    });

    return;
  }

  // edit selections are a special case in that an input
  // should render even when no value is present.
  if (
    isJSONObject(value) &&
    actionValue !== undefined &&
    value[selector[0].subject] == null
  ) {
    value = { [selector[0].subject]: defaultValue ?? null };
  }

  const [next, ...rest] = selector;
  const { subject: propType, filter } = next;

  // null is a placeholder for action payload types with no value.
  // jsonld drops null values otherwise.
  if (value[propType] === undefined) {
    details.hasMissing = true;

    return;
  }

  if (rest.length === 0 && isJSONObject(actionValue?.[propType])) {
    pointer = makePointer(pointer, propType);

    resolveValue({
      key: pointer,
      pointer,
      value: value[propType],
      propType,
      details,
      store,
      actionValue: actionValue?.[propType],
      spec: actionValue[`${propType}-input`] as SCMPropertyValueSpecification,
      filter,
    });

    return;
  } else if (rest.length === 0) {
    selectTypedValue({
      key,
      pointer,
      propType: propType,
      filter,
      value,
      actionValue,
      store,
      details,
    });

    return;
  }

  if (typeof filter === 'string' && !passesFilter({ value, filter })) {
    return;
  }

  let traversedActionValue: JSONObject | undefined;

  if (isJSONObject(actionValue?.[propType])) {
    traversedActionValue = actionValue[propType];
  }

  traverseSelector({
    key: makePointer(key, propType),
    pointer: makePointer(pointer, propType),
    selector: rest,
    value: value[propType],
    actionValue: traversedActionValue,
    store,
    details,
  });
}

/**
 * Selects an entity from the store and continues the selection
 * if the branch has not completed.
 */
function selectEntity({
  key,
  pointer,
  iri,
  fragment,
  accept,
  filter,
  selector,
  store,
  details,
  handledIRIs,
}: {
  key: string;
  pointer: string;
  iri: string;
  fragment?: string;
  accept?: string;
  filter?: string;
  selector?: SelectorObject[];
  store: Store;
  details: SelectionDetails;
  handledIRIs?: Set<string>;
}): void {
  key = makePointer(key, iri);
  pointer = makePointer(pointer, iri);

  const cache: EntityState | null = store.entity(iri, accept)

  details.dependencies.push(iri);

  // if loading is required mark found as false
  if (cache == null || cache.loading) {
    if (!details.required.includes(iri)) {
      details.required.push(iri);
      details.accept = accept;
      details.fragment = fragment;
    }

    return;
  }

  if (!cache.ok) {
    details.hasErrors = true;

    if (selector == null || selector.length === 0) {
      return;
    }

    details.result.push({
      key,
      pointer,
      type: 'entity',
      iri: cache.iri,
      ok: false,
      status: cache.status,
      value: cache.value,
      reason: cache.reason,
    });

    return;
  }

  if (cache.type === 'alternative-success') {
    details.result.push({
      key,
      pointer,
      iri: cache.iri,
      fragment,
      ok: cache.ok,
      status: cache.status,
      type: 'alternative',
      contentType: cache.integration.contentType,
      integration: cache.integration,
      accept,
    });

    return;
  }

  const value = cache.value;

  if (isMetadataObject(value)) {
    // in theory serveral entities could be metadata objects
    // referencing each other and end up looping around...
    if (handledIRIs == null) {
      handledIRIs = new Set([value['@id']]);
    } else if (!handledIRIs.has(value['@id'])) {
      handledIRIs.add(value['@id']);
    } else {
      throw new CircularSelectionError(`Circular selection loop detected`);
    }

    // select the entity this entity is referencing
    return selectEntity({
      key,
      pointer,
      iri: value['@id'],
      filter,
      selector,
      details,
      store,
      handledIRIs,
    });
  }

  // if the entity does not match the filter it is not relevant to the final selection
  if (typeof filter === 'string' && !passesFilter({ filter, value })) {
    return;
  }

  if (typeof selector === 'undefined') {
    details.result.push({
      key,
      pointer,
      type: 'entity',
      iri: cache.iri,
      ok: true,
      value: cache.value as JSONObject,
    });

    return;
  }

  traverseSelector({
    key,
    pointer,
    value,
    selector,
    store,
    details,
  });

  return;
}
