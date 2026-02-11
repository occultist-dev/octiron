import {HTMLFragmentsIntegration} from "./alternatives/htmlFragments.js";
import {UnrecognizedIntegration} from "./alternatives/unrecognized.js";
import {isBrowserRender} from "./consts.js";
import {HTTPFailure} from "./failures.js";
import type {JSONObject} from "./types/common.js";
import type {Aliases, AlternativeSelectionResult, AlternativesState, Context, EntitySelectionResult, EntityState, FailureEntityState, Fetcher, Handler, IntegrationStateInfo, IntegrationType, JSONLDHandlerResult, PrimaryState, ReadonlySelectionResult, ResponseHook, SelectionDetails, SelectionListener, SubmitArgs, SuccessEntityState, ValueSelectionResult} from "./types/store.js";
import {flattenIRIObjects} from "./utils/flattenIRIObjects.js";
import {getSelection} from './utils/getSelection.js';
import {mithrilRedraw} from "./utils/mithrilRedraw.js";

const defaultAccept = 'application/problem+json, application/ld+json';
const integrationClasses = {
  [HTMLFragmentsIntegration.type]: HTMLFragmentsIntegration,
  [UnrecognizedIntegration.type]: UnrecognizedIntegration,
};

type StateInfo = {
  primary: Record<string, EntityState>;
  alternatives: Record<string, IntegrationStateInfo[]>;
  acceptMap: Record<string, Array<[string, string]>>;
};

type Dependencies = Map<string, Set<symbol>>;
type Listener = (details: SelectionDetails<ReadonlySelectionResult>) => void;
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
type Listeners = Map<symbol, ListenerDetails>;

type FetchArgs = {
  mainEntity?: boolean;
};

function getJSONLdValues(vocab?: string, aliases?: Record<string, string>): [Map<string, string>, Context] {
  const aliasMap: Map<string, string> = new Map<string, string>();
  const context: Context = {};

  if (vocab != null) {
    context['@vocab'] = vocab;
  }

  if (aliases == null) {
    return [aliasMap, context];
  }

  for (const [key, value] of Object.entries(aliases)) {
    context[key] = value;
    aliasMap.set(key, value);
  }

  return [aliasMap, context];
}

function getInternalHeaderValues(
  headers?: Record<string, string>,
  origins?: Record<string, Record<string, string>>,
): [Headers, Map<string, Headers>] {
  const internalHeaders = new Headers([['accept', defaultAccept ]]);
  const internalOrigins = new Map<string, Headers>();

  if (headers != null) {
    for (const [key, value] of Object.entries(headers)) {
      internalHeaders.set(key, value);
    }
  }

  if (origins != null) {
    for (const [origin, headers] of Object.entries(origins)) {
      const internalHeaders = new Headers([['accept', defaultAccept]]);

      for (const [key, value] of Object.entries(headers)) {
        internalHeaders.set(key, value);
      }

      internalOrigins.set(origin, internalHeaders);
    }
  }

  return [internalHeaders, internalOrigins];
}

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

export class Store {

    #httpStatus: number;
    #rootIRI: string;
    #rootOrigin: string;
    #headers: Headers;
    #origins: Map<string, Headers>;
    #vocab?: string | undefined;
    #aliases: Map<string, string>;
    #primary: PrimaryState = new Map();
    #loading: Set<string> = new Set();
    #integrations: AlternativesState = new Map();
    #handlers: Map<string, Handler>;
    #keys: Set<string> = new Set();
    #context: Context;
    #termExpansions: Map<symbol, string | null> = new Map();
    #fetcher?: Fetcher;
    #responseHook?: ResponseHook;
    #dependencies: Dependencies = new Map();
    #listeners: Listeners = new Map();

    // iri => accept => [loading, contentType]
    #acceptMap: Map<string, Map<string, string>> = new Map();

