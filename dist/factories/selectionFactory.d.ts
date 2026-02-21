import type { BaseAttrs, CommonRendererArgs, OctironSelectArgs, OctironSelection, SelectionParentArgs } from '../types/octiron.ts';
import { type InstanceHooks } from "./octironFactory.ts";
/**
  * Creates an Octiron selection instance.
  *
  * @param args - User specified args passed to the Octiron method creating the factory.
  * @param parentArgs - Args passed from the Octiron parent instance of this instance.
  * @param rendererArgs - Args passed from the Mithril renderer component.
  */
export declare function selectionFactory<Attrs extends BaseAttrs>(args: OctironSelectArgs<Attrs>, parentArgs: SelectionParentArgs, rendererArgs: CommonRendererArgs): OctironSelection & InstanceHooks;
