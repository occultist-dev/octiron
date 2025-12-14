import type { Attributes, Children, ComponentTypes } from 'mithril';
import type { JSONObject, JSONPrimitive, JSONValue } from './common.ts'
import type { Store } from '../store.ts';
import type {
  ContentHandlingFailure,
  HTTPFailure,
  UndefinedFailure,
} from '../failures.ts';

/**
 * An iri (see url) to an entity.
 * In theory this could use other protocols (see 'tel:*') but http is the only
 * one currently supported.
 */
export type IRI = `http:${string}` | `https://${string}`;

/**
 * A un-compacted semantic web type.
 */
export type Type = IRI;

/**
 * A term, which could be a type, but for brevity is probably a term
 * under the configured vocab or alias.
 */
export type Term = Type | string;

/**
 * A string consisting of a list of terms. When using `o.enter()` it should
 * start with an iri to the desired entity and followed with optional terms.
 */
export type Selector = string;

export type BaseAttrs = Attributes;

export type PresentAttrs<
  Value extends JSONValue = JSONValue,
  Attrs extends BaseAttrs = BaseAttrs,
> = {
  renderType: 'present';
  o: Octiron;
  attrs: Attrs;
  value: Value;
};

export type UpdateArgs = {
  submit?: boolean;
  throttle?: number;
  debounce?: number;
  submitOnChange?: boolean;
};

export type OnChange<Value extends JSONValue = JSONValue> = (
  value: Value | null,
  args?: UpdateArgs,
) => void;

export type Spec = {
  name?: string;
  required: boolean;
  readonly: boolean;
  min?: JSONPrimitive;
  max?: JSONPrimitive;
  step?: number;
  pattern?: string;
  multiple?: boolean;
  minLength?: number;
  maxLength?: number;
};

export type EditAttrs<
  Value extends JSONValue = JSONValue,
  Attrs extends BaseAttrs = BaseAttrs,
> = {
  renderType: 'edit';
  o: OctironActionSelection;
  attrs: Attrs;
  value: Value;
  name: string;
  onchange: OnChange;
  onChange: OnChange;
  spec: Spec;
};

export type AnyAttrs<
  Value extends JSONValue = JSONValue,
  Attrs extends BaseAttrs = BaseAttrs,
> =
  & { o: Octiron }
  & (
    | Omit<PresentAttrs<Value, Attrs>, 'o'>
    | Omit<EditAttrs<Value, Attrs>, 'o'>
  );

export type PresentComponent<
  Value extends JSONValue = JSONValue,
  Attrs extends BaseAttrs = BaseAttrs,
> = ComponentTypes<PresentAttrs<Value, Attrs>>;

export type EditComponent<
  Value extends JSONValue = JSONValue,
  Attrs extends BaseAttrs = BaseAttrs,
> = ComponentTypes<EditAttrs<Value, Attrs>>;

export type AnyComponent<
  Value extends JSONValue = JSONValue,
  Attrs extends BaseAttrs = BaseAttrs,
> = ComponentTypes<AnyAttrs<Value, Attrs>>;

export type TypeDef<
  Value extends JSONValue = JSONValue,
  Type extends string = string,
> = {
  type: Type;
  present?: PresentComponent<Value> | AnyComponent<Value>;
  edit?: EditComponent<Value> | AnyComponent<Value>;
};

export type TypeDefs<
  Type extends string = string,
  // deno-lint-ignore no-explicit-any
  TypeDefList extends TypeDef<any, Type> = TypeDef<any, Type>,
> = {
  [TypeDef in TypeDefList as TypeDef["type"]]: TypeDef;
};

/**
 * A view which is rendered in the following situations:
 *  - A selection attempts to select values not available
 *    in the representation context.
 *  - When non-successful http statuses are returned.
 *  - An error occurs parsing a response body.
 *
 * If the content-type is recognized the value is made available via the
 * injected Octiron selection.
 */
export type FallbackView = (
  o: OctironSelection,
  err: UndefinedFailure | HTTPFailure | ContentHandlingFailure,
) => Children;

export type Fallback = FallbackView | Children;