    constructor(args: StoreArgs) {
      this.#rootIRI = args.rootIRI;
      this.#rootOrigin = new URL(args.rootIRI).origin;
      this.#vocab = args.vocab;
      this.#fetcher = args.fetcher;
      this.#responseHook = args.responseHook;

      [this.#headers, this.#origins] = getInternalHeaderValues(args.headers, args.origins);
      [this.#aliases,this.#context] = getJSONLdValues(args.vocab, args.aliases);

      this.#handlers = new Map(args.handlers?.map?.((handler) => [handler.contentType, handler]));

      if (args.primary != null) {
        this.#primary = new Map(Object.entries(args.primary));
      }

      if (!this.#headers.has('accept')) {
        this.#headers.set('accept', defaultAccept);
      }

      for (const origin of Object.values(this.#origins)) {
        if (!origin.has('accept')) {
          origin.set('accept', defaultAccept);
        }
      }

      if (args.acceptMap != null) {
        for (const [accept, entries] of Object.entries(args.acceptMap)) {
          this.#acceptMap.set(accept, new Map(entries));
        }
      }

      if (args.alternatives != null) {
        this.#integrations = args.alternatives;
      }
    }

    /**
     * Used only in SSR for reporting the HTTP status of the
     * main entity of the page.
     */
    public get httpStatus(): number {
      return this.#httpStatus;
    }

    /**
     * The root IRI this store is configured to work with.
     */
    public get rootIRI(): string {
      return this.#rootIRI;
    }

    /**
     * Retrieves an entity state object relating to an IRI.
     */
    public entity(iri: string, accept?: string): EntityState | null {
      if (accept == null) {
        return this.#primary.get(iri) ?? null;
      }

      //const key = this.#getLoadingKey(iri, 'get', accept);
      //const loading = this.#loading.has(key);

      //if (loading) {
      //  return {
      //    type: 'entity-loading',
      //    iri,
      //    loading: true,
      //  };
      //}

      const contentType = this.#acceptMap.get(iri)?.get?.(accept);

      if (contentType == null) {
        return null;
      }

      const integration = this.#integrations.get(contentType)?.get(iri);

      if (integration == null) {
        return null;
      }
    
      return {
        type: 'alternative-success',
        iri,
        loading: false,
        ok: true,
        isProblem: false,
        integration,
      };
    }

    /**
     * Retrieves a text representation of a value in the store
     * if it is supported by the int4egration.
     */
    public text(iri: string, accept?: string): string | undefined {
      const [key, fragment] = iri.split('#');
      const entity = this.entity(key, accept);

      if (entity == null) {
        return;
      }
    
      if (entity?.type === 'alternative-success' &&
         entity.integration.text != null) {
        return entity.integration.text(fragment);
      }
    }

    public get vocab(): string | undefined {
      return this.#vocab;
    }

    public get aliases(): Aliases {
      return Object.fromEntries(
        this.#aliases.entries()
          .map(([key, value]) => [key.replace(/^/, ''), value])
      );
    }


    public get context(): Context {
      return this.#context;
    }

    /**
     * Expands a term to a type.
     *
     * If an already expanded JSON-ld type is given it will
     * return the input value.
     */
    public expand(termOrType: string): string {
      const sym = Symbol.for(termOrType);
      const cached = this.#termExpansions.get(sym);

      if (cached != null) {
        return cached;
      }

      let expanded: string | undefined;

      if (this.#vocab != null && !/^[\w\d]+\:/.test(termOrType)) {
        expanded = this.#vocab + termOrType;
      } else if (/https?:\/\//.test(termOrType)) {
        // is a type
        expanded = termOrType;
      } else {
        for (const [key, value] of this.#aliases) {
          const reg = new RegExp(`^${key}:`);
          if (reg.test(termOrType)) {
            expanded = termOrType.replace(reg, value);
            break;
          }
        }
      }

      this.#termExpansions.set(sym, expanded ?? termOrType);

      return expanded ?? termOrType;
    }

    public select(selector: string, value?: JSONObject, {
      accept,
    }: {
      accept?: string;
    } = {}): SelectionDetails {
      return getSelection({
        selector,
        value,
        accept,
        store: this,
      });
    }

    /**
     * Generates a unique key for server rendering only.
     */
    public key(): string {
      while (true) {
        const key = `oct-${Math.random().toString(36).slice(2, 7)}`;

        if (!this.#keys.has(key)) {
          this.#keys.add(key);

          return key;
        }
      }
    }

    /**
     * Creates a cleanup function which should be called
     * when a subscriber unlistens.
     */
    #makeCleanupFn(key: symbol, details: SelectionDetails) {
      return () => {
        this.#listeners.delete(key);

        for (const dependency of details.dependencies) {
          this.#dependencies.delete(dependency);

          if (isBrowserRender) {
            setTimeout(() => {
              if (this.#dependencies.get(dependency)?.size === 0) {
                this.#primary.delete(dependency);
              }
            }, 5000);
          }
        }
      }
    }

    /**
     * Creates a unique key for the ir, method and accept headers
     * to be used to mark the request's loading status.
     */
    #getLoadingKey(iri: string, method: string, accept?: string): string {
      accept = accept ?? this.#headers.get('accept') ?? defaultAccept;

      return `${method?.toLowerCase()}|${iri}|${accept.toLowerCase()}`;
    }

    public isLoading(iri: string): boolean {
      const loadingKey = this.#getLoadingKey(iri, 'get');

      return this.#loading.has(loadingKey);
    }

    /**
     * Called on change to an entity. All listeners with dependencies in their
     * selection for this entity have the latest selection result pushed to
     * their listener functions.
     */
    #publish(iri: string, _contentType?: string): void {
      const keys = this.#dependencies.get(iri);

      if (keys == null) {
        return;
      }

      for (const key of keys) {
        const listenerDetails = this.#listeners.get(key);

        if (listenerDetails == null) {
          continue;
        }

        const details = getSelection<EntitySelectionResult | ValueSelectionResult | AlternativeSelectionResult>({
          selector: listenerDetails.selector,
          value: listenerDetails.value,
          fragment: listenerDetails.fragment,
          accept: listenerDetails.accept,
          store: this,
        } as Parameters<typeof getSelection>[0]);

        const cleanup = this.#makeCleanupFn(key, details);

        for (const dependency of details.dependencies) {
          let depSet = this.#dependencies.get(dependency);

          if (depSet == null) {
            depSet = new Set([key]);

            this.#dependencies.set(dependency, depSet);
          } else {
            depSet.add(key);
          }
        }

        listenerDetails.cleanup = cleanup;
        listenerDetails.listener(details);
      }
    }

