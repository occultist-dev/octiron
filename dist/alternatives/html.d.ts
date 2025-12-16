import m from 'mithril';
import type { HTMLHandler, IntegrationState } from "../types/store.js";
import type { Octiron } from "../types/octiron.js";
export type HTMLIntegrationComponentAttrs = {
    o: Octiron;
    html: string;
    el?: Element;
    handler: HTMLHandler;
};
export type HTMLIntegrationComponentType = m.ComponentTypes<HTMLIntegrationComponentAttrs>;
export declare const HTMLIntegrationComponent: HTMLIntegrationComponentType;
export type HTMLIntegrationArgs = {
    iri: string;
    contentType: string;
    html: string;
    id?: string;
    el?: Element;
};
export declare class HTMLIntegration implements IntegrationState {
    #private;
    static type: "html";
    readonly integrationType: "html";
    constructor(handler: HTMLHandler, { iri, contentType, html, id, el, }: HTMLIntegrationArgs);
    get iri(): string;
    get contentType(): string;
    render(o: Octiron): m.Vnode<HTMLIntegrationComponentAttrs, {}>;
    getStateInfo(): {
        iri: string;
        contentType: string;
        id: string;
    };
    toInitialState(): string;
    static fromInitialState(handler: HTMLHandler, { iri, contentType, id, }: {
        iri: string;
        contentType: string;
        id?: string;
    }): HTMLIntegration | null;
}
