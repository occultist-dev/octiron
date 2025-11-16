import type { Children, ComponentTypes } from 'mithril';
import type { JSONObject, JSONValue, SCMPropertyValueSpecification } from './common.ts';
import type { Store } from '../store.ts';
import type { Octiron } from "./octiron.ts";
import type { HTMLFragmentsIntegration } from '../alternatives/htmlFragments.ts';


export type Aliases = Record<string, string>;
export type Origins = Record<string, Headers>;
export type Context = {
  '@vocab'?: string;
} & {
  [vocab: string]: string;
};

export type IntegrationType =
  // | 'jsonld'
  // | 'problem-details'
  | 'html'
  | 'html-fragments'
;

export type HandlerArgs = {
  res: Response;
  store: Store;
};

export type RequestHandler<T extends Record<string, JSONValue>> = (args: HandlerArgs) => Promise<T> | T;

export type JSONLDContentTypeResult = {
  value: JSONObject;
};

export type JSONLDHandlerResult = {
  jsonld: JSONObject;
};

export type JSONLDHandler = {
  integrationType: 'jsonld';
  contentType: string;
  handler: RequestHandler<JSONLDHandlerResult>;
};

export type ProblemDetailsHandlerResult = {
  problemDetails: JSONObject;
};

export type ProblemDetailsHandler = {
  integrationType: 'problem-details';
  contentType: string;
  handler: RequestHandler<ProblemDetailsHandlerResult>;
};

export type HTMLHandlerResult = {
  id?: string;
  selector?: string;
  html: string;
};
export type FragmentListener = (fragment: string) => void;
export type AddFragmentListener = (listener: FragmentListener) => void;
export type HTMLCleanupFn = () => void;
export type HTMLOnCreateArgs = {
  o: Octiron;
  dom: Element;
  fragment?: string;
  addFragmentListener: AddFragmentListener;
};
export type HTMLOnCreate = (args: HTMLOnCreateArgs) => HTMLCleanupFn;
export type HTMLHandler = {
  integrationType: 'html';
  contentType: string;
  handler: RequestHandler<HTMLHandlerResult>;
  onCreate?: HTMLOnCreate;
};

export type HTMLFragment = {
  id: string;
  type: 'embed' | 'bare' | 'text' | 'range';
  html?: string;
  dom?: DocumentFragment;
  selector: string;
};

export type HTMLFragmentsHandlerResult = {
  root?: string;
  dom?: DocumentFragment;
  selector?: string;
  fragments: Record<string, HTMLFragment>;
  templates: Record<string, string>;
};

export type HTMLFragmentsCleanupFn = () => void;
export type HTMLFragmentsOnCreateArgs = {
  o: Octiron;
  dom: Element;
  fragment?: string;
};
export type HTMLFragmentsOnCreate = (args: HTMLFragmentsOnCreateArgs) => HTMLFragmentsCleanupFn;

export type HTMLFragmentsHandler = {
  integrationType: 'html-fragments';
  contentType: string;
  handler: RequestHandler<HTMLFragmentsHandlerResult<string>>;
  onCreate?: HTMLFragmentsOnCreate;
}

export type Handler =
  | JSONLDHandler
  | ProblemDetailsHandler
  | HTMLHandler
  | HTMLFragmentsHandler
;

export type FetcherArgs = {
  method?: string;
  body?: string;
  headers?: Headers;
};

export type Fetcher = (iri: string, args: FetcherArgs) => Promise<Response>;

export type ResponseHook = (res: Promise<Response>) => void;

export type HTTPErrorView = (status: number) => Children;

export type ContentParsingView = (error: Error) => Children;

export type AlternativeContentProps = {
  o: Octiron;
  fragment?: string;
};

export type AlternativeContentComponent = ComponentTypes<AlternativeContentProps>;

export interface Failure {

  /**
   * Returns the given children if the error is
   * of the undefined variety.
   */
  undefined(children: Children): Children;

  /**
   * Returns the given children if the error is
   * of the http variety.
   */
  http(children: Children): Children;

  /**
   * Returns the given children if the error is
   * of the http variety.
   */
  http(view: HTTPErrorView): Children;

  /**
   * Returns the given children if the error is
   * of the content parsing variety.
   */
  unparserable(children: Children): Children;

  /**
   * Returns the given chidlren if the error is
   * of the content parsing variety.
   */
  unparserable(view: ContentParsingView): Children;
}

