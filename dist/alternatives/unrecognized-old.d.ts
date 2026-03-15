import type { Children } from "mithril";
import type { ErrorView, IntegrationState } from "../types/store.ts";
export type UnrecognizedStateInfo = {
    iri: string;
    method: string;
    contentType: string;
};
export type UnrecognizedIntegrationArgs = {
    iri: string;
    method: string;
    contentType: string;
};
/**
 * Handles all responses where the content type is not
 * configured.
 */
export declare class UnrecognizedIntegration implements IntegrationState {
    #private;
    static type: "unrecognized";
    readonly integrationType: "unrecognized";
    constructor(args: UnrecognizedIntegrationArgs);
    error(view: Children | ErrorView): Children;
    get iri(): string;
    get method(): string;
    get contentType(): string;
    getStateInfo(): UnrecognizedStateInfo;
    static fromInitialState({ iri, method, contentType, }: UnrecognizedStateInfo): UnrecognizedIntegration;
}