    #handleJSONLD({
      iri,
      res,
      output,
    }: {
      iri: string;
      res: Response;
      output: JSONLDHandlerResult,
    }): void {
      const iris = [iri];

      if (res.ok) {
        this.#primary.set(iri, {
          type: 'entity-success',
          iri,
          loading: false,
          ok: true,
          value: output.jsonld,
          headers: res.headers,
          isProblem: false,
        })
      } else {
        const reason = new HTTPFailure(res.status, res);

        this.#primary.set(iri, {
          type: 'entity-failure',
          iri,
          loading: false,
          ok: false,
          value: output.jsonld,
          status: res.status,
          isProblem: false,
          headers: res.headers,
          reason,
        });
      }

      for (const entity of flattenIRIObjects(output.jsonld)) {
        if (iris.includes(entity['@id'])) {
          continue;
        }

        this.#primary.set(entity['@id'], {
          type: 'entity-success',
          iri: entity['@id'],
          loading: false,
          ok: true,
          value: entity,
          isProblem: false,
        });
      }

      for (const iri of iris) {
        this.#publish(iri);
      }
    }

    async handleResponse(
      res: Response,
      iri: string = res.url.toString(),
    ) {
      const contentType = res.headers.get('content-type')?.split?.(';')?.[0];

      if (contentType == null) {
        throw new Error('Content type not specified in response');
      }

      const handler = this.#handlers.get(contentType);

      if (handler == null) {
        const integration = new UnrecognizedIntegration({
          iri,
          contentType,
        });

        let integrations = this.#integrations.get(contentType);

        if (integrations == null) {
          integrations = new Map();

          this.#integrations.set(contentType, integrations);
        }

        integrations.set(iri, integration);
      } else if (handler.integrationType === 'jsonld') {
        const output = await handler.handler({
          res,
          store: this,
        });

        this.#handleJSONLD({
          iri,
          res,
          output,
        });
      } else if (handler.integrationType === 'problem-details') {
        const output = await handler.handler({
          res,
          store: this,
        });

        this.#primary.set(iri, {
          type: 'entity-failure',
          iri,
          loading: false,
          ok: false,
          value: output,
          status: res.status,
          isProblem: true,
          reason: new HTTPFailure(res.status, res),
          headers: res.headers,
        });
      } else if (handler.integrationType === 'html-fragments') {
        const output = await handler.handler({
          res,
          store: this,
        });
        let integrations = this.#integrations.get(contentType);

        if (integrations == null) {
          integrations = new Map();

          this.#integrations.set(contentType, integrations);
        }

        integrations.set(iri, new HTMLFragmentsIntegration(handler, {
          iri,
          contentType,
          output,
        }));
      }

      if (handler?.integrationType !== 'jsonld') {
        this.#publish(iri, contentType);
      }
    }

    async #callFetcher(iri: string, args: {
      method?: string;
      accept?: string;
      body?: string;
      contentType?: string;
      mainEntity?: boolean;
    } = {}): Promise<void> {
      let headers: Headers;
      const url = new URL(iri);

      url.hash = '';

      const method = args.method || 'get';
      const accept = args.accept ?? this.#headers.get('accept') ?? defaultAccept;
      const entity = this.entity(iri, accept);
      const etag = entity?.headers?.get('Etag');
      const dispatchURL = url.toString();
      const loadingKey = this.#getLoadingKey(dispatchURL, method, args.accept);

      if (url.origin === this.#rootOrigin) {
        headers = new Headers(this.#headers);
      } else if (this.#origins.has(url.origin)) {
        headers = new Headers(this.#origins.get(url.origin));
      } else {
        throw new Error('Unconfigured origin');
      }
    
      headers.set('accept', accept);

      if (args.body != null && args.contentType != null) {
        headers.set('content-type', args.contentType);
      }

      if (method === 'GET' && etag != null) {
        headers.set('If-None-Match', etag);
      } else if (method === 'HEAD' && etag != null) {
        headers.set('If-None-Match', etag);
      }

      this.#loading.add(loadingKey);

      mithrilRedraw();

      // This promise wrapping is so SSR can hook in and await the promise.
      const promise = new Promise<Response>((resolve) => {
        (async () => {
          let res: Response;

          if (this.#fetcher != null) {
            res = await this.#fetcher(dispatchURL, {
              method,
              headers,
              body: args.body,
            });
          } else {
            res = await fetch(dispatchURL, {
              method,
              headers,
              body: args.body,
            });
          }

          if (args?.mainEntity &&
              !isBrowserRender &&
              (this.#httpStatus == null || this.#httpStatus < 400) &&
              !res.status.toString().startsWith('3')
          ) {
            // if SSR store the first 400+ status for the final HTTP response
            this.#httpStatus = res.status;
          }

          if (args.accept != null && this.#acceptMap.has(dispatchURL)) {
            this.#acceptMap
              .get(dispatchURL)?.set(args.accept, res.headers.get('content-type') as string);
          } else if (args.accept != null) {
            this.#acceptMap.set(dispatchURL, new Map([[args.accept, res.headers.get('content-type') as string]]));
          }

          await this.handleResponse(res, iri);

          this.#loading.delete(loadingKey);

          mithrilRedraw();

          resolve(res);
        })();
      });

      if (this.#responseHook != null) {
        this.#responseHook(promise);
      }

      await promise;
    }

    public subscribe({
      key,
      selector,
      fragment,
      accept,
      value,
      listener,
      mainEntity,
    }: {
      key: symbol;
      selector: string;
      fragment?: string;
      accept?: string;
      value?: JSONObject;
      listener: SelectionListener;
      mainEntity?: boolean;
    }) {
      const details = getSelection<ReadonlySelectionResult>({
        selector,
        fragment,
        accept,
        value,
        store: this,
      });
      const cleanup = this.#makeCleanupFn(key, details);

      for (const dependency of details.dependencies) {
        const depSet = this.#dependencies.get(dependency);

        if (depSet == null) {
          this.#dependencies.set(dependency, new Set([key]));
        } else {
          depSet.add(key);
        }
      }

      this.#listeners.set(key, {
        key,
        selector,
        value,
        fragment,
        accept,
        required: details.required,
        dependencies: details.dependencies,
        listener,
        cleanup,
      });

      // If this is the main entity and the details has
      // missing deps simulate a 404 if no other bad
      // status code has been set
      if (!isBrowserRender &&
          mainEntity &&
          details.hasMissing &&
          this.#httpStatus < 400
      ) {
        this.#httpStatus = 404;
      }

      return details;
    }

    public unsubscribe(key: symbol) {
      this.#listeners.get(key)?.cleanup();
    }

    public async fetch(iri: string | URL, accept?: string, {
      mainEntity,
    }: FetchArgs = {}): Promise<SuccessEntityState | FailureEntityState> {
      await this.#callFetcher(iri.toString(), { accept, mainEntity });

      return this.#primary.get(iri.toString()) as SuccessEntityState | FailureEntityState;
    }

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
    public async submit(iri: string, args: SubmitArgs): Promise<SuccessEntityState | FailureEntityState> {
      await this.#callFetcher(iri, {
        ...args,
        contentType: 'application/ld+json',
      });

      return this.entity(iri) as SuccessEntityState | FailureEntityState;
    }

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
    static fromInitialState({
      disableLogs,
      rootIRI,
      vocab,
      aliases,
      headers,
      origins,
      handlers = [],
    }: {
      disableLogs?: boolean;
      rootIRI: string;
      vocab?: string;
      aliases?: Record<string, string>;
      headers?: Record<string, string>;
      origins?: Record<string, Record<string, string>>;
      handlers?: Handler[];
    }): Store {
      performance.mark('octiron:from-initial-state:start')
      const storeArgs = {
        rootIRI,
        vocab,
        aliases,
        handlers,
        headers,
        origins,
      };

      try {
        const el = document.getElementById('oct-state') as HTMLScriptElement;

        if (el == null) {
          if (!disableLogs) {
            console.warn('Failed to construct Octiron state from initial state');
          }

          return new Store(storeArgs);
        }

        const stateInfo = JSON.parse(el.innerText) as StateInfo;
        const alternatives: AlternativesState = new Map();
        const handlersMap: Record<string, Handler> = handlers.reduce((acc, handler) => ({
          ...acc,
          [handler.contentType]: handler,
        }), {});

        for (const [integrationType, entities] of Object.entries(stateInfo.alternatives)) {
          for (const stateInfo of entities) {
            const handler = handlersMap[stateInfo.contentType];
            const cls = integrationClasses[integrationType as IntegrationType];

            if (cls === null || cls.type !== handler?.integrationType) {
              continue;
            }

            const state = cls.fromInitialState(stateInfo, handler);

            if (state == null) {
              continue;
            }

            let integrations = alternatives.get(state.contentType);

            if (integrations == null) {
              integrations = new Map();

              alternatives.set(state.contentType, integrations);
            }

            integrations.set(state.iri, state);
          }
        }

        const store = new Store({
          ...storeArgs,
          alternatives,
          primary: stateInfo.primary,
          acceptMap: stateInfo.acceptMap,
        });
        performance.mark('octiron:from-initial-state:end')
        performance.measure('octiron:from-initial-state:duration', 'octiron:from-initial-state:start', 'octiron:from-initial-state:end');

        return store;
      } catch (err) {
        if (!disableLogs) {
          console.warn('Failed to construct Octiron state from initial state');
          console.error(err)
        }

        const store = new Store(storeArgs);
        performance.mark('octiron:from-initial-state:end')
        performance.measure('octiron:from-initial-state:duration', 'octiron:from-initial-state:start', 'octiron:from-initial-state:end');
        return store;
      }
    }

    /**
     * Writes the Octiron store's state to a string to be embedded
     * near the end of a HTML document. Ideally this is placed before
     * the closing of the document's body tag. Octiron uses ids prefixed
     * with `oct-`, avoid using these ids to prevent id collision.
     */
    public toInitialState(): string {
      let html = '';
      const stateInfo: StateInfo = {
        primary: Object.fromEntries(this.#primary),
        alternatives: {},
        acceptMap: {},
      };

      for (const [accept, map] of this.#acceptMap.entries()) {
        stateInfo.acceptMap[accept] = Array.from(map.entries());
      }

      for (const alternative of this.#integrations.values()) {
        for (const integration of alternative.values()) {
          if (stateInfo.alternatives[integration.integrationType] == null) {
            stateInfo.alternatives[integration.integrationType] = [
              integration.getStateInfo(),
            ];
          } else {
            stateInfo.alternatives[integration.integrationType].push(integration.getStateInfo());
          }

          if (integration.toInitialState != null) 
            html += integration.toInitialState();
        }
      }

      html += `<script id="oct-state" type="application/json">${JSON.stringify(stateInfo)}</script>`

      return html;
    }

}
