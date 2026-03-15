import m from 'mithril';
type OnRendered = () => void;
export type ElementHashParser<ParsedHash extends unknown = string> = (fragment: string) => ParsedHash;
export type ElementFragmentChangeHandler<ParsedHash extends unknown = string> = (fragmentValue: ParsedHash, fragment: string) => void;
export type ElementRemoveHandler = () => void;
export type ElementCreateContext<ParsedHash extends unknown = string> = {
    fragment?: string;
    fragmentValue: ParsedHash | string;
    dom: Element;
};
export type ElementCreateHandler = (context: ElementCreateContext) => undefined | {
    onFragmentChange: ElementFragmentChangeHandler;
    onRemove: ElementRemoveHandler;
};
export type ElementRendererAttrs = {
    dom: Element;
    fragment: string;
    hashParser: ElementHashParser;
    createHandler?: ElementCreateHandler;
    onRendered: OnRendered;
};
type ElementRendererState = {
    fragment: string;
    onFragmentChange?: ElementFragmentChangeHandler;
    onRemove?: ElementRemoveHandler;
    context?: ElementCreateContext;
};
export declare const ElementRenderer: m.Component<ElementRendererAttrs, ElementRendererState>;
export type SerializableElementHandlerResult = {
    html: string;
    selector: string;
};
export type ElementHandlerResult = {
    html: string;
    selector: string;
    dom: Element;
};
/**
 * Details about the integrated content which are
 * written into the server rendered HTML for client
 * side initial state.
 */
export type ElementStateInfo = {
    iri: string;
    method: string;
    contentType: string;
    integrationType: 'element';
    rendered: boolean;
    selector: string;
};
export type ElementHandlerFnArgs = {
    res: Response;
};
export type ElementHandlerFn = (args: ElementHandlerFnArgs) => Promise<SerializableElementHandlerResult>;
export type ElementHandler<ParsedHash extends unknown = ''> = {
    integrationType: 'element';
    contentType: string;
    handler: ElementHandlerFn;
    /**
     * The fragment parser is run on every fragment update and
     * written to the create handler context as the `fragmentValue`.
     * If omitted the `fragmentValue` defaults to the fragment string.
     */
    hashParser?: ElementHashParser<ParsedHash>;
    /**
     * Runs once the element is created in a DOM environment.
     */
    createHandler?: ElementCreateHandler;
};
export type ElementIntegrationArgs = {
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
    content: ElementHandlerResult;
};
export interface ElementIntegrationType {
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
     * The Octiron integration type.
     */
    integrationType: 'element';
    /**
     * Returns the vdom representation of the fragment.
     *
     * @param hash The URL hash.
     */
    render(hash?: string): m.Children;
    /**
     * Returns the state info used for re-constructing the element
     * in a DOM environment from server side rendered document.
     */
    getStateInfo(): ElementStateInfo;
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
export interface ElementIntegrationFactory {
    /**
     * The integration type this factory produces.
     */
    type: 'element';
    /**
     * The element integration is used with media types that support
     * being written as one blob to a single HTML element.
     *
     * The element integration's most powerful feature is the ability
     * to hook into Octiron form changes when those changes are targeting
     * the hash value of the target URI.
     *
     * The integration can listen to changes in the hash, process the hash
     * as according to the configured media-type rules and dynamically
     * update the contents of the rendered HTML.
     *
     * @param args The fragments integration args.
     * @param handler The content type's handler configuration.
     */
    (args: ElementIntegrationArgs, handler: ElementHandler): ElementIntegrationType;
    /**
     * Creates a elements integration from initial state rendered into a
     * HTML document.
     *
     * @param stateInfo
     * @param handler The content type's handler configuration.
     */
    fromInitialState: (stateInfo: ElementStateInfo, handler: ElementHandler) => ElementIntegrationType;
}
export declare const ElementIntegration: ElementIntegrationFactory;
export {};
