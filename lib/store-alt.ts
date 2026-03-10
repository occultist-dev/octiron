import {ElementHandler, ElementIntegration, ElementIntegrationType} from "./alternatives/element";
import {FragmentsHandler, FragmentsIntegration, FragmentsIntegrationType} from "./alternatives/fragments";
import {UnrecognisedIntegration, UnrecognisedIntegrationType} from "./alternatives/unrecognised";
import {Aliases, Context, EntityState, FailureEntityState, IntegrationState, JSONLDHandler, JSONObject, ProblemDetailsHandler, ReadonlySelectionResult, SelectionDetails, SelectionListener, SuccessEntityState} from "./octiron";
import {getSelection} from './utils/getSelection.ts';


export const integrations = {
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

/**
 * The alternative integrations use the alternative
 * store.
 */
export type Alternative =
  | UnrecognisedIntegrationType
  | ElementIntegrationType
  | FragmentsIntegrationType
;

export type ResourceVaryArgs = {
  method?: string;
  accept?: string;
  locale?: string;
  fragment?: string;
};

function makeAcceptKey(iri: string | URL, args: ResourceVaryArgs): string {
  const url = new URL(iri).toString();
  const method = args?.method?.toLowerCase() ?? 'get';
  const accept = args?.accept ?? '';

  return `${method}|${url}|${accept}`;
}

function makeKeys(iri: string | URL, args: ResourceVaryArgs): [
  entityKey: string,
  acceptKey: string,
  normalizedURL: string,
] {
  const url = new URL(iri).toString();
  const method = args?.method?.toLowerCase() ?? 'get';
  const accept = args?.accept ?? '';
  const entityKey = `${method}|${url}`;

  return [
    entityKey,
    `${entityKey}|${accept}`,
    url,
  ];
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

export type StoreFactoryArgs = {

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


  acceptMap?: Record<string, Array<[string, string]>>;

  /**
   * Primary representations initial state.
   */
  primary?: Record<string, EntityState>;

  /**
   * Alternatives representations initial state.
   */
  alternatives?: AlternativesState;

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

type PrimaryCache = Map<string, EntityState>;
type AlternativesCache = Map<string, IntegrationState>;

export function Store(args: StoreFactoryArgs): Readonly<StoreType> {
  let status: number;
  const root = args.root;
  const vocab = args.vocab;
  const aliases: Record<string, string> = Object.create(null);
  const context: Context = Object.create(null);
  const termExpansions = new Map<string, string>();

  /**
   * The primary cache.
   */
  const primary = new Map<string, EntityState>();

  /**
   * The alternative cache.
   */
  const alternative = new Map<string, Map<string, IntegrationState>>();

  // Set of accept keys which currently have requests inflight.
  const inflight = new Set<string>();

  // Maps the accept key to the resolved content type
  // of the last response for that representation.
  const acceptMap = new Map<string, string>();

  // Content types that are used in the primary store.
  // Typically this will be JSONLD compat types and
  // problem detail types.
  const primaryContentTypes = new Set<string>();

  if (vocab != null) {
    context['@vocab'] = vocab;
  }

  if (args.aliases != null) {
    for (const [key, value] of Object.entries(args.aliases)) {
      aliases[key] = value;
      context[key] = value;
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
      return inflight.has(makeAcceptKey(iri, args));
    },
    entity(this: StoreType, iri, args) {
      const [
        entityKey,
        acceptKey,
        normalizedURL,
      ] = makeKeys(iri, args);
      
      if (inflight.has(acceptKey)) {
        return {
          type: 'entity-loading',
          iri: normalizedURL,
          loading: true,
          isProblem: false,
        };
      }

      const contentType = acceptMap.get(acceptKey);

      if (contentType == null) {
        return;
      } else if (primaryContentTypes.has(contentType)) {
        return primary.get(entityKey);
      }

      const integration = alternative.get(contentType)?.get(entityKey);

      if (integration == null) return;
      
      return {
        type: 'alternative-success',
        iri: normalizedURL,
        fragment: args?.fragment,
        loading: false,
        ok: true,
        contentType,
        isProblem: false,
        integration,
      };
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
  };

  return Object.freeze(store);
}

