import m from 'mithril';
import type { OctironAction } from "../types/octiron.js";
export type OctironSubmitButtonAttrs = {
    o: OctironAction;
    id?: string;
    class?: string;
};
export declare const OctironSubmitButton: m.ClosureComponent<OctironSubmitButtonAttrs>;