export type SSRArgs = {
  /**
   * Used in SSR to mark the first request produced by this selection
   * as the main entity of the page.
   *
   * When marked as the main entity, the HTTP status of the first response
   * triggered by this selection will be saved to the `store.httpStatus` value
   * allowing the framework SSR rendering the Octiron app to use that status
   * code when responding with the rendered HTML.
   */
  mainEntity?: boolean;

  /**
   * Used in SSR to defer rendering the content of this selection if it
   * triggers an API request.
   *
   * Defer is ignored if main entity is true for this selection.
   */
  defer?: boolean;
};

/**
 * Arguments for all methods which afford fetching entities.
 */
export type FetchableArgs = {
  /*
   * Override the accept header
   */
  accept?: string;

  /**
   * Optional URL fragment which can be accessed by the content-type handler function.
   */
  fragment?: string;

  /**
   * Forces the retrieval of the latest representation even if the entity is in
   * the Octiron store.
   */
  forceFetch?: boolean;

  /**
   * Loading state rendered while a fetch is in progress.
   */
  loading?: Children;

  /**
   * Fallback state rendered if the fetch fails.
   */
  fallback?: Fallback;
};

export type PresentableArgs<
  Attrs extends BaseAttrs = BaseAttrs,
> = {
  attrs?: Attrs;
  // deno-lint-ignore no-explicit-any
  component?: PresentComponent<any, Attrs> | AnyComponent<any, Attrs>;
  // deno-lint-ignore no-explicit-any
  fallbackComponent?: PresentComponent<any, Attrs>;
  typeDefs?: TypeDefs;
  store?: Store;
};

export type IterablePeridcate = (octiron: Octiron) => boolean;

export type IterableArgs = {
  start?: number;
  end?: number;
  pre?: Children;
  post?: Children;
  sep?: Children;
  predicate?: IterablePeridcate;
};

export type EditableArgs = {
  readonly?: boolean;
  required?: boolean;
  min?: JSONPrimitive;
  max?: JSONPrimitive;
  step?: JSONPrimitive;
  pattern?: string;
  multiple?: boolean;
  minLength?: number;
  maxLength?: number;
  typeDefs?: TypeDefs;
  store?: Store;
};

export type OctironSelectArgs<
  Attrs extends BaseAttrs = BaseAttrs,
> =
  & FetchableArgs
  & IterableArgs
  & PresentableArgs<Attrs>
  & SSRArgs;

export type OctironPresentArgs<
  Attrs extends BaseAttrs = BaseAttrs,
> = PresentableArgs<Attrs>;

export type OctironPerformArgs<
  Attrs extends BaseAttrs = BaseAttrs,
> =
  & FetchableArgs
  & IterableArgs
  & SubmittableArgs
  & InterceptableArgs
  & UpdateableArgs<Attrs>
  & PresentableArgs<Attrs>
  & SSRArgs
;

export type OctironActionSelectionArgs<
  Attrs extends BaseAttrs = BaseAttrs,
> =
  & FetchableArgs
  & IterableArgs
  & InterceptableArgs
  & UpdateableArgs<Attrs>
  & SSRArgs
;

export type OctironEditArgs<
  Attrs extends BaseAttrs = BaseAttrs,
> =
  & UpdateableArgs<Attrs>
  & EditableArgs;
;

export type OctironDefaultArgs<
  Attrs extends BaseAttrs = BaseAttrs,
> =
  | OctironPresentArgs<Attrs>
  | OctironEditArgs<Attrs>
;

/**
 * A function that intercepts changes to an action
 * payload value and allows the intercepter to transform
 * the value before the payload is updated.
 *
 * Action selectors can have intercepters specified on them.
 * Note that they intercept the value at the root of the selection
 * and not the final value of the selection.
 *
 * @param next The changed value.
 * @param prev The previous value.
 * @param actionValue The action, or point in the action, which
 *                    relates to the edited value.
 */
export type Interceptor = (
  /**
   * The incoming intercepted value
   */
  next: JSONObject,

  /**
   * The value held before the intercepted change.
   */
  prev: JSONObject,

  /**
   * The action or value which specifies the root of the selection.
   */
  actionValue: JSONObject,
) => JSONObject;

