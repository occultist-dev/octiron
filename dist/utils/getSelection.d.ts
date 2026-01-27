import type { Store } from '../store.js';
import type { JSONObject, JSONValue } from '../types/common.js';
import type { SelectionDetails, SelectionResult } from '../types/store.js';
/**
 * A circular selection error occurs when two or more
 * entities contain no concrete values and their '@id'
 * values point to each other in a way that creates a
 * loop. The `getSelection` function will throw when
 * this scenario is detected to prevent an infinite
 * loop.
 */
export declare class CircularSelectionError extends Error {
}
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
export declare function getSelection<T extends SelectionResult>({ selector: selectorStr, value, fragment, accept, actionValue, defaultValue, store, }: {
    selector: string;
    value?: JSONObject;
    fragment?: string;
    accept?: string;
    actionValue?: JSONObject;
    defaultValue?: JSONValue;
    store: Store;
}): SelectionDetails<T>;
