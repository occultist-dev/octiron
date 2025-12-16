import m from 'mithril';
import type { Octiron } from "../types/octiron.js";
import { OctironDebugPresentationStyle } from "./OctironDebug.js";
export type OctironExplorerAttrs = {
    autofocus?: boolean;
    selector?: string;
    presentationStyle?: OctironDebugPresentationStyle;
    childControls?: boolean;
    onChange?: (selector: string, presentationStyle: OctironDebugPresentationStyle) => void;
    location?: URL;
    o: Octiron;
};
export declare const OctironExplorer: m.ClosureComponent<OctironExplorerAttrs>;
