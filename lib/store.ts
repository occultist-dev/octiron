import {type ElementHandler, ElementIntegration, ElementIntegrationType, ElementStateInfo} from "./alternatives/element.ts";
import {type FragmentsHandler, FragmentsIntegration, FragmentsIntegrationType, FragmentsStateInfo} from "./alternatives/fragments.ts";
import {UnrecognisedIntegration, UnrecognisedIntegrationType} from "./alternatives/unrecognised";
import {isBrowserRender} from "./consts";
import {HTTPFailure} from "./failures.ts";
import type {Aliases, AlternativeSelectionResult, AlternativeState, Context, EntitySelectionResult, EntityState, FailureEntityState, JSONLDHandler, JSONLDHandlerResult, JSONObject, ProblemDetailsHandler, ReadonlySelectionResult, SelectionDetails, SelectionListener, SuccessEntityState, ValueSelectionResult} from "./octiron";
import {flattenIRIObjects} from "./utils/flattenIRIObjects";
import {getSelection} from './utils/getSelection.ts';
import {mithrilRedraw} from "./utils/mithrilRedraw.ts";

/**
 * The accept header used for requests by the store if none is provided.
 */
export const defaultAccept = 'application/problem+json, application/ld+json' as const;

/**
 * Integration factories.
 */
const integrations = {
  unrecognised: UnrecognisedIntegration,
  element: ElementIntegration,
  fragments: FragmentsIntegration,
} as const;

export type Handler =
  | JSONLDHandler
  | ProblemDetailsHandler
  | ElementHandler
  | FragmentsHandler
;

export type Listener = (details: SelectionDetails<ReadonlySelectionResult>) => void;
export type Aliases = Record<string, string>;
export type Fetcher = typeof fetch;
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

type Dependencies = Map<string, Set<symbol>>;
type ListenerDetails = {
  key: symbol;
  selector?: string;
  value?: JSONObject;
  fragment?: string;
  accept?: string;
  required: string[];
  dependencies: string[];
  listener: Listener;
  cleanup: () => void;
};

/**
 * The accept key is used to locate the last content type
 * value that was returned for an equivalent request.
 *
 * For Octiron an equivalent request is one that has
 * the same method, IRI (less the fragment) and accept header value.
 *
 * TODO: Determine handling of requests with bodies.
 */
function makeContentTypeKey(iri: string | URL, args?: ResourceVaryArgs): string {
  let url: URL | string = new URL(iri);

  url.hash = '';
  url = url.toString();

  const method = args?.method?.toLowerCase() ?? 'get';
  const accept = args?.accept ?? '';

  return `${method}|${url}|${accept}`;
}

/**
 * Creates the primary key as well as the content type key since
 * they are often used together if the primary key is used.
 *
 * The primary cache is shared by JSONLD content types (theoretically
 * including any RDF type if one wanted to used them) and the problem
 * detail types. The primary cache is not varied by content type since
 * it should either have a current JSONLD equiv state (this could be
 * an bad response) or hold problem details (which should be a bad
 * response).
 *
 * TODO: Redesign the sharing of the primary cache for JSONLD and
 * problem details responses. Bad alternative responses would cause
 * overwrites on JSONLD responses, even if they were for an
 * incompatible content type.
 */
function makePrimaryKey(iri: string | URL, args?: ResourceVaryArgs): [
  primaryKey: string,
  contentTypeKey: string,
  normalizedURL: string,
] {
  let url: URL | string = new URL(iri);

  url.hash = '';
  url = url.toString();

  const method = args?.method?.toLowerCase() ?? 'get';
  const accept = args?.accept ?? '';
  const primaryKey = `${method}|${url}`;

  return [
    primaryKey,
    `${primaryKey}|${accept}`,
    url,
  ];
}

/**
 * The alternative type key is used to locate a entity state from
 * the alternative cache.
 */
