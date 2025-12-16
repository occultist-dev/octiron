import type { CommonParentArgs, OctironRoot } from '../types/octiron.js';
import { octironFactory } from "./octironFactory.js";


export function rootFactory(
  parentArgs: CommonParentArgs,
): OctironRoot {
  const factoryArgs = {};
  const self = octironFactory(
    'root',
    factoryArgs,
    parentArgs,
  );

  return self as unknown as OctironRoot;
}
