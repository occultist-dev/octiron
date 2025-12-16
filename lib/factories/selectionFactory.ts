import type { ActionParentArgs, BaseAttrs, CommonRendererArgs, OctironSelectArgs, OctironSelection, SelectionParentArgs } from '../types/octiron.js';
import { type CommonArgs, type InstanceHooks, octironFactory } from "./octironFactory.js";

/**
  * Creates an Octiron selection instance.
  *
  * @param args - User specified args passed to the Octiron method creating the factory.
  * @param parentArgs - Args passed from the Octiron parent instance of this instance.
  * @param rendererArgs - Args passed from the Mithril renderer component.
  */
export function selectionFactory<Attrs extends BaseAttrs>(
  args: OctironSelectArgs<Attrs>,
  parentArgs: SelectionParentArgs,
  rendererArgs: CommonRendererArgs,
): OctironSelection & InstanceHooks {
  const factoryArgs = Object.assign({}, args);
  const childArgs = {
    // value: parentArgs.value,
    value: rendererArgs.value,
  } as SelectionParentArgs & ActionParentArgs;
  const self = octironFactory(
    'selection',
    factoryArgs as unknown as CommonArgs,
    parentArgs,
    rendererArgs,
    childArgs,
  );

  return self as OctironSelection & InstanceHooks;
}
