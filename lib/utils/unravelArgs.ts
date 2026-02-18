import type { ActionSelectView, Octiron, OctironActionSelectionArgs, OctironDefaultArgs, OctironEditArgs, OctironPerformArgs, OctironPresentArgs, OctironSelectArgs, PerformView, Selector, SelectView } from '../types/octiron.ts';

type AllArgs =
  | OctironSelectArgs
  | OctironPresentArgs
  | OctironPerformArgs
  | OctironActionSelectionArgs
  | OctironEditArgs
  | OctironDefaultArgs
;

type AllViews =
  | SelectView
  | PerformView
  | ActionSelectView
;

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
export function unravelArgs(
  arg1?: Selector | OctironSelectArgs | SelectView,
  arg2?: OctironSelectArgs | SelectView,
  arg3?: SelectView,
): [Selector, OctironSelectArgs, SelectView];


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
export function unravelArgs(
  arg1?: Selector | OctironPerformArgs | PerformView,
  arg2?: OctironPerformArgs | PerformView,
  arg3?: PerformView,
): [Selector, OctironPerformArgs, PerformView];


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
export function unravelArgs(
  arg1?: Selector,
  arg2?: OctironActionSelectionArgs | ActionSelectView,
  arg3?: ActionSelectView,
): [Selector, OctironActionSelectionArgs, ActionSelectView];

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
export function unravelArgs(
  arg1?: Selector | OctironPresentArgs,
  arg2?: OctironPresentArgs,
): [Selector, OctironSelectArgs];

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
export function unravelArgs(
  arg1?: Selector | OctironEditArgs,
  arg2?: OctironEditArgs,
): [Selector, OctironEditArgs];

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
export function unravelArgs(
  arg1?: Selector | OctironDefaultArgs,
  arg2?: OctironDefaultArgs,
): [Selector, OctironDefaultArgs];

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
export function unravelArgs(
  arg1?: Selector | AllArgs | AllViews,
  arg2?: AllArgs | AllViews,
  arg3?: AllViews,
): [Selector | undefined, AllArgs, AllViews] | [Selector | undefined, AllArgs] {
  let selector: Selector | undefined;
  let args: AllArgs = {} as AllArgs;
  let view: AllViews | undefined;

  if (typeof arg1 === "string") {
    selector = arg1;
  } else if (typeof arg1 === "function") {
    view = arg1 as SelectView;
  } else if (arg1 != null) {
    args = arg1;
  }

  if (typeof arg2 === 'function') {
    view = arg2 as SelectView;
  } else if (arg2 != null) {
    args = arg2;
  }

  if (typeof arg3 === 'function') {
    view = arg3;
  }

  if (typeof view === "undefined") {
    view = ((o: Octiron) => o.default(args as OctironDefaultArgs)) as AllViews;
  }

  return [
    selector,
    args,
    view,
  ];
}
