import {Aliases, Context, EntityState, FailureEntityState, IntegrationState, JSONObject, ReadonlySelectionResult, SelectionDetails, SelectionListener, SuccessEntityState} from "./octiron";


export type ResourceVaryArgs = {
  method?: string;
  accept?: string;
  locale?: string;
  fragment?: string;
};

export type SubscribeArgs = {
  key: symbol;
  mainEntity?: boolean;
  selector: string | URL;
  value?: JSONObject;
  accept?: string;
  fragment?: string;
  listener: SelectionListener;
};

export type SubmitArgs = {

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
   * The http method of the request.
   */
  method?: string;

  /**
   * The accept header to use when submitting the request.
   */
  accept?: string;

  /**
   * The body of the request.
   */
  body?: string;
};


export interface StoreType {

  /**
   * Used only in SSR for reporting the HTTP status of the
   * main entity of the page.
   */
  readonly status?: number;

  /**
   * The root IRI the store is configured to work with.
   */
  readonly root: string;

  readonly vocab: string | undefined;

  readonly aliases: Aliases;

  readonly context: Context;

  /**
   * Generates a unique key. Used in server rendering only.
   */
  key(): string;

  /**
   * Expands a term to a type using the stores JSONLD context settings.
   */
  expand(termOrType: string): string;

  /**
   * Returns true if a request is inflight for the given resource.
   */
  inflight(iri: string | URL, args?: ResourceVaryArgs): boolean;

  /**
   * Retrieves the resource's current state in the store.
   */
  resource(iri: string | URL, args?: ResourceVaryArgs): EntityState | undefined;

  /**
   * Retrieves a resource value as text. Text only access is intended for use where 
   * VDOM is not a practical means of representing a value. Such as when
   * populating aria values on an element. Text will only be returned if the
   * content type and Octiron integration, such as the fragments integration, are
   * configured to handle it.
   */
  text(iri: string | URL, args?: ResourceVaryArgs): string | undefined;

  /**
   * Performs a selection against the store.
   */
  select(selector: string | URL, value: JSONObject | undefined, args: ResourceVaryArgs): SelectionDetails;

  /**
   * Subscribes to a selection.
   * 
   * A selection begins from a URL or from a passed in JSON object value.
   *
   * If no value is passed in and the selector is a string, the first part of
   * the selector (space separated) is assumed to be a URL.
   *
   * The store watches for changes in any resource (keyed by their IRI) selected
   * within the selection and pushes updated selections into subscribed listeners
   * when they occur. Changes can occur because a resource was re-fetched, or because
   * a JSONLD response contains an embedded representation identifiable by its `@id` values.
   *
   * @param args.key A symbol unique to this listener.
   * @param args.selector A selector string or URL of the resource to select.
   * @param args.value A value to make a selection from.
   * @param args.fragment A URL fragment override which can cause Octiron to render
   * content within the response representation, instead of the whole representation.
   * @param args.accept The accept header to use for any needed requests when making
   * the selection.
   * @param args.mainEntity Causes the store to set the httpStatus value if bad status
   * codes are returned by any responses in the selection. If multiple bad status codes
   * are returned, the largest generally wins.
   * @param args.listener A function to be called with any selection updates.
   */
  subscribe(args: SubscribeArgs): SelectionDetails<ReadonlySelectionResult>;

  /**
   * Unsubscribes from a selection using the listener's unique key.
   */
  unsubscribe(key: symbol): void;
  
  /**
   * Submits an action.
   */
  submit(iri: string | URL, args?: SubmitArgs): Promise<SuccessEntityState | FailureEntityState>;
};

