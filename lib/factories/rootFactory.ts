import type { CommonParentArgs, OctironRoot } from '../types/octiron.ts';
import { octironFactory } from "./octironFactory.ts";


export function rootFactory(
  parentArgs: CommonParentArgs,
): OctironRoot {
  const factoryArgs = {};
  const self = octironFactory(
    'root',
    {
      factoryArgs,
      parentArgs,
    },
  );

  return self as unknown as OctironRoot;
}
