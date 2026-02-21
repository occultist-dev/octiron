import m from 'mithril';
import type { OctironAction } from "../types/octiron.ts";
export type OctironFormAttrs = {
    o: OctironAction;
    id?: string;
    class?: string;
};
export declare const OctironForm: m.ClosureComponent<OctironFormAttrs>;
