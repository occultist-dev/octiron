import type { CommonParentArgs, OctironRoot } from '../types/octiron.ts';
import { type InstanceHooks, octironFactory } from "./octironFactory.ts";


export function rootFactory(
  parentArgs: CommonParentArgs,
): [octiron: OctironRoot, hooks: InstanceHooks] {
  const factoryArgs = {};

  const res = octironFactory(
    'root',
    {
      factoryArgs,
      parentArgs,
      rendererArgs: {},
      childArgs: {},
    },
  );
  
  Object.seal(res[0]);

  return res as [OctironRoot, InstanceHooks];
}