export type InterceptableArgs = {
  interceptor?: Interceptor;
};

export type OnSubmit = () => void;
export type OnSubmitSuccess = () => void;
export type OnSubmitFailure = () => void;

export type SubmittableArgs = {
  submitOnInit?: boolean;
  submitOnChange?: boolean;
  onSubmit?: OnSubmit;
  onSubmitSuccess?: OnSubmitSuccess;
  onSubmitFailure?: OnSubmitFailure;
};

export type UpdateableArgs<
  Attrs extends BaseAttrs = BaseAttrs,
> = {
  initialValue?: JSONValue,
  throttle?: number;
  debounce?: number;
  submitOnChange?: boolean;
  attrs?: Attrs;
  // deno-lint-ignore no-explicit-any
  component?: EditComponent<any, Attrs> | AnyComponent<any, Attrs>;
  // deno-lint-ignore no-explicit-any
  fallbackComponent?: AnyComponent<any, Attrs>;
  typeDefs?: TypeDefs;
  store?: Store;
};
export interface OctironView {
  (octiron: Octiron): Children;
}

export interface SelectView {
  (octiron: OctironSelection): Children;
}

export interface Origin {
  /**
   * Fetches the root entity and presents it using the type defs.
   */
  root(): Children;
  root(selector: Selector): Children;
  // deno-lint-ignore no-explicit-any
  root(args: OctironSelectArgs<any>): Children;
  root(view: SelectView): Children;
  // deno-lint-ignore no-explicit-any
  root(selector: Selector, args: OctironSelectArgs<any>): Children;
  root(selector: Selector, view: SelectView): Children;
  // deno-lint-ignore no-explicit-any
  root(args: OctironSelectArgs<any>, view: SelectView): Children;
  // deno-lint-ignore no-explicit-any
  root(selector: Selector, args: OctironSelectArgs<any>, view: SelectView): Children;
}

export interface EntryPoint {
  enter(selector: Selector): Children;
  // deno-lint-ignore no-explicit-any
  enter(selector: Selector, args: OctironSelectArgs<any>): Children;
  enter(selector: Selector, view: SelectView): Children;
  enter(
    selector: Selector,
  // deno-lint-ignore no-explicit-any
    args: OctironSelectArgs<any>,
    view: SelectView,
  ): Children;
}

export interface Queryable {
  get(termOrType: string): JSONValue;
};

export interface Selectable {
  select(selector: Selector): Children;
  select<Attrs extends BaseAttrs = BaseAttrs>(
    selector: Selector,
    args: OctironSelectArgs<Attrs>,
  ): Children;
  select(selector: Selector, view: SelectView): Children;
  select<Attrs extends BaseAttrs = BaseAttrs>(
    selector: Selector,
    args: OctironSelectArgs<Attrs>,
    view: SelectView,
  ): Children;
}

export interface Presentable {
  present(): Children;
  present<Attrs extends BaseAttrs = BaseAttrs>(args: OctironPresentArgs<Attrs>): Children;
}

export interface PerformView {
  (octiron: OctironAction): Children;
}

export interface Performable {
  perform(): Children;
  perform(selector: Selector): Children;
  perform(args: OctironPerformArgs): Children;
  perform(view: PerformView): Children;
  perform(selector: Selector, view: PerformView): Children;
  perform(selector: Selector, args: OctironPerformArgs): Children;
  perform(args: OctironPerformArgs, view: PerformView): Children;
  perform(
    selector: Selector,
    args: OctironPerformArgs,
    view: PerformView,
  ): Children;
};

export interface ActionSelectView {
  (octiron: OctironActionSelection): Children;
}

export type PayloadValueMapper<
  Value extends JSONValue = JSONValue
> = (payloadValue: Value) => Value;

