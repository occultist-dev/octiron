import type { ActionSelectView, OctironActionSelectionArgs, OctironDefaultArgs, OctironEditArgs, OctironPerformArgs, OctironPresentArgs, OctironSelectArgs, PerformView, Selector, SelectView } from '../types/octiron.js';
/**
 * @description
 * Numerous Octiron view functions take a combination of string selector,
 * object args and function view arguments.
 *
 * This `unravelArgs` identifies which arguments are present and returns
 * defaults for the missing arguments.
 *
 * @param arg1 - A selector string, args object or view function if present.
 * @param arg2 - An args object or view function if present.
 * @param arg3 - A view function if present.
 */
export declare function unravelArgs(arg1?: Selector | OctironSelectArgs | SelectView, arg2?: OctironSelectArgs | SelectView, arg3?: SelectView): [Selector, OctironSelectArgs, SelectView];
/**
 * @description
 * Numerous Octiron view functions take a combination of string selector,
 * object args and function view arguments.
 *
 * This `unravelArgs` identifies which arguments are present and returns
 * defaults for the missing arguments.
 *
 * @param arg1 - A selector string, args object or view function if present.
 * @param arg2 - An args object or view function if present.
 * @param arg3 - A view function if present.
 */
export declare function unravelArgs(arg1?: Selector | OctironPerformArgs | PerformView, arg2?: OctironPerformArgs | PerformView, arg3?: PerformView): [Selector, OctironPerformArgs, PerformView];
/**
 * @description
 * Numerous Octiron view functions take a combination of string selector,
 * object args and function view arguments.
 *
 * This `unravelArgs` identifies which arguments are present and returns
 * defaults for the missing arguments.
 *
 * @param arg1 - A selector string, args object or view function if present.
 * @param arg2 - An args object or view function if present.
 * @param arg3 - A view function if present.
 */
export declare function unravelArgs(arg1?: Selector, arg2?: OctironActionSelectionArgs | ActionSelectView, arg3?: ActionSelectView): [Selector, OctironActionSelectionArgs, ActionSelectView];
/**
 * @description
 * Numerous Octiron view functions take a combination of string selector,
 * object args and function view arguments.
 *
 * This `unravelArgs` identifies which arguments are present and returns
 * defaults for the missing arguments.
 *
 * @param arg1 - A selector string, args object or view function if present.
 * @param arg2 - An args object or view function if present.
 */
export declare function unravelArgs(arg1?: Selector | OctironPresentArgs, arg2?: OctironPresentArgs): [Selector, OctironSelectArgs];
/**
 * @description
 * Numerous Octiron view functions take a combination of string selector,
 * object args and function view arguments.
 *
 * This `unravelArgs` identifies which arguments are present and returns
 * defaults for the missing arguments.
 *
 * @param arg1 - A selector string, args object or view function if present.
 * @param arg2 - An args object or view function if present.
 */
export declare function unravelArgs(arg1?: Selector | OctironEditArgs, arg2?: OctironEditArgs): [Selector, OctironEditArgs];
/**
 * @description
 * Numerous Octiron view functions take a combination of string selector,
 * object args and function view arguments.
 *
 * This `unravelArgs` identifies which arguments are present and returns
 * defaults for the missing arguments.
 *
 * @param arg1 - A selector string, args object or view function if present.
 * @param arg2 - An args object or view function if present.
 */
export declare function unravelArgs(arg1?: Selector | OctironDefaultArgs, arg2?: OctironDefaultArgs): [Selector, OctironDefaultArgs];
