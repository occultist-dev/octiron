import { type ElementHandler, type ElementHandlerFn, type ElementIntegrationType, type ElementStateInfo } from "./alternatives/element.ts";
import { type FragmentsHandler, type FragmentsHandlerFn, type FragmentsIntegrationType, type FragmentsStateInfo } from "./alternatives/fragments.ts";
import { type UnrecognisedIntegrationType } from "./alternatives/unrecognised.ts";
import type { JSONObject } from "@occultist/mini-jsonld";
import type { AlternativeState, EntityState, FailureEntityState, ReadonlySelectionResult, SelectionDetails, SuccessEntityState } from "./types/store.ts";
/**
 * The accept header used for requests by the store if none is provided.
 */
export declare const defaultAccept: "application/problem+json, application/ld+json";
export type JSONLDHandlerFnArgs = {
    res: Response;
};
export type JSONLDHandlerResult = JSONObject;
export type JSONLDHandlerFn = (args: JSONLDHandlerFnArgs) => Promise<JSONLDHandlerResult>;
export type JSONLDHandler = {
    integrationType: 'jsonld';
    contentType: string;
    handler: JSONLDHandlerFn;
};
export type HandlerFn = JSONLDHandlerFn | ElementHandlerFn | FragmentsHandlerFn;
export type Handler = JSONLDHandler | ElementHandler | FragmentsHandler;
export type SelectionListener = (details: SelectionDetails<ReadonlySelectionResult>) => void;
export type Aliases = Record<string, string>;
export type Fetcher = (iri: string | URL, init: RequestInit) => Promise<Response>;
export type Listeners = Map<symbol, ListenerDetails>;
export type Handlers = Map<string, Handler>;
export type AcceptMap = Map<string, string>;
export type PrimaryCache = Map<string, EntityState>;
export type AlternativesCache = Map<string, AlternativeState>;
export type Origins = Map<string, Headers>;
export type ResponseHook = (promise: Promise<Response>) => void;
export type ResourceVaryArgs = {
    mainEntity?: boolean;
    method?: string;
    accept?: string;
    locale?: string;
    fragment?: string;
};
export type Context = {
    '@vocab'?: string;
} & {
    [vocab: string]: string;
};
type ListenerDetails = {
    key: symbol;
    selector?: string;
    value?: JSONObject;
    fragment?: string;
    accept?: string;
    required: string[];
    dependencies: string[];
    listener: SelectionListener;
    cleanup: () => void;
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
     * triggered by this selection will be saved to the `store.status` value
     * allowing the framework SSR rendering the Octiron app to use that status
     * code when responding with the rendered HTML.
     */
    mainEntity?: boolean;
    /**
     * The http method of the request.
     */
    method?: string;
    /**
     * Fragment identifier override.
     */
    fragment?: string;
    /**
     * The content type of the body.
     */
    contentType?: string;
    /**
     * The accept header to use when submitting the request.
     */
    accept?: string;
    /**
     * The body of the request.
     */
    body?: string;
};
export type MakeStoreArgs = {
    /**
     * The JSON-ld @vocab to use for octiron selectors.
     */
    vocab?: string;
    /**
     * Map of JSON-ld aliases to their values.
     */
    aliases?: Record<string, string>;
    /**
     * Root endpoint of the API.
     */
    rootIRI: string;
    /**
     * Headers to send when making requests to endpoints
     * sharing origins with the `rootIRI`.
     */
    headers?: Record<string, string>;
    /**
     * A record of allowed origins and the headers to use
     * when sending requests to them. Octiron will only
     * send requests to endpoints which share origins with
     * the `rootIRI` or are configured in the origins object.
     * Aside from the accept header which has a common default
     * value, headers are not shared between origins.
     */
    origins?: Record<string, Record<string, string>>;
    /**
     * Map of accept keys to their server side rendered content types.
     */
    acceptMap?: Array<[string, string]>;
    /**
     * Primary representations initial state.
     */
    primary?: Array<[string, EntityState]>;
    /**
     * Alternatives representations initial state.
     */
    alternatives?: Array<[string, AlternativeState]>;
    /**
     * Handler objects for content type handling.
     */
    handlers: Handler[];
    /**
     * Function which performs fetch. Often this is overridden
     * for SSR rendering and testing purposes.
     */
    fetcher?: Fetcher;
    /**
     * Hook used by SSR for awaiting response promises. This
     * is required for SSR to known when the Octiron store
     * has requests in flight and gives it a means to await
     * them.
     */
    responseHook?: ResponseHook;
};
type Integration = UnrecognisedIntegrationType | ElementIntegrationType | FragmentsIntegrationType;
type AlternativesStateInfo = ElementStateInfo | FragmentsStateInfo;
type SSRAlternativeState = AlternativeState & {
    integration?: Integration;
};
type InitialState = [
    acceptMap: Array<[string, string]>,
    primary: Array<[string, EntityState]>,
    alternatives: Array<[string, SSRAlternativeState, AlternativesStateInfo]>
];
export interface StoreType {
    readonly type: 'octiron-store';
    /**
     * Used only in SSR for reporting the HTTP status of the
     * main entity of the page.
     */
    readonly status?: number;
    /**
     * The root IRI the store is configured to work with.
     */
    readonly rootIRI: string;
    readonly vocab: string | undefined;
    readonly aliases: Readonly<Aliases>;
    readonly context: Context;
    /**
     * Expands a term to a type using the stores JSONLD context settings.
     */
    expand(termOrType: string): string;
    /**
     * Returns true if a request is inflight for the given resource.
     */
    inflight(iri: string | URL, args?: ResourceVaryArgs): boolean;
    /**
     * Retrieves the entity's current state in the store.
     */
    entity(iri: string | URL, args?: ResourceVaryArgs): EntityState | undefined;
    /**
     * Retrieves a entity value as text. Text only access is intended for use where
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
     * The store watches for changes in any entity (keyed by their IRI) selected
     * within the selection and pushes updated selections into subscribed listeners
     * when they occur. Changes can occur because a entity was re-fetched, or because
     * a JSONLD response contains an embedded representation identifiable by its `@id` values.
     *
     * @param args.key A symbol unique to this listener.
     * @param args.selector A selector string or URL of the entity to select.
     * @param args.value A value to make a selection from.
     * @param args.fragment A URL fragment override which can cause Octiron to render
     * content within the response representation, instead of the whole representation.
     * @param args.accept The accept header to use for any needed requests when making
     * the selection.
     * @param args.mainEntity Causes the store to set the status value if bad status
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
    /**
     * Fetches an entity.
     *
     * @param args.iri The IRI or URL of the entity.
     * @param args.fragment A URL fragment override which can cause Octiron to render
     * content within the response representation, instead of the whole representation.
     * @param args.accept The accept header to use for any needed requests when making
     * the selection.
     * @param args.mainEntity Causes the store to set the status value if bad status
     * codes are returned by any responses in the selection. If multiple bad status codes
     * are returned, the largest generally wins.
     * @param args.listener A function to be called with any selection updates.
     */
    fetch(iri: string | URL, args?: ResourceVaryArgs): Promise<EntityState>;
    /**
     * Returns the integration which is configured to handle the
     * given content type.
     */
    integration(contentType: string): Integration;
    /**
     * Used in server side rendering to serialize the store's contents
     * to JSON for Octiron on the client to initialize with.
     */
    toInitialState(): InitialState;
}
export type MakeStoreFromInitialStateArgs = {
    rootIRI: string;
    vocab?: string;
    aliases?: Record<string, string>;
    headers?: Record<string, string>;
    origins?: Record<string, Record<string, string>>;
    handlers?: Handler[];
    enableLogs?: boolean;
};
export type MakeStoreFactory = {
    (args: MakeStoreArgs): Readonly<StoreType>;
    fromInitialState(args: MakeStoreFromInitialStateArgs): Readonly<StoreType>;
};
export declare const makeStore: MakeStoreFactory;
export {};