export interface Performable {
  perform(): Children;
  perform(selector: Selector): Children;
  perform(args: OctironPerformArgs): Children;
  perform(view: PerformView): Children;
  perform(selector: Selector, view: PerformView): Children;
  perform(selector: Selector, args: OctironPerformArgs): Children;
  perform(args: OctironPerformArgs, view: PerformView): Children;
  perform(
    selector: Selector,
    args: OctironPerformArgs,
    view: PerformView,
  ): Children;
};

export interface Appendable {
  remove(args?: UpdateArgs): void;
  replace(type: string, index: number, value: JSONValue, args?: UpdateArgs): void;
  append(type: string, value?: JSONValue, args?: UpdateArgs): void;
}

export interface Editable {
  edit(): Children;
  edit<Attrs extends BaseAttrs = BaseAttrs>(args: OctironEditArgs<Attrs>): Children;
}

export interface Submitable<
  Value extends JSONValue = JSONValue
> {

  /**
   * Overrides the current payload value.
   */
  update(payloadValue: Value, args?: UpdateArgs): Promise<void>;

  /**
   * Overrides the current payload value using the result of the action.
   */
  update(mapper: PayloadValueMapper<Value>, args?: UpdateArgs): Promise<void>;

  /**
   * Submits the action.
   */
  submit(): Promise<void>;

  /**
   * Overrides any current payload value and submits the action.
   */
  submit(payload: Value): Promise<void>;

  /**
   * Overrides any current payload value with the result of the mapper and
   * submits the action.
   */
  submit(mapper: PayloadValueMapper): Promise<void>;

  initial(children: Children): Children;

  success(args: OctironSelectArgs): Children;
  success(): Children;
  success(selector: Selector): Children;
  success(view: SelectView): Children;
  success(selector: Selector, args: OctironSelectArgs): Children;
  success(selector: Selector, view: SelectView): Children;
  success(
    selector: Selector,
    args: OctironSelectArgs,
    view: SelectView,
  ): Children;

  failure(): Children;
  failure(selector: Selector): Children;
  failure(args: OctironSelectArgs): Children;
  failure(view: SelectView): Children;
  failure(selector: Selector, args: OctironSelectArgs): Children;
  failure(selector: Selector, view: SelectView): Children;
  failure(
    selector: Selector,
    args: OctironSelectArgs,
    view: SelectView,
  ): Children;

  /**
   * Returns the human readable problem detail value for the last unsuccessful
   * submission if it resulted in a problem details response.
   */
  problems(): string;

  /**
   * Returns the full problem detail value for the last unsuccessful
   * submission if it resulted in a problem details response.
   */
  details(): JSONObject;
}

export interface ActionSelectable {
  select<Attrs extends BaseAttrs = BaseAttrs>(
    selector: Selector,
    args: OctironActionSelectionArgs<Attrs>,
    view: ActionSelectView,
  ): Children;
  select(selector: Selector): Children;
  select<Attrs extends BaseAttrs = BaseAttrs>(selector: Selector, args: OctironActionSelectionArgs<Attrs>): Children;
  select(selector: Selector, view: ActionSelectView): Children;
}

export interface Default {
  /**
   * For readonly instances calls `o.present()`.
   *
   * For non-readonly instances calls `o.edit()`.
   */
  default(): Children;

  /**
   * For readonly instances calls `o.present()`.
   *
   * For non-readonly instances calls `o.edit()`.
   *
   * @param {OctironDefaultArgs} args - Arguments to pass to called method.
   */
  default<Attrs extends BaseAttrs = BaseAttrs>(args: OctironDefaultArgs<Attrs>): Children;
}

export type Predicate = (octiron: Octiron) => boolean;

export interface Filterable {
  /**
   * Renders the children if the predicate passes.
   *
   * @params {Predicate} predicate - A function which takes an Octiron instance
   *                                 returns a boolean.
   * @params {Children} children   - Mithril children to render if the predicate
   *                                 passes.
   */
  (predicate: Predicate, children: Children): Children;

  /**
   * Renders the children if the predicate fails.
   *
   * @params {Predicate} predicate - A function which takes an Octiron instance
   *                                 returns a boolean.
   * @params {Children} children   - Mithril children to render if the predicate
   *                                 fails.
   */
  not(predicate: Predicate, children: Children): Children;
}