function makeAlternativeKey(iri: string | URL, contentType?: string, args?: ResourceVaryArgs): string {
  let url: URL | string = new URL(iri);

  url.hash = '';
  url = url.toString();

  const method = args?.method?.toLowerCase() ?? 'get';

  return `${method}|${url}|${contentType ?? ''}`;
}

/**
 * Creates a function that cleans up when a listener unsubscribes.
 */
function makeCleanupFn(
  key: symbol,
  details: SelectionDetails,
  primary: PrimaryCache,
  dependencies: Dependencies,
  listeners: Listeners,
): () => void {
  return () => {
    listeners.delete(key);

    for (const dependency of details.dependencies) {
      const normalizedURL = new URL(dependency).toString();
      dependencies.delete(normalizedURL);

      if (isBrowserRender) {
        // TODO: Make this configurable and support deleting alternatives
        setTimeout(() => {
          if (dependencies.get(normalizedURL)?.size === 0) {
            const [primaryKey] = makePrimaryKey(dependency);

            primary.delete(primaryKey);
          }
        }, 5000);
      }
    }
  }
}

/**
 * Loops over all listeners registers against an entity,
 * calling them with an updated selection.
 */
function publish(
  normalizedURL: string,
  contentType: string,
  contentTypeKey: string,
  acceptMap: AcceptMap,
  primary: PrimaryCache,
  dependencies: Dependencies,
  listeners: Listeners,
): void {
  const keys = dependencies.get(normalizedURL);

  if (keys == null) {
    return;
  }

  for (const key of keys) {
    const listenerDetails = listeners.get(key);

    if (listenerDetails == null) {
      continue;
    }

    const mappedType = acceptMap.get(contentTypeKey);

    // TODO: A more sophisticated check might be required 
    // to correctly check the content type matches the
    // listener's accept header
    // TODO: Review this is required. The accept map should be
    // source of truth.
    if (contentType !== mappedType) continue;

    const details = getSelection<EntitySelectionResult | ValueSelectionResult | AlternativeSelectionResult>({
      selector: listenerDetails.selector,
      value: listenerDetails.value,
      fragment: listenerDetails.fragment,
      accept: listenerDetails.accept,
      store: this,
    } as Parameters<typeof getSelection>[0]);

    const cleanup = makeCleanupFn(
      key,
      details,
      primary,
      dependencies,
      listeners,
    );

    for (const dependency of details.dependencies) {
      const normalizedURL = new URL(dependency).toString();
      let depSet = dependencies.get(normalizedURL);

      if (depSet == null) {
        depSet = new Set([key]);

        dependencies.set(normalizedURL, depSet);
      } else {
        depSet.add(key);
      }
    }

    listenerDetails.cleanup = cleanup;
    listenerDetails.listener(details);
  }
}

function handleJSONLD(
  res: Response,
  content: JSONLDHandlerResult,
  normalizedURL: string,
  contentType: string,
  contentTypeKey: string,
  primaryKey: string,
  acceptMap: AcceptMap,
  primary: PrimaryCache,
  dependencies: Dependencies,
  listeners: Listeners,
): void {
  const iris: string[] = [normalizedURL];

  if (res.ok) {
    primary.set(primaryKey, {
      type: 'entity-success',
      iri: normalizedURL,
      fragment: undefined,
      loading: false,
      ok: true,
      contentType,
      value: content.jsonld,
      isProblem: false,
    })
  } else {
    const reason = new HTTPFailure(res.status, res);

    primary.set(primaryKey, {
      type: 'entity-failure',
      iri: normalizedURL,
      loading: false,
      ok: false,
      value: content.jsonld,
      contentType,
      status: res.status,
      isProblem: false,
      reason,
    });
  }

  for (const entity of flattenIRIObjects(content.jsonld)) {
    const [primaryKey,, normalizedURL] = makePrimaryKey(entity['@id']);

    if (iris.includes(normalizedURL)) {
      continue;
    }

    primary.set(primaryKey, {
      type: 'entity-success',
      iri: normalizedURL,
      fragment: undefined,
      loading: false,
      ok: true,
      value: entity,
      contentType,
      isProblem: false,
    });
  }

  for (const iri of iris) {
    publish(
      iri,
      contentType,
      contentTypeKey,
      acceptMap,
      primary,
      dependencies,
      listeners,
    );
  }
}

