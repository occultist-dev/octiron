declare module "types/common" {
    export type Mutable<T> = {
        -readonly [K in keyof T]: T[K];
    };
    export type EmptyObject = {};
    export type JSONPrimitive = string | number | boolean | null | undefined;
    export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
    export type JSONObject = {
        [member: string]: JSONValue;
    };
    export interface JSONArray extends Array<JSONValue> {
    }
    export type IRIObject<Properties extends JSONObject = JSONObject> = Properties & {
        '@id': string;
    };
    export type TypeObject<Properties extends JSONObject = JSONObject> = Properties & {
        '@type': string | string[];
    };
    export type ValueObject<Properties extends JSONObject = JSONObject> = Properties & {
        '@value': JSONValue;
    };
    export type IterableJSONLD<Properties extends JSONObject = JSONObject> = JSONArray | (Properties & {
        '@list': JSONArray;
    }) | (Properties & {
        '@set': JSONArray;
    });
    export type SCMEntryPoint = {
        contentType: string;
        encodingType?: string;
        httpMethod: string;
        urlTemplate: string;
    };
    export type SCMAction = JSONObject & {
        target: string | SCMEntryPoint;
    };
    export type SCMPropertyValueSpecification = {
        readonlyValue: boolean;
        valueName?: string;
        valueRequired: boolean;
        defaultValue?: JSONValue;
        minValue?: JSONPrimitive;
        maxValue?: JSONPrimitive;
        stepValue?: number;
        valuePattern?: string;
        multipleValues?: boolean;
        valueMinLength?: number;
        valueMaxLength?: number;
    };
}
declare module "consts" {
    export const isBrowserRender: boolean;
}
declare module "alternatives/htmlFragments" {
    import m from 'mithril';
    import type { HTMLFragmentsHandler, HTMLFragmentsHandlerResult, IntegrationState } from "types/store";
    import type { Octiron } from "types/octiron";
    export type HTMLFragmentsIntegrationComponentAttrs = {
        o: Octiron;
        integration: HTMLFragmentsIntegration;
        fragment?: string;
        output: HTMLFragmentsHandlerResult;
    };
    export type HTMLFragmentsIntegrationComponentType = m.ComponentTypes<HTMLFragmentsIntegrationComponentAttrs>;
    export const HTMLFragmentsIntegrationComponent: HTMLFragmentsIntegrationComponentType;
    export type HTMLFragmentsIntegrationArgs = {
        iri: string;
        contentType: string;
        output: HTMLFragmentsHandlerResult;
    };
    export type FragmentState = {
        type: 'embed' | 'bare' | 'range';
        id: string;
        rendered: boolean;
        selector: string;
    };
    type HTMLFragmentsStateInfo = {
        iri: string;
        contentType: string;
        rendered?: boolean;
        selector?: string;
        fragments: FragmentState[];
        texts: Record<string, string>;
        templates: Record<string, string>;
    };
    export class HTMLFragmentsIntegration implements IntegrationState {
        #private;
        static type: "html-fragments";
        readonly integrationType: "html-fragments";
        constructor(handler: HTMLFragmentsHandler, { iri, contentType, output, }: HTMLFragmentsIntegrationArgs);
        get iri(): string;
        get contentType(): string;
        get output(): HTMLFragmentsHandlerResult;
        getFragment(fragment?: string): string | Node | null;
        /**
         * Returns a text representaion of a fragment.
         */
        text(fragment?: string): string | undefined;
        render(o: Octiron, fragment?: string): any;
        getStateInfo(): HTMLFragmentsStateInfo;
        toInitialState(): string;
        static fromInitialState(handler: HTMLFragmentsHandler, { iri, contentType, rendered, selector, texts, fragments, templates, }: HTMLFragmentsStateInfo): HTMLFragmentsIntegration | null;
    }
}
declare module "types/store" {
    import type { Children, ComponentTypes } from 'mithril';
    import type { JSONObject, JSONValue, SCMPropertyValueSpecification } from "types/common";
    import type { Store } from "store";
    import type { Octiron } from "types/octiron";
    import type { HTMLFragmentsIntegration } from "alternatives/htmlFragments";
    export type Aliases = Record<string, string>;
    export type Origins = Record<string, Headers>;
    export type Context = {
        '@vocab'?: string;
    } & {
        [vocab: string]: string;
    };
    export type IntegrationType = 'html' | 'html-fragments';
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
        dom?: Element[];
        selector: string;
    };
    export type HTMLFragmentsHandlerResult = {
        root?: string;
        dom?: Element[];
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
    };
    export type Handler = JSONLDHandler | ProblemDetailsHandler | HTMLHandler | HTMLFragmentsHandler;
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
    };
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
    export type ReadonlySelectionResult = EntitySelectionResult | ValueSelectionResult | AlternativeSelectionResult;
    export type SelectionResult = EntitySelectionResult | ValueSelectionResult | ActionSelectionResult | AlternativeSelectionResult;
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
    };
    export type EntityState = LoadingEntityState | SuccessEntityState | SuccessAlternativeState | FailureEntityState;
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
    }
    export type PrimaryState = Map<string, EntityState>;
    export type AlternativesState = Map<string, Map<string, IntegrationState>>;
    export type Method = string | 'get' | 'query' | 'post' | 'put' | 'patch' | 'delete';
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
}
declare module "failures" {
    import type { Children } from 'mithril';
    import type { Failure, HTTPErrorView, ContentParsingView } from "types/store";
    export class UndefinedFailure implements Failure {
        undefined(children: Children): Children;
        http(children: Children): Children;
        http(view: HTTPErrorView): Children;
        unparserable(children: Children): Children;
        unparserable(view: ContentParsingView): Children;
    }
    export class HTTPFailure implements Failure {
        #private;
        constructor(status: number, res: Response);
        get status(): number;
        get res(): Response;
        undefined(): Children;
        http(children: Children): Children;
        http(view: HTTPErrorView): Children;
        unparserable(children: Children): Children;
        unparserable(view: ContentParsingView): Children;
    }
    export class ContentHandlingFailure implements Failure {
        #private;
        constructor(error: Error);
        get error(): Error;
        undefined(): Children;
        http(children: Children): Children;
        http(view: HTTPErrorView): Children;
        unparserable(children: Children): Children;
        unparserable(view: ContentParsingView): Children;
    }
}
declare module "utils/getIterableValue" {
    import type { IterableJSONLD, JSONArray } from "types/common";
    /**
     * @description
     * Returns true if a json-ld value is an array or has an iterable value,
     * i.e.: an object with an `@list` or `@set` array value.
     *
     * This function returns an empty array in the cases where a non-iterable value
     * is given.
     *
     * @param {JSONValue} value - A json-ld value
     */
    export function getIterableValue(value: IterableJSONLD): JSONArray;
}
declare module "utils/isJSONObject" {
    import type { JSONObject, JSONValue } from "types/common";
    /**
     * @description
     * Returns true if the input value is an object.
     *
     * @param value Any value which should come from a JSON source.
     */
    export function isJSONObject(value: JSONValue): value is JSONObject;
}
declare module "utils/isIRIObject" {
    import type { IRIObject, JSONObject, JSONValue } from "types/common";
    /**
     * @description
     * Returns true if the given value is a JSON object with a JSON-ld @id value.
     *
     * @param value Any value which should come from a JSON source.
     */
    export function isIRIObject<Properties extends JSONObject = JSONObject>(value: JSONValue): value is IRIObject<Properties>;
}
declare module "utils/isIterable" {
    import type { IterableJSONLD, JSONValue } from "types/common";
    /**
     * @description
     * Returns true if a json-ld value is an array or has an iterable value,
     * i.e.: an object with an `@list` or `@set` array value.
     *
     * @param {JSONValue} value - A json-ld value
     */
    export function isIterable(value: JSONValue): value is IterableJSONLD;
}
declare module "utils/isMetadataObject" {
    import type { IRIObject, JSONObject } from "types/common";
    /**
     * @description
     * Some JSON-ld objects contain special JSON-ld values, such as @type which
     * can inform the software on what to expect when retrieving the object but
     * otherwise require fetching an entity from an endpoint to get the values
     * they relate to. For Octiron's purposes these are considered metadata objects.
     *
     * Objects containing `@value`, `@list`, `@set` are not considered metadata
     * objects as these properties references concrete values.
     *
     * @param value - The JSON object to check for non special properties in.
     */
    export function isMetadataObject(value: JSONObject): value is IRIObject;
}
declare module "utils/isValueObject" {
    import type { JSONObject, ValueObject } from "types/common";
    /**
     * @description
     * A value object contains a `@value` value. Often this is used to provide
     * further information about the value like what `@type` it holds, allowing
     * filters to be applied to the referenced value.
     *
     * @param value - A JSON value.
     */
    export function isValueObject(value: JSONObject): value is ValueObject;
}
declare module "utils/flattenIRIObjects" {
    import type { IRIObject, JSONValue } from "types/common";
    /**
     * @description
     * Locates all IRI objects in a potentially deeply nested JSON-ld structure and
     * returns an array of the located IRI objects.
     *
     * Objects identified as IRI objects are not modified beyond being placed in
     * an array together.
     *
     * @param value - The value to flatten.
     * @param agg - An array to fill with the flattened IRI objects.
     *              This is required for the internal recursing performed by this
     *              function and isn't required by upstream callers.
     */
    export function flattenIRIObjects(value: JSONValue, agg?: IRIObject[]): IRIObject[];
}
declare module "utils/escapeJSONPointerParts" {
    /**
     * @description
     * Espects a list of json pointer parts and returns a json pointer.
     */
    export function escapeJSONPointerParts(...parts: string[]): string;
}
declare module "utils/parseSelectorString" {
    import type { Store } from "store";
    export type SelectorObject = {
        fragment?: string;
        filter?: string;
    };
    /**
     * @description
     * Parses a selector string producing a selector list
     * The subject value of a selector could be an iri or a type depending on the
     * outer context.
     *
     * @param selector - The selector string to parse.
     */
    export function parseSelectorString(selector: string, store: Store): SelectorObject[];
}
declare module "utils/resolvePropertyValueSpecification" {
    import type { Store } from "store";
    import type { JSONObject } from "types/common";
    import type { Spec } from "types/octiron";
    export function resolvePropertyValueSpecification({ spec, store, }: {
        spec: JSONObject;
        store: Store;
    }): Spec;
}
declare module "utils/isTypedObject" {
    import type { JSONObject, JSONValue, TypeObject } from "types/common";
    /**
     * @description
     * Returns true if the given value is a JSON object with a JSON-ld @type value.
     *
     * @param value Any value which should come from a JSON source.
     */
    export function isTypeObject<Properties extends JSONObject = JSONObject>(value: JSONValue): value is TypeObject<Properties>;
}
declare module "utils/getSelection" {
    import type { JSONObject, JSONValue } from "types/common";
    import type { ActionSelectionResult, AlternativeSelectionResult, EntitySelectionResult, SelectionDetails, SelectionResult, ValueSelectionResult } from "types/store";
    import type { Store } from "store";
    /**
     * A circular selection error occurs when two or more
     * entities contain no concrete values and their '@id'
     * values point to each other in a way that creates a
     * loop. The `getSelection` function will throw when
     * this scenario is detected to prevent an infinite
     * loop.
     */
    export class CircularSelectionError extends Error {
    }
    export type SelectorObject = {
        subject: string;
        filter?: string;
    };
    type ProcessingEntitySelectionResult = {
        keySource: string;
    } & Omit<EntitySelectionResult, 'key'>;
    type ProcessingValueSelectionResult = {
        keySource: string;
    } & Omit<ValueSelectionResult, 'key'>;
    type ProcessingActionSelectionResult = {
        keySource: string;
    } & Omit<ActionSelectionResult, 'key'>;
    type ProcessingAlternativeSelectionResult = {
        keySource: string;
    } & Omit<AlternativeSelectionResult, 'key'>;
    type ProcessingSelectionDetails = SelectionDetails<ProcessingEntitySelectionResult | ProcessingValueSelectionResult | ProcessingActionSelectionResult | ProcessingAlternativeSelectionResult>;
    export function transformProcessedDetails<T extends SelectionResult>(processing: ProcessingSelectionDetails): SelectionDetails<T>;
    /**
     * @description
     * Selects from the given context value and store state.
     *
     * If no `value` is provided the `selector` is assumed to begin with an iri
     * instead of a type. An entity will be selected from the store using the iri,
     * if it exists, to begin the selection.
     *
     * A type selector selects values from the context of a provided value
     * and will pull from the store if any iri objects are selected in the process.
     *
     * @param {string} args.selector            Selector string beginning with a type.
     * @param {string} [args.fragment]          A fragment if passed in as select args.
     * @param {JSONObject} [args.value]         Context object to begin the selection from.
     * @param {JSONObject} [args.actionValue]   The action, or point in the action definition which describes this value.
     * @param {JSONValue} [args.defaultValue]   A default value when used to select action values.
     * @param {Store} args.store                Octiron store to search using.
     * @returns {SelectionDetails}              Selection contained in a details object.
     */
    export function getSelection<T extends SelectionResult>({ selector: selectorStr, value, fragment, accept, actionValue, defaultValue, store, }: {
        selector: string;
        value?: JSONObject;
        fragment?: string;
        accept?: string;
        actionValue?: JSONObject;
        defaultValue?: JSONValue;
        store: Store;
    }): SelectionDetails<T>;
}
declare module "utils/mithrilRedraw" {
    /**
     * @description
     * Calls Mithril's redraw function if the window object exists.
     */
    export function mithrilRedraw(): void;
}
declare module "store" {
    import type { AlternativesState, Context, Fetcher, Handler, ReadonlySelectionResult, ResponseHook, SelectionDetails, SelectionListener, EntityState, SubmitArgs, Aliases } from "types/store";
    import type { JSONObject } from "types/common";
    import type { FailureEntityState, SuccessEntityState } from "types/store";
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
        /**
         * Map of JSON-ld aliases to their values.
         */
        aliases?: Record<string, string>;
        /**
         * Primary initial state.
         */
        primary?: Record<string, EntityState>;
        acceptMap?: Record<string, Array<[string, string]>>;
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
        #private;
        constructor(args: StoreArgs);
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
        subscribe({ key, selector, fragment, accept, value, listener, }: {
            key: symbol;
            selector: string;
            fragment?: string;
            accept?: string;
            value?: JSONObject;
            listener: SelectionListener;
        }): SelectionDetails<ReadonlySelectionResult>;
        unsubscribe(key: symbol): void;
        fetch(iri: string, accept?: string): Promise<SuccessEntityState | FailureEntityState>;
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
}
declare module "types/octiron" {
    import type { Attributes, Children, ComponentTypes } from 'mithril';
    import type { JSONObject, JSONPrimitive, JSONValue } from "types/common";
    import type { Store } from "store";
    import type { ContentHandlingFailure, HTTPFailure, UndefinedFailure } from "failures";
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
    export type PresentAttrs<Value extends JSONValue = JSONValue, Attrs extends BaseAttrs = BaseAttrs> = {
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
    export type OnChange<Value extends JSONValue = JSONValue> = (value: Value | null, args?: UpdateArgs) => void;
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
    export type EditAttrs<Value extends JSONValue = JSONValue, Attrs extends BaseAttrs = BaseAttrs> = {
        renderType: 'edit';
        o: OctironActionSelection;
        attrs: Attrs;
        value: Value;
        name: string;
        onchange: OnChange;
        onChange: OnChange;
        spec: Spec;
    };
    export type AnyAttrs<Value extends JSONValue = JSONValue, Attrs extends BaseAttrs = BaseAttrs> = {
        o: Octiron;
    } & (Omit<PresentAttrs<Value, Attrs>, 'o'> | Omit<EditAttrs<Value, Attrs>, 'o'>);
    export type PresentComponent<Value extends JSONValue = JSONValue, Attrs extends BaseAttrs = BaseAttrs> = ComponentTypes<PresentAttrs<Value, Attrs>>;
    export type EditComponent<Value extends JSONValue = JSONValue, Attrs extends BaseAttrs = BaseAttrs> = ComponentTypes<EditAttrs<Value, Attrs>>;
    export type AnyComponent<Value extends JSONValue = JSONValue, Attrs extends BaseAttrs = BaseAttrs> = ComponentTypes<AnyAttrs<Value, Attrs>>;
    export type TypeDef<Value extends JSONValue = JSONValue, Type extends string = string> = {
        type: Type;
        present?: PresentComponent<Value> | AnyComponent<Value>;
        edit?: EditComponent<Value> | AnyComponent<Value>;
    };
    export type TypeDefs<Type extends string = string, TypeDefList extends TypeDef<any, Type> = TypeDef<any, Type>> = {
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
    export type FallbackView = (o: OctironSelection, err: UndefinedFailure | HTTPFailure | ContentHandlingFailure) => Children;
    export type Fallback = FallbackView | Children;
    /**
     * Arguments for all methods which afford fetching entities.
     */
    export type FetchableArgs = {
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
    export type PresentableArgs<Attrs extends BaseAttrs = BaseAttrs> = {
        attrs?: Attrs;
        component?: PresentComponent<any, Attrs> | AnyComponent<any, Attrs>;
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
    export type OctironSelectArgs<Attrs extends BaseAttrs = BaseAttrs> = FetchableArgs & IterableArgs & PresentableArgs<Attrs>;
    export type OctironPresentArgs<Attrs extends BaseAttrs = BaseAttrs> = PresentableArgs<Attrs>;
    export type OctironPerformArgs<Attrs extends BaseAttrs = BaseAttrs> = FetchableArgs & IterableArgs & SubmittableArgs & InterceptableArgs & UpdateableArgs<Attrs> & PresentableArgs<Attrs>;
    export type OctironActionSelectionArgs<Attrs extends BaseAttrs = BaseAttrs> = FetchableArgs & IterableArgs & InterceptableArgs & UpdateableArgs<Attrs>;
    export type OctironEditArgs<Attrs extends BaseAttrs = BaseAttrs> = UpdateableArgs<Attrs> & EditableArgs;
    export type OctironDefaultArgs<Attrs extends BaseAttrs = BaseAttrs> = OctironPresentArgs<Attrs> | OctironEditArgs<Attrs>;
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
    actionValue: JSONObject) => JSONObject;
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
    export type UpdateableArgs<Attrs extends BaseAttrs = BaseAttrs> = {
        initialValue?: JSONValue;
        throttle?: number;
        debounce?: number;
        submitOnChange?: boolean;
        attrs?: Attrs;
        component?: EditComponent<any, Attrs> | AnyComponent<any, Attrs>;
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
        root(args: OctironSelectArgs<any>): Children;
        root(view: SelectView): Children;
        root(selector: Selector, args: OctironSelectArgs<any>): Children;
        root(selector: Selector, view: SelectView): Children;
        root(args: OctironSelectArgs<any>, view: SelectView): Children;
        root(selector: Selector, args: OctironSelectArgs<any>, view: SelectView): Children;
    }
    export interface EntryPoint {
        enter(selector: Selector): Children;
        enter(selector: Selector, args: OctironSelectArgs<any>): Children;
        enter(selector: Selector, view: SelectView): Children;
        enter(selector: Selector, args: OctironSelectArgs<any>, view: SelectView): Children;
    }
    export interface Queryable {
        get(termOrType: string): JSONValue;
    }
    export interface Selectable {
        select(selector: Selector): Children;
        select<Attrs extends BaseAttrs = BaseAttrs>(selector: Selector, args: OctironSelectArgs<Attrs>): Children;
        select(selector: Selector, view: SelectView): Children;
        select<Attrs extends BaseAttrs = BaseAttrs>(selector: Selector, args: OctironSelectArgs<Attrs>, view: SelectView): Children;
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
        perform(selector: Selector, args: OctironPerformArgs, view: PerformView): Children;
    }
    export interface ActionSelectView {
        (octiron: OctironActionSelection): Children;
    }
    export type PayloadValueMapper<Value extends JSONValue = JSONValue> = (payloadValue: Value) => Value;
    export interface Performable {
        perform(): Children;
        perform(selector: Selector): Children;
        perform(args: OctironPerformArgs): Children;
        perform(view: PerformView): Children;
        perform(selector: Selector, view: PerformView): Children;
        perform(selector: Selector, args: OctironPerformArgs): Children;
        perform(args: OctironPerformArgs, view: PerformView): Children;
        perform(selector: Selector, args: OctironPerformArgs, view: PerformView): Children;
    }
    export interface Appendable {
        remove(args?: UpdateArgs): void;
        replace(type: string, index: number, value: JSONValue, args?: UpdateArgs): void;
        append(type: string, value?: JSONValue, args?: UpdateArgs): void;
    }
    export interface Editable {
        edit(): Children;
        edit<Attrs extends BaseAttrs = BaseAttrs>(args: OctironEditArgs<Attrs>): Children;
    }
    export interface Submitable<Value extends JSONValue = JSONValue> {
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
        success(selector: Selector, args: OctironSelectArgs, view: SelectView): Children;
        failure(): Children;
        failure(selector: Selector): Children;
        failure(args: OctironSelectArgs): Children;
        failure(view: SelectView): Children;
        failure(selector: Selector, args: OctironSelectArgs): Children;
        failure(selector: Selector, view: SelectView): Children;
        failure(selector: Selector, args: OctironSelectArgs, view: SelectView): Children;
    }
    export interface ActionSelectable {
        select<Attrs extends BaseAttrs = BaseAttrs>(selector: Selector, args: OctironActionSelectionArgs<Attrs>, view: ActionSelectView): Children;
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
    }
    export interface OctironRoot extends Default, Origin, EntryPoint, Queryable, Selectable, Filterable, Presentable, Performable {
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
    export interface OctironSelection extends Default, Origin, EntryPoint, Queryable, Selectable, Filterable, Presentable, Performable {
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
    export interface OctironAction extends Default, Origin, EntryPoint, Queryable, ActionSelectable, Presentable, Submitable<JSONObject>, ActionFilterable, Performable, Appendable {
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
    export interface OctironActionSelection extends Default, Origin, EntryPoint, Queryable, ActionSelectable, Presentable, Submitable<JSONObject>, Editable, ActionFilterable, Performable, Appendable {
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
    export type Octiron = {
        select(selector: Selector): Children;
        select<Attrs extends BaseAttrs = BaseAttrs>(selector: Selector, args: OctironSelectArgs<Attrs> | OctironActionSelectionArgs<Attrs>): Children;
        select(selector: Selector, view: SelectView | ActionSelectView): Children;
        select<Attrs extends BaseAttrs = BaseAttrs>(selector: Selector, args: OctironSelectArgs<Attrs>, view: (o: Octiron) => Children): Children;
    } & (Omit<OctironRoot, 'select'> | Omit<OctironSelection, 'select'> | Omit<OctironAction, 'select'> | Omit<OctironActionSelection, 'select'>);
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
}
declare module "utils/unravelArgs" {
    import type { ActionSelectView, OctironActionSelectionArgs, OctironDefaultArgs, OctironEditArgs, OctironPerformArgs, OctironPresentArgs, OctironSelectArgs, PerformView, Selector, SelectView } from "types/octiron";
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
    export function unravelArgs(arg1?: Selector | OctironSelectArgs | SelectView, arg2?: OctironSelectArgs | SelectView, arg3?: SelectView): [Selector, OctironSelectArgs, SelectView];
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
    export function unravelArgs(arg1?: Selector | OctironPerformArgs | PerformView, arg2?: OctironPerformArgs | PerformView, arg3?: PerformView): [Selector, OctironPerformArgs, PerformView];
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
    export function unravelArgs(arg1?: Selector, arg2?: OctironActionSelectionArgs | ActionSelectView, arg3?: ActionSelectView): [Selector, OctironActionSelectionArgs, ActionSelectView];
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
    export function unravelArgs(arg1?: Selector | OctironPresentArgs, arg2?: OctironPresentArgs): [Selector, OctironSelectArgs];
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
    export function unravelArgs(arg1?: Selector | OctironEditArgs, arg2?: OctironEditArgs): [Selector, OctironEditArgs];
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
    export function unravelArgs(arg1?: Selector | OctironDefaultArgs, arg2?: OctironDefaultArgs): [Selector, OctironDefaultArgs];
}
declare module "factories/selectionFactory" {
    import type { BaseAttrs, CommonRendererArgs, OctironSelectArgs, OctironSelection, SelectionParentArgs } from "types/octiron";
    import { type InstanceHooks } from "factories/octironFactory";
    /**
      * Creates an Octiron selection instance.
      *
      * @param args - User specified args passed to the Octiron method creating the factory.
      * @param parentArgs - Args passed from the Octiron parent instance of this instance.
      * @param rendererArgs - Args passed from the Mithril renderer component.
      */
    export function selectionFactory<Attrs extends BaseAttrs>(args: OctironSelectArgs<Attrs>, parentArgs: SelectionParentArgs, rendererArgs: CommonRendererArgs): OctironSelection & InstanceHooks;
}
declare module "renderers/SelectionRenderer" {
    import type { OctironSelectArgs, SelectionParentArgs, Selector, SelectView } from "types/octiron";
    import m from "mithril";
    export type SelectionRendererAttrs = {
        entity?: boolean;
        selector: Selector;
        fragment?: string;
        args: OctironSelectArgs;
        view: SelectView;
        parentArgs: SelectionParentArgs;
    };
    /**
     * @description
     * Subscribes to a selection's result using the Octiron store. Each selection
     * result is feed to an Octiron instance and is only removed if a later
     * selection update does not include the same result. Selection results are
     * given a unique key in the form of a json-path.
     *
     * Once an Octiron instance is created using a selection, further changes via
     * the upstream parentArgs object or user given args applied to the downstream
     * Octiron instances using their internal update hooks.
     */
    export const SelectionRenderer: m.FactoryComponent<SelectionRendererAttrs>;
}
declare module "utils/getComponent" {
    import type { AnyComponent, EditComponent, PresentComponent, TypeDefs } from "types/octiron";
    /**
     * @description
     * Returns a component based of Octiron's selection rules:
     *
     * 1. If the first pick component is given, return it.
     * 2. If a typedef is defined for the propType (jsonld term or type)
     *    for the given style, return it.
     * 3. If a typedef is defined for the (or one of the) types (jsonld '@type')
     *    value for the given style, return it.
     * 4. If a fallback component is given, return it.
     *
     * @param args.style - The style of presentation.
     * @param args.propType - The propType the component should be configured to
     *                        handle.
     * @param args.type - The type the component should be configured to handle.
     * @param args.firstPickComponent - The component to use if passed by upstream.
     * @param args.fallbackComponent - The component to use if no other component
     *                                 is picked.
     */
    export function getComponent<Style extends 'present' | 'edit', Component extends (Style extends 'present' ? PresentComponent | AnyComponent : EditComponent | AnyComponent)>({ style, propType, type, firstPickComponent, typeDefs, fallbackComponent, }: {
        style: Style;
        propType?: string;
        type?: string | string[];
        typeDefs: TypeDefs;
        firstPickComponent?: Component;
        fallbackComponent?: Component;
    }): Component | undefined;
}
declare module "utils/getValueType" {
    import type { JSONValue } from "types/common";
    /**
     * @description
     * Returns the type value of the input if it is a type object.
     *
     * @param value A JSON value which might be a typed JSON-ld object.
     */
    export function getDataType(value: JSONValue): string | string[] | undefined;
}
declare module "utils/selectComponentFromArgs" {
    import type { AnyComponent, BaseAttrs, CommonParentArgs, CommonRendererArgs, EditComponent, OctironEditArgs, OctironPresentArgs, PresentComponent } from "types/octiron";
    /**
     * Selects the component and attrs to render with from args provided to an Octiron
     * factory instance or the render method.
     */
    export const selectComponentFromArgs: <Style extends "present" | "edit", Args extends (Style extends "present" ? OctironPresentArgs : OctironEditArgs), Attrs extends BaseAttrs, Component extends (Style extends "present" ? PresentComponent | AnyComponent : EditComponent | AnyComponent)>(style: Style, parentArgs: CommonParentArgs, rendererArgs: CommonRendererArgs, args?: Args, factoryArgs?: Args) => [Attrs, Component | undefined];
}
declare module "renderers/PresentRenderer" {
    import m from 'mithril';
    import type { Octiron, OctironPresentArgs, CommonParentArgs, CommonRendererArgs } from "types/octiron";
    export type PresentRendererAttrs = {
        o: Octiron;
        args: OctironPresentArgs;
        factoryArgs: OctironPresentArgs;
        parentArgs: CommonParentArgs;
        rendererArgs: CommonRendererArgs;
    };
    export const PresentRenderer: m.ComponentTypes<PresentRendererAttrs>;
}
declare module "renderers/ActionStateRenderer" {
    import type m from 'mithril';
    import type { OctironSelectArgs, SelectionParentArgs, SelectView, TypeDefs } from "types/octiron";
    import type { EntityState } from "types/store";
    import type { Store } from "store";
    export type ActionRendererRef = {
        submitting: boolean;
        submitResult?: EntityState;
        store: Store;
        typeDefs: TypeDefs;
    };
    export type ActionStateRendererAttrs = {
        not?: boolean;
        type: 'initial' | 'success' | 'failure';
        children?: m.Children;
        selector?: string;
        args: OctironSelectArgs;
        view?: SelectView;
        submitResult?: EntityState;
        parentArgs: SelectionParentArgs;
    };
    export const ActionStateRenderer: m.ClosureComponent<ActionStateRendererAttrs>;
}
declare module "utils/getSubmitDetails" {
    import type { JSONObject, SCMAction } from "types/common";
    export type SubmitDetails = {
        url: string;
        method: string;
        contentType?: string;
        encodingType?: string;
        body?: string;
    };
    /**
     * Gets the details on how to perform a submission
     * based off an action, payload and other context.
     *
     * @param args.payload The current payload value.
     * @param args.action The schema.org styled action object.
     */
    export function getSubmitDetails({ payload, action, }: {
        payload: JSONObject;
        action: SCMAction;
    }): SubmitDetails;
}
declare module "renderers/EditRenderer" {
    import m from 'mithril';
    import type { OctironActionSelection, OctironEditArgs, ActionSelectionParentArgs, ActionSelectionRendererArgs } from "types/octiron";
    export type EditRendererAttrs = {
        o: OctironActionSelection;
        args: OctironEditArgs;
        factoryArgs: OctironEditArgs;
        parentArgs: ActionSelectionParentArgs;
        rendererArgs: ActionSelectionRendererArgs;
    };
    export const EditRenderer: m.ComponentTypes<EditRendererAttrs>;
}
declare module "factories/actionSelectionFactory" {
    import type { JSONValue } from "types/common";
    import type { ActionSelectionParentArgs, ActionSelectionRendererArgs, OctironActionSelection, OctironActionSelectionArgs, UpdateArgs } from "types/octiron";
    import { type InstanceHooks } from "factories/octironFactory";
    export type OnActionSelectionSubmit = () => Promise<void>;
    export type OnActionSelectionUpdate = (pointer: string, value: JSONValue, args?: UpdateArgs) => void;
    export function actionSelectionFactory<Attrs extends Record<string, any> = Record<string, any>>(args: OctironActionSelectionArgs<Attrs>, parentArgs: ActionSelectionParentArgs, rendererArgs: ActionSelectionRendererArgs): OctironActionSelection & InstanceHooks;
}
declare module "renderers/ActionSelectionRenderer" {
    import type m from "mithril";
    import type { ActionSelectionParentArgs, ActionSelectView, OctironActionSelectionArgs, Selector } from "types/octiron";
    import type { JSONObject } from "types/common";
    export type ActionSelectionRendererAttrs = {
        value: JSONObject;
        actionValue: JSONObject;
        selector: Selector;
        parentArgs: ActionSelectionParentArgs;
        args: OctironActionSelectionArgs;
        view: ActionSelectView;
        selectionArgs?: OctironActionSelectionArgs;
    };
    export const ActionSelectionRenderer: m.FactoryComponent<ActionSelectionRendererAttrs>;
}
declare module "utils/expandValue" {
    import type { JSONObject } from "types/common";
    import type { Store } from "store";
    /**
     * Expands a object's keys to be their RDF type equivlent.
     *
     * @param store   - An Octiron store with expansion context.
     * @param value   - A JSON object to expand.
     */
    export function expandValue(store: Store, value: JSONObject): JSONObject;
}
declare module "factories/actionFactory" {
    import type { Store } from "store";
    import type { JSONObject } from "types/common";
    import type { ActionParentArgs, OctironAction, OctironPerformArgs, PerformRendererArgs, TypeDefs } from "types/octiron";
    import type { EntityState } from "types/store";
    import { type InstanceHooks } from "factories/octironFactory";
    export type ActionRefs = {
        url?: string;
        method?: string;
        submitting: boolean;
        payload: JSONObject;
        store: Store;
        typeDefs: TypeDefs;
        submitResult?: EntityState;
    };
    export function actionFactory<Attrs extends Record<string, any> = Record<string, any>>(args: OctironPerformArgs<Attrs>, parentArgs: ActionParentArgs, rendererArgs: PerformRendererArgs): OctironAction & InstanceHooks;
}
declare module "renderers/PerformRenderer" {
    import type m from 'mithril';
    import type { ActionParentArgs, OctironPerformArgs, PerformView, SelectionParentArgs, Selector } from "types/octiron";
    export type PerformRendererAttrs = {
        parentArgs: SelectionParentArgs & ActionParentArgs;
        selector?: Selector;
        args: OctironPerformArgs;
        view: PerformView;
    };
    export const PerformRenderer: m.FactoryComponent<PerformRendererAttrs>;
}
declare module "factories/octironFactory" {
    import m from 'mithril';
    import type { Mutable } from "types/common";
    import type { ActionParentArgs, ActionSelectionParentArgs, AnyAttrs, AnyComponent, CommonParentArgs, CommonRendererArgs, EditAttrs, EditComponent, OctironAction, OctironActionSelection, OctironActionSelectionArgs, OctironPerformArgs, OctironRoot, OctironSelectArgs, OctironSelection, Predicate, PresentAttrs, PresentComponent, SelectionParentArgs, TypeDefs } from "types/octiron";
    import type { Store } from "store";
    export type CommonArgs = {
        pre?: m.Children;
        sep?: m.Children;
        post?: m.Children;
        start?: number;
        end?: number;
        predicate?: Predicate;
        store?: Store;
        typeDefs?: TypeDefs;
        attrs?: PresentAttrs | EditAttrs | AnyAttrs;
        component?: PresentComponent | EditComponent | AnyComponent;
        fallbackComponent?: AnyComponent;
    };
    export type ChildArgs = Partial<SelectionParentArgs> & Partial<ActionParentArgs> & Partial<ActionSelectionParentArgs> & CommonParentArgs;
    export type InstanceHooks = {
        _updateArgs: (type: 'args' | 'renderer' | 'parent', args: OctironSelectArgs | OctironPerformArgs | OctironActionSelectionArgs) => void;
    };
    export function octironFactory(octironType: 'root', factoryArgs: CommonArgs, parentArgs: CommonParentArgs): Mutable<OctironRoot>;
    export function octironFactory(octironType: 'selection', factoryArgs: CommonArgs, parentArgs: CommonParentArgs, rendererArgs: CommonRendererArgs, childArgs: ChildArgs): Mutable<OctironSelection & InstanceHooks>;
    export function octironFactory(octironType: 'action', factoryArgs: CommonArgs, parentArgs: CommonParentArgs, rendererArgs: CommonRendererArgs, childArgs: ChildArgs): Mutable<OctironAction & InstanceHooks>;
    export function octironFactory(octironType: 'action-selection', factoryArgs: CommonArgs, parentArgs: CommonParentArgs, rendererArgs: CommonRendererArgs, childArgs: ChildArgs): Mutable<OctironActionSelection & InstanceHooks>;
}
declare module "factories/rootFactory" {
    import type { CommonParentArgs, OctironRoot } from "types/octiron";
    export function rootFactory(parentArgs: CommonParentArgs): OctironRoot;
}
declare module "utils/makeTypeDefs" {
    import { Store } from "store";
    import type { TypeDef, TypeDefs } from "types/octiron";
    export function makeTypeDefs<const Type extends string = string, const TypeDefList extends TypeDef<any, Type> = TypeDef<any, Type>>(store: Store, ...typeDefs: Readonly<TypeDefList[]>): TypeDefs<Type, TypeDefList>;
    export function makeTypeDefs<const Type extends string = string, const TypeDefList extends TypeDef<any, Type> = TypeDef<any, Type>>(...typeDefs: Readonly<TypeDefList[]>): TypeDefs<Type, TypeDefList>;
}
declare module "utils/classes" {
    type ClassArg = undefined | null | string | string[] | Record<string, boolean | undefined>;
    /**
     * Merges arguments into a single css class string
     */
    export function classes(...classArgs: ClassArg[]): string;
}
declare module "utils/makeTypeDef" {
    import type { JSONValue } from "types/common";
    import type { TypeDef } from "types/octiron";
    /**
     * @description
     * Utility for creating a well typed typeDef.
     *
     * @param typeDef An object to property define the types for.
     */
    export function makeTypeDef<const Model extends JSONValue = JSONValue, const Type extends string = string>(typeDef: TypeDef<Model, Type>): TypeDef<Model, Type>;
}
declare module "handlers/jsonLDHandler" {
    import type { Handler } from "types/store";
    export const jsonLDHandler: Handler;
}
declare module "handlers/longformHandler" {
    import type { Handler } from "types/store";
    export const longformHandler: Handler;
}
declare module "components/OctironJSON" {
    import m from 'mithril';
    import type { JSONValue } from "types/common";
    export type OctironJSONAttrs = {
        selector?: string;
        value: JSONValue;
        location?: URL;
    };
    export const OctironJSON: m.ClosureComponent<OctironJSONAttrs>;
}
declare module "components/OctironDebug" {
    import m from 'mithril';
    import type { Octiron } from "types/octiron";
    export type OctironDebugPresentationStyle = 'value' | 'action-value' | 'component';
    export type OctironDebugAttrs = {
        o: Octiron;
        selector?: string;
        location?: URL;
        initialPresentationStyle?: OctironDebugPresentationStyle;
        availableControls?: OctironDebugPresentationStyle[];
    };
    export const OctironDebug: m.ClosureComponent<OctironDebugAttrs>;
}
declare module "components/OctironExplorer" {
    import m from 'mithril';
    import type { Octiron } from "types/octiron";
    export type OctironExplorerAttrs = {
        autofocus?: boolean;
        selector?: string;
        presentationStyle?: 'debug' | 'components';
        childControls?: boolean;
        onChange?: (selector: string, presentationStyle: 'debug' | 'components') => void;
        location?: URL;
        o: Octiron;
    };
    export const OctironExplorer: m.ClosureComponent<OctironExplorerAttrs>;
}
declare module "components/OctironForm" {
    import m from 'mithril';
    import type { OctironAction } from "types/octiron";
    export type OctironFormAttrs = {
        o: OctironAction;
        id?: string;
        class?: string;
    };
    export const OctironForm: m.ClosureComponent<OctironFormAttrs>;
}
declare module "components/OctironSubmitButton" {
    import m from 'mithril';
    import type { OctironAction } from "types/octiron";
    export type OctironSubmitButtonAttrs = {
        o: OctironAction;
        id?: string;
        class?: string;
    };
    export const OctironSubmitButton: m.ClosureComponent<OctironSubmitButtonAttrs>;
}
declare module "octiron" {
    import type { OctironRoot, TypeDef } from "types/octiron";
    import { Store } from "store";
    export * from "types/common";
    export * from "types/store";
    export * from "types/octiron";
    export * from "store";
    export * from "utils/classes";
    export * from "utils/makeTypeDef";
    export * from "utils/makeTypeDefs";
    export * from "handlers/jsonLDHandler";
    export * from "handlers/longformHandler";
    export * from "components/OctironJSON";
    export * from "components/OctironDebug";
    export * from "components/OctironExplorer";
    export * from "components/OctironForm";
    export * from "components/OctironSubmitButton";
    /**
     * Creates a root octiron instance.
     */
    declare function octiron({ typeDefs, ...storeArgs }: ConstructorParameters<typeof Store>[0] & {
        typeDefs?: TypeDef<any>[];
    }): OctironRoot;
    declare namespace octiron {
        var fromInitialState: ({ typeDefs, ...storeArgs }: Parameters<typeof Store.fromInitialState>[0] & {
            typeDefs?: TypeDef<any>[];
        }) => OctironRoot;
    }
    export default octiron;
}