export interface ActionNot extends Submitable {
  (predicate: Predicate, children: Children): Children;
}

export interface ActionFilterable {
  /**
   * Renders the children if the predicate passes.
   *
   * @params {Predicate} predicate - A function which takes an Octiron instance
   *                                 returns a boolean.
   * @params {Children} children   - Mithril children to render if the predicate
   *                                 passes.
   */
  (predicate: Predicate, children: Children): Children;

    /**
     * Renders the children if the predicate fails.
     *
     * @params {Predicate} predicate - A function which takes an Octiron instance
     *                                 returns a boolean.
     * @params {Children} children   - Mithril children to render if the predicate
     *                                 fails.
     */
  not: ActionNot;
};

export interface OctironRoot
  extends
    Default,
    Origin,
    EntryPoint,
    Queryable,
    Selectable,
    Filterable,
    Presentable,
    Performable {
  /**
   * The Octiron instance type.
   */
  readonly octironType: 'root';

  /**
   * Octiron predicate flag.
   */
  readonly isOctiron: true;

  /**
   * The property type this instance had on the parent value.
   */
  readonly propType?: string;

  /**
   * The value's '@type' value if present.
   */
  readonly dataType?: string | string[];

  /**
   * Unique instance id.
   */
  readonly id?: string;

  /**
   * 0 based index of the octiron instance within it's selection.
   */
  readonly index: number;

  /**
   * 1 based position of the octiron instance within
   * it's selection with filters applied.
   */
  readonly position: number;

  /**
   * Only action-selection and edit instances can be editable.
   */
  readonly readonly: true;

  /**
   * The value held by this instance
   */
  readonly value: null;

  /**
   * The octiron store used for this value.
   */
  readonly store: Store;

  /**
   * Expands a term into a type.
   */
  readonly expand: Store['expand'];
}

export interface OctironSelection
  extends
    Default,
    Origin,
    EntryPoint,
    Queryable,
    Selectable,
    Filterable,
    Presentable,
    Performable {
  /**
   * The Octiron instance type.
   */
  readonly octironType: 'selection';

  /**
   * Octiron predicate flag.
   */
  readonly isOctiron: true;

  /**
   * The property type this instance had on the parent value.
   */
  readonly propType?: string;


  /**
   * The value's '@type' value if present.
   */
  readonly dataType?: string | string[];

  /**
   * Unique instance id.
   */
  readonly id?: string;

  /**
   * 0 based index of the octiron instance within it's selection.
   */
  readonly index: number;

  /**
   * 1 based position of the octiron instance within
   * it's selection with filters applied.
   */
  readonly position: number;

  /**
   * Only action-selection and edit instances can be editable.
   */
  readonly readonly: true;

  /**
   * The value held by this instance
   */
  readonly value: JSONValue;

  /**
   * The octiron store used for this value.
   */
  readonly store: Store;

  /**
   * Expands a term into a type.
   */
  readonly expand: Store['expand'];
}

export interface OctironAction
  extends
    Default,
    Origin,
    EntryPoint,
    Queryable,
    ActionSelectable,
    Presentable,
    Submitable<JSONObject>,
    ActionFilterable,
    Performable,
    Appendable {
  /**
   * The Octiron instance type.
   */
  readonly octironType: 'action';

  /**
   * Octiron predicate flag.
   */
  readonly isOctiron: true;

  /**
   * The property type this instance had on the parent value.
   */
  readonly propType?: string;

  /**
   * The value's '@type' value if present.
   */
  readonly dataType?: string | string[];

  /**
   * Unique instance id.
   */
  readonly id?: string;

  /**
   * 0 based index of the octiron instance within it's selection.
   */
  readonly index: number;

  /**
   * 1 based position of the octiron instance within
   * it's selection with filters applied.
   */
  readonly position: number;

  /**
   * True if the action is currently submitting a request.
   */
  readonly submitting: boolean;

  /**
   * Only action-selection and edit instances can be editable.
   */
  readonly readonly: false;

  /**
   * The value held by this instance
   */
  readonly value: JSONObject;

  /**
   * The http method of the action.
   */
  readonly method: string;

  /**
   * The URL of the action.
   *
   * This can only be set if the initial parameters + uri template
   * allow a valid url to be set.
   */
  readonly url?: URL;

  /**
   * The octiron store used for this value.
   */
  readonly store: Store;

  /**
   * Expands a term into a type.
   */
  readonly expand: Store['expand'];

  readonly action: Octiron;

  readonly actionValue: Octiron;
}


