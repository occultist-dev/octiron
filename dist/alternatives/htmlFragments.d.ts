import m from 'mithril';
import type { HTMLFragmentsHandler, HTMLFragmentsHandlerResult, IntegrationState } from "../types/store.ts";
import type { Octiron } from "../types/octiron.ts";
export type HTMLFragmentsIntegrationComponentAttrs = {
    o: Octiron;
    integration: HTMLFragmentsIntegration;
    fragment?: string;
    output: HTMLFragmentsHandlerResult<true>;
};
export type HTMLFragmentsIntegrationComponentType = m.ComponentTypes<HTMLFragmentsIntegrationComponentAttrs>;
export declare const HTMLFragmentsIntegrationComponent: HTMLFragmentsIntegrationComponentType;
export type HTMLFragmentsIntegrationArgs = {
    iri: string;
    method: string;
    contentType: string;
    output: HTMLFragmentsHandlerResult<true>;
};
export type FragmentState = {
    type: 'embed' | 'bare' | 'range';
    id: string;
    rendered: boolean;
    selector: string;
};
type HTMLFragmentsStateInfo = {
    iri: string;
    method: string;
    contentType: string;
    rendered?: boolean;
    selector?: string;
    fragments: FragmentState[];
    texts: Record<string, string>;
    templates: Record<string, string>;
};
export declare class HTMLFragmentsIntegration implements IntegrationState {
    #private;
    static type: "html-fragments";
    readonly integrationType: "html-fragments";
    constructor(handler: HTMLFragmentsHandler, { iri, method, contentType, output, }: HTMLFragmentsIntegrationArgs);
    get iri(): string;
    get method(): string;
    get contentType(): string;
    get output(): HTMLFragmentsHandlerResult<true>;
    getFragment(fragment?: string): string | Node | null;
    /**
     * Returns a text representaion of a fragment.
     */
    text(fragment?: string): string | undefined;
    /**
     * Renders a HTML fragment.
     *
     * @param o         The octiron instance.
     * @param fragment  A fragment identifier to use when selecting the fragment
     *                  to render and for providing template args. If no fragment
     *                  identifier is provided the root fragment will be rendered.
     */
    render(o: Octiron, fragment?: string): m.Vnode<HTMLFragmentsIntegrationComponentAttrs, {}>;
    getStateInfo(): HTMLFragmentsStateInfo;
    toInitialState(): string;
    static fromInitialState({ iri, method, contentType, rendered, selector, texts, fragments, templates, }: HTMLFragmentsStateInfo, handler: HTMLFragmentsHandler): HTMLFragmentsIntegration | null;
}
export {};