/**
 * Handles a resolved response object, parsing the content and
 * caching the results in the correct store.
 *
 * TODO: Support responses with no content / no content-type.
 */
async function handleResponse(
  res: Response,
  method: string,
  normalizedURL: string,
  contentTypeKey: string,
  primaryKey: string,
  handlers: Handlers,
  acceptMap: AcceptMap,
  primary: PrimaryCache,
  alternatives: AlternativesCache,
  dependencies: Dependencies,
  listeners: Listeners,
  args?: ResourceVaryArgs,
): Promise<void> {
  const contentType = res.headers.get('Content-Type')?.split?.(';')?.[0];
  const etag = res.headers.get('Etag');

  if (contentType == null) {
    throw new Error('Content type not specified in response');
  }

  const handler = handlers.get(contentType);
  const alternativeKey = makeAlternativeKey(normalizedURL, contentType, args);

  if (handler?.integrationType === 'jsonld') {
    const content = await handler.handler({
      res,
      store: this,
    });

    handleJSONLD(
      res,
      content,
      normalizedURL,
      contentType,
      contentTypeKey,
      primaryKey,
      acceptMap,
      primary,
      dependencies,
      listeners,
    );
  } else {
    // TODO: Support problem details 
    const integration = integrations[handler?.integrationType ?? 'unrecognised']({
      iri: normalizedURL,
      method,
      contentType,
    });

    alternatives.set(alternativeKey, {
      type: 'alternative-success',
      ok: res.ok,
      status: res.status,
      iri: normalizedURL,
      contentType,
      isProblem: false,
      etag,
      integration,
    });

    publish(
      normalizedURL,
      contentType,
      contentTypeKey,
      acceptMap,
      primary,
      dependencies,
      listeners,
    );
  }
}

async function performFetch(
  iri: string | URL,
  args: SubmitArgs,
  rootOrigin: string,
  headers: Headers,
  origins: Origins,
  inflight: Set<string>,
  fetcher: Fetcher,
  handlers: Handlers,
  acceptMap: AcceptMap,
  primary: PrimaryCache,
  alternatives: AlternativesCache,
  dependencies: Dependencies,
  listeners: Listeners,
  responseHook: ResponseHook,
): Promise<number> {
  let status: number;

  const url = new URL(iri);
  const method = args.method || 'get';
  const accept = args.accept ?? headers.get('Accept') ?? defaultAccept;
  const [primaryKey, contentTypeKey, normalizedURL] = makePrimaryKey(iri, {
    method,
    accept,
  });

  if (inflight.has(contentTypeKey)) {
    return;
  }

  if (url.origin === rootOrigin) {
    headers = new Headers(headers);
  } else if (origins.has(url.origin)) {
    headers = new Headers(origins.get(url.origin));
  } else {
    throw new Error(`Un-configured origin "${url.origin}"`);
  }
  
  headers.set('Accept', accept);

  if (args.body != null && args.contentType != null) {
    headers.set('Content-Type', args.contentType);
  }

  inflight.add(contentTypeKey);

  mithrilRedraw();

  // This promise wrapping is so SSR can hook in and await the promise.
  const promise = new Promise<Response>(async (resolve) => {
    let res: Response;

    if (fetcher != null) {
      res = await fetcher(normalizedURL, {
        method,
        headers,
        body: args.body,
      });
    } else {
      res = await fetch(normalizedURL, {
        method,
        headers,
        body: args.body,
      });
    }

    const contentType = res.headers.get('Content-Type');

    acceptMap.set(contentTypeKey, contentType);

    // Loading state must be reset before handling responses.
    inflight.delete(contentTypeKey);
    
    await handleResponse(
      res,
      method,
      normalizedURL,
      contentTypeKey,
      primaryKey,
      handlers,
      acceptMap,
      primary,
      alternatives,
      dependencies,
      listeners,
      args,
    );

    mithrilRedraw();

    resolve(res);
  });

  if (responseHook != null) {
    responseHook(promise);
  }

  await promise;

  return status;
}

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
  root: string;

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

