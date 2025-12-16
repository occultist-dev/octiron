import m from 'mithril';
import type { Octiron, OctironPresentArgs, CommonParentArgs, CommonRendererArgs } from '../types/octiron.js';
export type PresentRendererAttrs = {
    o: Octiron;
    args: OctironPresentArgs;
    factoryArgs: OctironPresentArgs;
    parentArgs: CommonParentArgs;
    rendererArgs: CommonRendererArgs;
};
export declare const PresentRenderer: m.ComponentTypes<PresentRendererAttrs>;
