import { Children } from "mithril";
import type { ErrorView, IntegrationState } from "../types/store";
export type UnrecognizedStateInfo = {
    iri: string;
    contentType: string;
};
export type UnrecognizedIntegrationArgs = {
    iri: string;
    contentType: string;
};
/**
 * Handles all responses where the content type is not
 * configured.
 */
export declare class UnrecognizedIntegration implements IntegrationState {
    #private;
    static type: "unrecognized-integration";
    readonly integrationType: "unrecognized";
    constructor(args: UnrecognizedIntegrationArgs);
    error(view: Children | ErrorView): Children;
    get iri(): string;
    get contentType(): string;
    getStateInfo(): UnrecognizedStateInfo;
    static fromInitialState({ iri, contentType, }: UnrecognizedStateInfo): UnrecognizedIntegration;
}