export type EntitySelectionResult = {

  /**
   * A unique key for identifying this selection result.
   * Useful for caching objects which use the result.
   */
  readonly key: symbol;

  /**
   * A json pointer referencing the item within the parent value.
   */
  readonly pointer: string;

  /**
   * The type of the selection result. Value 'entity' indicates
   * the value has an iri and can be fetched. The value `value`
   * indicates the value is found in the body of an entity.
   */
  readonly type: 'entity';

  /**
   * The IRI of the entity.
   */
  readonly iri: string;

  /**
   * The fragment portion of the URL.
   */
  readonly fragment?: string;

  /**
   * Indicates if the request responded with a success or error status.
   */
  readonly ok: boolean;

  /**
   * The response status. Only used for failure responses.
   */
  readonly status?: number;

  /**
   * The current value of the entity.
   */
  readonly value?: JSONObject;

  /**
   * The error type.
   */
  readonly reason?: Failure;

  /**
   * The accept header to use when performing API requests for this entity.
   */
  readonly accept?: string;

  /**
   * The integration used to work with this content.
   */
  readonly integration?: HTMLFragmentsIntegration;
};

export type ValueSelectionResult = {

  /**
   * A unique key for identifing this selection result.
   * Useful for caching objects which use the result.
   */
  readonly key: symbol;

  /**
   * A json pointer referencing the item within the parent value.
   */
  readonly pointer: string;

  /**
   * The type of the selection result. Value 'entity' indicates
   * the value has an iri and can be fetched. The value `value`
   * indicates the value is found in the body of an entity.
   */
  readonly type: 'value';

  /**
   * The object key (type, or term in json-ld lingo) used when
   * retrieving this value from the parent object.
   */
  readonly propType?: string;

  /**
   * The selection value.
   */
  readonly value: JSONValue;

  readonly fragment?: undefined;

  /**
   * The accept header to use when performing API requests for this entity.
   */
  readonly accept?: undefined;


  readonly integration?: undefined;
};

export type ActionSelectionResult = {

  /**
   * A unique json pointer for identifing this selection result.
   * Useful for caching objects and performing updates on it's value.
   */
  readonly pointer: string;

  /**
   * The type of the selection result. Value 'entity' indicates
   * the value has an iri and can be fetched. The value `value`
   * indicates the value is found in the body of an entity.
   */
  readonly type: 'action-value';

  /**
   * The object key (type, or term in json-ld lingo) used when
   * retrieving this value from the parent object.
   */
  readonly propType: string;

  /**
   * The selection value.
   */
  readonly value: JSONValue;

  /**
   * The point on the action definition describing the value.
   */
  readonly actionValue?: JSONValue;

  /**
   * An action selection can be readonly if the selected spec
   * has readonly set to true. Or if the payload has entities
   * or unspecifed values on it which the selection selects into.
   */
  readonly readonly: boolean;

  /**
   * The spec related to the value.
   *
   * This can be null if the payload has entities or unspecifed
   * values on it which the selection selects into.
   */
  readonly spec?: SCMPropertyValueSpecification;

  readonly fragment?: undefined;

  /**
   * The accept header to use when performing API requests for this entity.
   */
  readonly accept?: undefined;

  readonly integration?: undefined;
}

export type AlternativeSelectionResult = {
  readonly key: symbol;

  readonly pointer: string;

  readonly type: 'alternative';

  readonly propType?: undefined;

  readonly value?: undefined;

  readonly contentType: string;

  /**
   * The accept header to use when performing API requests for this entity.
   */
  readonly accept?: string;

  readonly integration: IntegrationState;
};

export type ReadonlySelectionResult =
  | EntitySelectionResult
  | ValueSelectionResult
  | AlternativeSelectionResult
;

export type SelectionResult =
  | EntitySelectionResult
  | ValueSelectionResult
  | ActionSelectionResult
  | AlternativeSelectionResult
;

export type SelectionDetails<T = SelectionResult> = {
  selector: string;
  /**
   * True if the selection does not require fetching any depencencies.
   * A selection can be complete while having errors.
   */
  complete: boolean;

  /**
   * True if any entities the selection traverses are in an error state.
   */
  hasErrors: boolean;

  /**
   * True if any selections are not defined in the data.
   */
  hasMissing: boolean;

  /**
   * The result of the selection.
   */
  result: Array<Readonly<T>>;

  /**
   * List of IRIs which are yet to be loaded which this result set requires.
   */
  required: string[];

  /**
   * A list of IRIs which this selection depends on.
   * If the state of any of the dependencies changes the selection result should
   * be considered stale.
   */
  dependencies: string[];
};

export type ActionSelectionDetails = SelectionDetails<SelectionResult>;

