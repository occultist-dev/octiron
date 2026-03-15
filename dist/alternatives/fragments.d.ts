import m from 'mithril';
type FragmentCache = [
    identifier: string,
    type: Fragment['type'] | undefined,
    html: string,
    dom?: Element[]
];
type OnRendered = (identifier: string) => void;
export type FragmentsRemoveHandler = () => void;
export type FragmentsCreateHandler = (dom: Element) => undefined | FragmentsRemoveHandler;
export type FragmentRendererAttrs = {
    fragment: FragmentCache;
    handler?: FragmentsCreateHandler;
    onRendered: OnRendered;
};
type FragmentRendererState = {
    fragment: FragmentCache;
    didChange?: boolean;
    onRemove?: FragmentsRemoveHandler;
};
export declare const FragmentRenderer: m.Component<FragmentRendererAttrs, FragmentRendererState>;
export type FragmentType = 'embed' | 'bare' | 'text' | 'range';
export type FragmentSSR = {
    id: string;
    type: FragmentType;
    html?: string;
    selector: string;
};
export type Fragment = {
    id: string;
    type: FragmentType;
    html?: string;
    dom?: Element[];
    selector?: string;
};
export type SerializableFragmentsHandlerResult = {
    root?: string | null;
    selector?: string;
    fragments: Record<string, FragmentSSR>;
    templates?: Record<string, string>;
};
export type FragmentsHandlerResult = {
    root?: string | null;
    dom?: Element[];
    selector?: string;
    fragments: Record<string, Fragment>;
    templates: Record<string, string>;
};
export type FragmentState = {
    id: string;
    type: Exclude<FragmentType, 'text'>;
    rendered: boolean;
    selector: string;
};
/**
 * Details about the integrated content which are
 * written into the server rendered HTML for client
 * side initial state.
 */
export type FragmentsStateInfo = {
    iri: string;
    method: string;
    contentType: string;
    integrationType: 'fragments';
    rendered?: boolean;
    selector?: string;
    fragments: FragmentState[];
    text: Record<string, string>;
    templates: Record<string, string>;
};
/**
 * Parsed result of a URL hash.
 */
export type ParsedFragmentsHash = {
    /**
     * The fragment identifier.
     */
    identifier: string;
    /**
     * Fragment args.
     */
    args?: unknown;
};
/**
 * Function for parsing the fragment identifier
 * args from a URL hash value.
 *
 * @param hash The URL hash.
 */
export type FragmentsHashParser = (hash: string) => ParsedFragmentsHash | undefined;
export type FragmentRetrievalHook = (fragmentIdentifier: string) => string | undefined;
export type FragmentsTemplateParser = (template: string, args: unknown, hook?: (fragmentIdentifier: string) => string | undefined) => string | undefined;
export type FragmentsHandlerFnArgs = {
    res: Response;
};
export type FragmentsHandlerFn = (args: FragmentsHandlerFnArgs) => Promise<SerializableFragmentsHandlerResult>;
export type FragmentsHandler = {
    integrationType: 'fragments';
    contentType: string;
    /**
     * Function for producing the parsed fragments content from a
     * request of the configured content type.
     */
    handler: FragmentsHandlerFn;
    /**
     * Function for parsing the fragment identifier
     * and optional args from a URL hash value.
     *
     * If omitted the hash is treated as the fragment identifier.
     */
    hashParser?: FragmentsHashParser;
    /**
     * Function for parsing templates if supported by
     * the media type.
     */
    templateParser?: FragmentsTemplateParser;
    /**
     * Lifecycle hook that is called when a fragment is mounted.
     */
    createHandler?: FragmentsCreateHandler;
};
export type FragmentsIntegrationArgs = {
    /**
     * The IRI of the content.
     */
    iri: string;
    /**
     * The HTTP method used to retrieve the content.
     */
    method: string;
    /**
     * The HTTP content type.
     */
    contentType: string;
    /**
     * The processed content.
     */
    content: FragmentsHandlerResult;
};
export interface FragmentsIntegrationType {
    /**
     * The IRI of the content.
     */
    iri: string;
    /**
     * The HTTP method used to retrieve the content.
     */
    method: string;
    /**
     * The HTTP content type.
     */
    contentType: string;
    /**
     * Returns a text fragment as text.
     * The root fragment cannot be accessed as text.
     *
     * @param The URL hash.
     */
    text(hash: string): string | undefined;
    /**
     * Returns the vdom representation of the fragment.
     *
     * @param hash The URL hash.
     */
    render(hash?: string): m.Children;
    /**
     * Returns the state info used for re-constructing the fragments
     * in a DOM environment from server side rendered document.
     */
    getStateInfo(): FragmentsStateInfo;
    /**
     * Returns a HTML string containing all content so the entire HTML
     * fragments content can be re-constructed in the browser. The
     * HTML fragments integration can reuse DOM created when processing
     * the original HTML document where root, embedded, bare and range
     * fragment types are used and when they are rendered into the HTML
     * document.
     *
     * All other fragment types and un-rendered fragments must be written
     * into the initial state so they are available for client side
     * rendering.
     */
    toInitialState(): string;
}
export interface FragmentsIntegrationFactory {
    /**
     * The integration type this factory produces.
     */
    type: 'fragments';
    /**
     * The fragments integration is used with media types that support
     * having parts or views of their content being accessed using fragment
     * identifiers in the hash of the URL and rendered to HTML.
     *
     * If the media-type supports having args passed by the client
     * to fragments a parser function must be passed to the integration
     * to separate arguments from the fragment identifier.
     *
     * Fragment identifiers with text semantics can be accessed as text
     * instead of VDOM using the text method on the integration.
     *
     * The integration does not support passing args to the root fragment
     * or rendering the root fragment as text.
     *
     * @param args The fragments integration args.
     * @param handler The content type's handler configuration.
     */
    (args: FragmentsIntegrationArgs, handler: FragmentsHandler): FragmentsIntegrationType;
    /**
     * Creates a fragments integration from initial state rendered into a
     * HTML document.
     *
     * @param stateInfo
     * @param handler The content type's handler configuration.
     */
    fromInitialState(stateInfo: FragmentsStateInfo, handler: FragmentsHandler): FragmentsIntegrationType | null;
}
export declare const FragmentsIntegration: FragmentsIntegrationFactory;
export {};