type Integration =
  | UnrecognisedIntegrationType
  | ElementIntegrationType
  | FragmentsIntegrationType
;

type AlternativesStateInfo =
  | ElementStateInfo
  | FragmentsStateInfo
;


type SSRAlternativeState = AlternativeState & {
  integration?: Integration;
}

type InitialState = [
  acceptMap: Array<[string, string]>,
  primary: Array<[string, EntityState]>,
  alternatives: Array<[string, AlternativesStateInfo, SSRAlternativeState]>,
];

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
   * Used in server side rendering to serialize the store's contents
   * to JSON for Octiron on the client to initialize with.
   */
  toInitialState(): InitialState;
};

export type MakeStoreFromInitialStateArgs = {
  root: string;
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

export const makeStore = ((args) => {
  let status: number;
  const root = args.root;
  const rootOrigin = new URL(root).origin;
  const headers = new Headers(args.headers);
  const vocab = args.vocab;
  const aliases: Record<string, string> = Object.create(null);
  const context: Context = Object.create(null);
  const termExpansions = new Map<string, string>();
  const fetcher: Fetcher = args.fetcher ?? fetch;
  const origins: Origins = args.origins ?? Object.create(null);
  const handlers: Handlers = new Map();

  /**
   * The primary cache behaves differently to the alternatives.
   * JSONLD is a concrete implementation of RDF. In theory other
   * RDF implementations can map to JSONLD, and Octiron can
   * in theory be configured to have them use the JSONLD integration
   * type push their representations into the primary cache as an
   * alternative to JSONLD. The primary cache COULD be used as a cache
   * for all RDF media-types, but their handlers would have to parse
   * their content into the JSONLD data model for that to work.
   */
  const primary: PrimaryCache = new Map(args.primary);

  /**
   * The alternatives cache.
   * This stores all non-JSONLD equiv content types.
   */
  const alternatives: AlternativesCache = new Map(args.alternatives);

  // Set of accept keys which currently have requests inflight.
  const inflight = new Set<string>();

  // Maps the accept key to the resolved content type
  // of the last response for that representation.
  const acceptMap = new Map<string, string>(args.acceptMap);

  // Content types that are used in the primary store.
  // Typically this will be JSONLD compat types.
  const primaryContentTypes = new Set<string>();

  const dependencies: Dependencies = new Map();

  const listeners: Listeners = new Map();

  const responseHook: ResponseHook = args.responseHook;

  if (vocab != null) {
    context['@vocab'] = vocab;
  }

  if (args.aliases != null) {
    for (const [key, value] of Object.entries(args.aliases)) {
      aliases[key] = value;
      context[key] = value;
    }
  }

  if (args.origins != null) {
    for (const [origin, headers] of Object.entries(args.origins)) {
      origins.set(origin, new Headers(headers));
    }
  }

  if (args.handlers != null) {
    for (let i = 0, l = args.handlers.length; i < l; i++) {
      handlers.set(args.handlers[i].contentType, args.handlers[i]);

      if (args.handlers[i].integrationType === 'jsonld') {
        primaryContentTypes.add(args.handlers[i].contentType);
      }
    }
  }
  
  Object.freeze(aliases);
  Object.freeze(context);

  const store: StoreType = {
    root,
    vocab,
    aliases,
    context,
    get status() {
      return status;
    },
    expand(this: StoreType, termOrType) {
      const cached = termExpansions.get(termOrType);

      if (cached != null) {
        return cached;
      }

      let expanded: string | undefined;

      if (vocab != null && !/^[\w\d]+\:/.test(termOrType)) {
        expanded = vocab + termOrType;
      } else if (/https?:\/\//.test(termOrType)) {
        // is a type
        expanded = termOrType;
      } else {
        for (const [key, value] of Object.entries(aliases)) {
          const reg = new RegExp(`^${key}:`);
          if (reg.test(termOrType)) {
            expanded = termOrType.replace(reg, value);
            break;
          }
        }
      }

      termExpansions.set(termOrType, expanded ?? termOrType);

      return expanded ?? termOrType;
    },
    inflight(this: StoreType, iri, args) {
      return inflight.has(makeContentTypeKey(iri, args));
    },
    entity(this: StoreType, iri, args) {
      const [
        primaryKey,
        contentTypeKey,
        normalizedURL,
      ] = makePrimaryKey(iri, args);
      
      if (inflight.has(contentTypeKey)) {
        return {
          type: 'entity-loading',
          iri: normalizedURL,
          loading: true,
          isProblem: false,
        };
      }

      const contentType = acceptMap.get(contentTypeKey);

      if (contentType == null) {
        return;
      } else if (primaryContentTypes.has(contentType)) {
        return primary.get(primaryKey);
      }

      const alternativeKey = makeAlternativeKey(normalizedURL, contentType, args);

      return alternatives.get(alternativeKey);
    },
    text(this: StoreType, iri, args) {
      const [key, fragment] = iri.toString().split('#');
      const entity = this.entity(key, args);

      if (entity == null ||
          entity.type !== 'alternative-success' ||
          entity.integration.text != null) {
        return;
      }

      return entity.integration.text(fragment);
    },
    select(this: StoreType, selector, value, args) {
      return getSelection({
        selector: selector.toString(),
        value,
        accept: args?.accept,
        store: this,
      });
    },
    async fetch(this: StoreType, iri, args) {
      const responseStatus = await performFetch(
        iri,
        args,
        rootOrigin,
        headers,
        origins,
        inflight,
        fetcher,
        handlers,
        acceptMap,
        primary,
        alternatives,
        dependencies,
        listeners,
        responseHook,
      );

      if (args?.mainEntity &&
          !isBrowserRender &&
          (status == null || status < 400) &&
          (responseStatus < 300 || responseStatus <= 400)
      ) {
        status = responseStatus;
      }

      return this.entity(iri, args);
    },
    async submit(this: StoreType, iri, args) {
      const url = new URL(iri);
      args.fragment = url.hash === '' ? undefined : url.hash.substring(1, url.hash.length);

      const responseStatus = await performFetch(
        iri,
        args,
        rootOrigin,
        headers,
        origins,
        inflight,
        fetcher,
        handlers,
        acceptMap,
        primary,
        alternatives,
        dependencies,
        listeners,
        responseHook,
      );

      if (args?.mainEntity &&
          !isBrowserRender &&
          (status == null || status < 400) &&
          (responseStatus < 300 || responseStatus <= 400)
      ) {
        // if SSR store the first 400+ status for the final HTTP response
        status = responseStatus;
      }

      const loading = this.inflight(iri, args);

      if (loading && !isBrowserRender) {
        const key = Symbol();
        const { promise, resolve } = Promise.withResolvers<SuccessEntityState | FailureEntityState>();

        this.subscribe({
          key,
          selector: iri.toString(),
          // fragment,
          accept: args.accept,
          listener: () => {
            this.unsubscribe(key);

            resolve(this.entity(iri, args) as SuccessEntityState | FailureEntityState)
          }
        });

        return promise;
      }

      return this.entity(iri, args) as SuccessEntityState | FailureEntityState;
    },
    subscribe(args) {
      const selector = args.selector.toString();
      const details = getSelection<ReadonlySelectionResult>({
        selector,
        value: args.value,
        accept: args.accept,
        fragment: args.fragment,
        store,
      });
      const cleanup = makeCleanupFn(
        args.key,
        details,
        primary,
        dependencies,
        listeners
      );

      for (const dependency of details.dependencies) {
        const normalizedURL = new URL(dependency).toString();
        const depSet = dependencies.get(normalizedURL);

        if (depSet == null) {
          dependencies.set(normalizedURL, new Set([args.key]));
        } else {
          depSet.add(args.key);
        }
      }

      listeners.set(args.key, {
        selector,
        key: args.key,
        value: args.value,
        fragment: args.fragment,
        accept: args.accept,
        required: details.required,
        dependencies: details.dependencies,
        listener: args.listener,
        cleanup,
      });

      // If this is the main entity and the details has
      // missing deps simulate a 404 if no other bad
      // status code has been set
      if (!isBrowserRender &&
          args.mainEntity &&
          details.hasMissing &&
          status < 400
      ) {
        status = 404;
      }

      return details;
    },
    unsubscribe(this: StoreType, key) {
      listeners.get(key)?.cleanup();
    },
    toInitialState() {
      const initialState: InitialState = [
        Array.from(acceptMap.entries()),
        Array.from(primary.entries()),
        Array.from(alternatives.entries())
          .map(([contentTypeKey, alternative]) => {
            const altState = alternative.integration.getStateInfo();
            delete (alternative as any).integration;
            return [contentTypeKey, altState, alternative] as [string, AlternativesStateInfo, SSRAlternativeState];
          }),
      ];

      return initialState;
    },
  };

  return Object.freeze(store);
}) as MakeStoreFactory;

makeStore.fromInitialState = ({
  root,
  vocab,
  aliases,
  headers,
  origins,
  handlers,
  enableLogs,
}) => {
  performance.mark('octiron:from-initial-state:start')
  
  const storeArgs: MakeStoreArgs = {
    root,
    vocab,
    aliases,
    handlers,
    headers,
    origins,
  };

  try {
    const el = document.getElementById('oct-state') as HTMLScriptElement;

    if (el == null) {
      if (enableLogs) {
        console.warn('Failed to construct Octiron state from initial state');
      }

      return makeStore(storeArgs);
    }

    const stateInfo = JSON.parse(el.innerText) as InitialState;
    const alternatives: MakeStoreArgs['alternatives'] = [];
    const handlersMap: Record<string, Handler> = handlers.reduce((acc, handler) => {
      acc[handler.contentType] = handler;

      return acc;
    }, {});

    for (let i = 0, l = stateInfo[2].length; i < l; i++) {
      const [contentTypeKey, altInfo, alternative] = stateInfo[2][i];

      const factory = integrations[altInfo.integrationType];
      const handler = handlersMap[altInfo.contentType];
      
      if (factory == null) continue;

      alternative.integration = factory.fromInitialState(
        altInfo as any,
        handler as any,
      ) as any;

      alternatives.push([contentTypeKey, alternative]);
    }

    const store = makeStore({
      ...storeArgs,
      alternatives,
      acceptMap: stateInfo[0],
      primary: stateInfo[1],
    });
    performance.mark('octiron:from-initial-state:end')
    performance.measure('octiron:from-initial-state:duration', 'octiron:from-initial-state:start', 'octiron:from-initial-state:end');

    return store;
  } catch (err) {
    if (enableLogs) {
      console.warn('Failed to construct Octiron state from initial state');
      console.error(err)
    }

    const store = makeStore(storeArgs);
    performance.mark('octiron:from-initial-state:end')
    performance.measure('octiron:from-initial-state:duration', 'octiron:from-initial-state:start', 'octiron:from-initial-state:end');
    return store;
  }
}
