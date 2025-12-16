import type { Store } from "../store.js";
export type SelectorObject = {
    subject?: string;
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
export declare function parseSelectorString(selector: string, store: Store): SelectorObject[];