export type LoadingEntityState = {
  readonly type: 'entity-loading';
  
  /**
   * True if this entity has an in progress request.
   */
  readonly loading: true;

  /**
   * Indicates if the request responded with a success or error status.
   */
  readonly ok?: undefined;

  /**
   * The IRI of the entity.
   */
  readonly iri: string;

  /**
   * The current value of the entity.
   */
  readonly value?: undefined;

  /**
   * The response status. Only used for failure responses.
   */
  readonly status?: undefined;

  /**
   * The content type of the response.
   */
  readonly contentType?: undefined;

  /**
   * Component to render if the returned content type is
   * not jsonld or problem detail types.
   */
  readonly integration?: undefined;
};

export type SuccessEntityState = {
  readonly type: 'entity-success';
  /**
   * True if this entity has an in progress request.
   */
  readonly loading: false;

  /**
   * Indicates if the request responded with a success or error status.
   */
  readonly ok: true;

  /**
   * The IRI of the entity.
   */
  readonly iri: string;

  /**
   * The current value of the entity.
   */
  readonly value: JSONObject;

  /**
   * The response status. Only used for failure responses.
   */
  readonly status?: undefined;
  
  /**
   * Component to render if the returned content type is
   * not jsonld or problem detail types.
   */
  readonly integration?: undefined;
};

export type SuccessAlternativeState = {
  readonly type: 'alternative-success';
  /**
   * True if this entity has an in progress request.
   */
  readonly loading: false;

  /**
   * Indicates if the request responded with a success or error status.
   */
  readonly ok: true;

  /**
   * The IRI of the entity.
   */
  readonly iri: string;

  /**
   * The current value of the entity.
   */
  readonly value?: undefined;

  /**
   * The response status. Only used for failure responses.
   */
  readonly status?: undefined;
  
  /**
   * Component to render if the returned content type is
   * not jsonld or problem detail types.
   */
  readonly integration: IntegrationState;
};

export type FailureEntityState = {
  readonly type: 'entity-failure';
  /**
   * True if this entity has an in progress request.
   */
  readonly loading: false;

  /**
   * Indicates if the request responded with a success or error status.
   */
  readonly ok: false;

  /**
   * The IRI of the entity.
   */
  readonly iri: string;

  /**
   * The current value of the entity.
   */
  readonly value?: JSONObject;

  /**
   * The response status. Only used for failure responses.
   */
  readonly status: number;

  /**
   * An object describing the reason and source of the failure.
   */
  readonly reason: Failure;

  /**
   * Component to render if the returned content type is
   * not jsonld or problem detail types.
   */
  readonly integration?: undefined;
};

export type LoadingResult = {
  contentType: string;
}

export type EntityState =
  | LoadingEntityState
  | SuccessEntityState
  | SuccessAlternativeState
  | FailureEntityState;
;

export type IntegrationStateInfo = {
  contentType: string;
  [key: string]: JSONValue;
};

export type AlternativeAttrs = {
  fragment?: string;
};


export interface IntegrationState {
  iri: string;
  integrationType: IntegrationType;
  contentType: string;
  getStateInfo(): IntegrationStateInfo;
  toInitialState(): string;
  render(o: Octiron, fragment?: string): Children;
  text(iri: string): string | undefined;
};

export type PrimaryState = Map<string, EntityState>;
export type AlternativesState = Map<string, Map<string, IntegrationState>>;

export type Method =
  | string
  | 'get'
  | 'query'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete'
;

export type SubmitArgs = {
  /**
   * The http method of the request.
   */
  method?: Method;

  /**
   * The content type header value.
   */
  contentType?: string;

  /**
   * The encoding type header value.
   */
  encodingType?: string;

  /**
   * The body of the request.
   */
  body?: string;
};

/**
 * A function which receives updates to an Octiron store selection.
 *
 * @param {SelectionDetails} details         The details of the selection update.
 * @param {boolean} details.complete         True if the selection does not require fetching
 *                                           any depencencies. A selection can be complete
 *                                           while having errors.
 * @param {boolean} details.hasErrors        True if any entities the selection traverses
 *                                           are in an error state.
 * @param {SelectionResult[]} details.result The result of the selection.
 * @param {string[]} details.required        List of IRIs which are yet to be loaded which
 *                                           this result set requires.
 * @param {string[]} details.dependencies    A list of IRIs which this selection depends on.
 */
export type SelectionListener = (details: Readonly<SelectionDetails<ReadonlySelectionResult>>) => void;

export type SubscribeArgs = {
  /**
   * Unique symbol used to identify the subsciber.
   */
  key: symbol;

  /**
   * Selector string.
   */
  selector: string;

  /**
   * Value to being the selection from. If left undefined
   * the selection is assumed to begin with an iri to an
   * entity.
   */
  value?: JSONObject;

  /**
   * Function which will receive selection updates.
   */
  listener: SelectionListener;
};
