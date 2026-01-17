import type { JSONObject } from "./types/common.js";
import type { Aliases, AlternativesState, Context, EntityState, FailureEntityState, Fetcher, Handler, ReadonlySelectionResult, ResponseHook, SelectionDetails, SelectionListener, SubmitArgs, SuccessEntityState } from "./types/store.js";
type FetchArgs = {
    mainEntity?: boolean;
};
export type StoreArgs = {
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
     * A map of origins and the headers to use when sending
     * requests to them. Octiron will only send requests
     * to endpoints which share origins with the `rootIRI`
     * or are configured in the origins object. Aside
     * from the accept header which has a common default
     * value, headers are not shared between origins.
     */
    origins?: Record<string, Record<string, string>>;
    /**
     * The JSON-ld @vocab to use for octiron selectors.
     */
    vocab?: string;
    acceptMap?: Record<string, Array<[string, string]>>;
    /**
     * Map of JSON-ld aliases to their values.
     */
    aliases?: Record<string, string>;
    /**
     * Primary initial state.
     */
    primary?: Record<string, EntityState>;
    /**
     * Alternatives initial state.
     */
    alternatives?: AlternativesState;
    /**
     * Handler objects.
     */
    handlers: Handler[];
    /**
     * Function which performs fetch.
     */
    fetcher?: Fetcher;
    /**
     * Hook used by SSR for awaiting response promises.
     */
    responseHook?: ResponseHook;
};
export declare class Store {
    #private;
    constructor(args: StoreArgs);
    /**
     * Used only in SSR for reporting the HTTP status of the
     * main entity of the page.
     */
    get httpStatus(): number;
    /**
     * The root IRI this store is configured to work with.
     */
    get rootIRI(): string;
    /**
     * Retrieves an entity state object relating to an IRI.
     */
    entity(iri: string, accept?: string): EntityState | null;
    /**
     * Retrieves a text representation of a value in the store
     * if it is supported by the int4egration.
     */
    text(iri: string, accept?: string): string | undefined;
    get vocab(): string | undefined;
    get aliases(): Aliases;
    get context(): Context;
    /**
     * Expands a term to a type.
     *
     * If an already expanded JSON-ld type is given it will
     * return the input value.
     */
    expand(termOrType: string): string;
    select(selector: string, value?: JSONObject, { accept, }?: {
        accept?: string;
    }): SelectionDetails;
    /**
     * Generates a unique key for server rendering only.
     */
    key(): string;
    isLoading(iri: string): boolean;
    handleResponse(res: Response, iri?: string): Promise<void>;
    subscribe({ key, selector, fragment, accept, value, listener, mainEntity, }: {
        key: symbol;
        selector: string;
        fragment?: string;
        accept?: string;
        value?: JSONObject;
        listener: SelectionListener;
        mainEntity?: boolean;
    }): SelectionDetails<ReadonlySelectionResult>;
    unsubscribe(key: symbol): void;
    fetch(iri: string, accept?: string, { mainEntity, }?: FetchArgs): Promise<SuccessEntityState | FailureEntityState>;
    /**
     * Submits an action. Like fetch this will overwrite
     * entities in the store with any entities returned
     * in the response.
     *
     * @param {string} iri                The iri of the request.
     * @param {SubmitArgs} [args]         Arguments to pass to the fetch call.
     * @param {string} [args.method]      The http submit method.
     * @param {string} [args.contentType] The content type header value.
     * @param {string} [args.body]        The body of the request.
     */
    submit(iri: string, args: SubmitArgs): Promise<SuccessEntityState | FailureEntityState>;
    /**
     * Creates an Octiron store from initial state written to the page's HTML.
     *
     * @param rootIRI       The root endpoint of the API.
     * @param [disableLogs] Disables warning and error logs if the initial state
     *                      is not present or corrupt.
     * @param [vocab]       The JSON-ld @vocab to use for Octiron selectors.
     * @param [aliases]     The JSON-ld aliases to use for Octiron selectors.
     * @param [headers]     Headers to send when making requests to endpoints sharing
     *                      origins with the `rootIRI`.
     * @param [origins]     A map of origins and the headers to use when sending
     *                      requests to them. Octiron will only send requests
     *                      to endpoints which share origins with the `rootIRI`
     *                      or are configured in the origins object. Aside
     *                      from the accept header, which has a common default
     *                      value, headers are not shared between origins.
     */
    static fromInitialState({ disableLogs, rootIRI, vocab, aliases, headers, origins, handlers, }: {
        disableLogs?: boolean;
        rootIRI: string;
        vocab?: string;
        aliases?: Record<string, string>;
        headers?: Record<string, string>;
        origins?: Record<string, Record<string, string>>;
        handlers?: Handler[];
    }): Store;
    /**
     * Writes the Octiron store's state to a string to be embedded
     * near the end of a HTML document. Ideally this is placed before
     * the closing of the document's body tag. Octiron uses ids prefixed
     * with `oct-`, avoid using these ids to prevent id collision.
     */
    toInitialState(): string;
}
export {};