export interface OctironActionSelection
  extends
    Default,
    Origin,
    EntryPoint,
    Queryable,
    ActionSelectable,
    Presentable,
    Submitable<JSONObject>,
    Editable,
    ActionFilterable,
    Performable,
    Appendable {
  /**
   * The Octiron instance type.
   */
  readonly octironType: 'action-selection';

  /**
   * Octiron predicate flag.
   */
  readonly isOctiron: true;

  /**
   * The property type this instance had on the parent value.
   */
  readonly propType?: string;

  /**
   * The value's '@type' value if present.
   */
  readonly dataType?: string | string[];

  /**
   * Unique instance id that can optionally be used
   * to set ids in HTML elements.
   */
  readonly id: string;

  /**
   * 0 based index of the octiron instance within it's selection.
   */
  readonly index: number;

  /**
   * 1 based position of the octiron instance within
   * it's selection with filters applied.
   */
  readonly position: number;

  /**
   * True if the action is currently submitting a request.
   */
  readonly submitting: boolean;

  /**
   * The HTML input elements name. Mostly useful if
   * making form submissions compatible with multi-part
   * requests.
   */
  readonly inputName: string;

  /**
   * Only action-selection and edit instances can be editable.
   */
  readonly readonly: boolean;

  /**
   * The value held by this instance
   */
  readonly value: JSONValue;

  /**
   * The octiron store used for this value.
   */
  readonly store: Store;

  /**
   * Expands a term into a type.
   */
  readonly expand: Store['expand'];

  readonly action: Octiron;

  readonly actionValue: Octiron;
}

/**
 * The generic Octiron type re-defines instance methods to allow for generic
 * access without typescript throwing wobblies.
 */
export type Octiron =
  & {
    select(selector: Selector): Children;
    select<Attrs extends BaseAttrs = BaseAttrs>(
      selector: Selector,
      args: OctironSelectArgs<Attrs> | OctironActionSelectionArgs<Attrs>,
    ): Children;
    select(selector: Selector, view: SelectView | ActionSelectView): Children;
    select<Attrs extends BaseAttrs = BaseAttrs>(
      selector: Selector,
      args: OctironSelectArgs<Attrs>,
      view: (o: Octiron) => Children,
    ): Children;
  }
  & (
    | Omit<OctironRoot, 'select'>
    | Omit<OctironSelection, 'select'>
    | Omit<OctironAction, 'select'>
    | Omit<OctironActionSelection, 'select'>
  );
;

export type CommonParentArgs = {
  store: Store;
  typeDefs: TypeDefs;
  parent: Octiron;
};


export type SelectionParentArgs = CommonParentArgs & {
  value: JSONValue;
};

export type ActionParentArgs = CommonParentArgs;

export type Submit = () => Promise<void>;

export type UpdatePointer = (pointer: string, value: JSONValue, args?: UpdateArgs) => void;

export type ActionSelectionParentArgs = CommonParentArgs & {
  action: OctironAction;
  submitting: boolean;
  submit: Submit;
  updatePointer: UpdatePointer;
};

export type CommonRendererArgs = {
  index: number;
  propType?: string;
  value: JSONValue;
};

/**
 * Arguments passed from the perform renderer to any
 * Octiron action instances it manages.
 */
export type PerformRendererArgs = CommonRendererArgs & {
  actionValue: Octiron;
};

export type Update = (value: JSONValue) => void;

/**
 * Arguments passed from the action selection renderer
 * to any Octiron action selection instance it manages.
 */
export type ActionSelectionRendererArgs = CommonRendererArgs & {
  pointer: string;
  spec?: Spec;
  actionValue?: Octiron;
  update: Update;
};

