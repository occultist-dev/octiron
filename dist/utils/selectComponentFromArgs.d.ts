import type { AnyComponent, BaseAttrs, CommonParentArgs, CommonRendererArgs, EditComponent, OctironEditArgs, OctironPresentArgs, PresentComponent } from "../types/octiron.js";
/**
 * Selects the component and attrs to render with from args provided to an Octiron
 * factory instance or the render method.
 */
export declare const selectComponentFromArgs: <Style extends "present" | "edit", Args extends (Style extends "present" ? OctironPresentArgs : OctironEditArgs), Attrs extends BaseAttrs, Component extends (Style extends "present" ? PresentComponent | AnyComponent : EditComponent | AnyComponent)>(style: Style, parentArgs: CommonParentArgs, rendererArgs: CommonRendererArgs, args?: Args, factoryArgs?: Args) => [Attrs, Component | undefined];
