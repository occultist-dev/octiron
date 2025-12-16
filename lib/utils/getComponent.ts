import type { AnyComponent, BaseAttrs, EditComponent, PresentComponent, TypeDefs } from "../types/octiron.js";

/**
 * @description
 * Returns a component based of Octiron's selection rules:
 *
 * 1. If the first pick component is given, return it.
 * 2. If a typedef is defined for the propType (jsonld term or type)
 *    for the given style, return it.
 * 3. If a typedef is defined for the (or one of the) types (jsonld '@type')
 *    value for the given style, return it.
 * 4. If a fallback component is given, return it.
 *
 * @param args.style - The style of presentation.
 * @param args.propType - The propType the component should be configured to
 *                        handle.
 * @param args.type - The type the component should be configured to handle.
 * @param args.firstPickComponent - The component to use if passed by upstream.
 * @param args.fallbackComponent - The component to use if no other component
 *                                 is picked.
 */
export function getComponent<
  Style extends 'present' | 'edit',
  Component extends (
    Style extends 'present'
      ? PresentComponent | AnyComponent
      : EditComponent | AnyComponent
  )
>({
  style,
  propType,
  type,
  firstPickComponent,
  typeDefs,
  fallbackComponent,
}: {
  style: Style;
  propType?: string;
  type?: string | string[];
  typeDefs: TypeDefs;
  firstPickComponent?: Component;
  fallbackComponent?: Component;
}): Component | undefined {
  if (firstPickComponent != null) {
    return firstPickComponent;
  }

  if (
    propType != null &&
    typeDefs[propType]?.[style] != null
  ) {
    return typeDefs[propType][style] as Component;
  }

  if (
    !Array.isArray(type) &&
    type != null &&
    typeDefs[type]?.[style] != null
  ) {
    return typeDefs[type][style] as Component;
  }

  if (Array.isArray(type)) {
    for (const item of type) {
      if (
        typeDefs[item]?.[style] != null
      ) {
        return typeDefs[item][style] as Component;
      }
    }
  }

  if (fallbackComponent != null) {
    return fallbackComponent as Component;
  }
}
