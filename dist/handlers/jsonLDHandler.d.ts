import type { JSONLDContextStore } from "@occultist/mini-jsonld";
import type { JSONLDHandler } from "../types/store.ts";
export type MakeJSONLDHandlerArgs = {
    store?: JSONLDContextStore;
};
export declare const makeJSONLDHandler: (args: MakeJSONLDHandlerArgs) => JSONLDHandler;
