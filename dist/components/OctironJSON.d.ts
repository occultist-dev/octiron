import m from 'mithril';
import type { JSONValue } from "../types/common.js";
export type OctironJSONAttrs = {
    selector?: string;
    value: JSONValue;
    location?: URL;
};
export declare const OctironJSON: m.ClosureComponent<OctironJSONAttrs>;
