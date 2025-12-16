import m from 'mithril';
import type { Octiron } from "../types/octiron.js";
export type OctironDebugPresentationStyle = 'value' | 'action-value' | 'component' | 'log';
export type OctironDebugAttrs = {
    o: Octiron;
    selector?: string;
    location?: URL;
    initialPresentationStyle?: OctironDebugPresentationStyle;
    availableControls?: OctironDebugPresentationStyle[];
};
export declare const OctironDebug: m.ClosureComponent<OctironDebugAttrs>;
