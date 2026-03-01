import type { CommonParentArgs, OctironRoot } from '../types/octiron.ts';
import { type InstanceHooks } from "./octironFactory.ts";
export declare function rootFactory(parentArgs: CommonParentArgs): [octiron: OctironRoot, hooks: InstanceHooks];
