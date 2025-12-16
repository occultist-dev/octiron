import { Store } from "../store.js";
import type { TypeDef, TypeDefs } from "../types/octiron.js";


export function makeTypeDefs<
  const Type extends string = string,
  // deno-lint-ignore no-explicit-any
  const TypeDefList extends TypeDef<any, Type> = TypeDef<any, Type>,
>(
  store: Store,
  ...typeDefs: Readonly<TypeDefList[]>
): TypeDefs<Type, TypeDefList>;

export function makeTypeDefs<
  const Type extends string = string,
  // deno-lint-ignore no-explicit-any
  const TypeDefList extends TypeDef<any, Type> = TypeDef<any, Type>,
>(
  ...typeDefs: Readonly<TypeDefList[]>
): TypeDefs<Type, TypeDefList>;

/**
 * @description
 * Aggregates a list of type defs into an easier to access
 * type def config object.
 *
 * @param typeDefs The type defs to aggregate.
 */
export function makeTypeDefs<
  const Type extends string = string,
  // deno-lint-ignore no-explicit-any
  const TypeDefList extends TypeDef<any, Type> = TypeDef<any, Type>,
>(
  // deno-lint-ignore no-explicit-any
  storeOrTypeDef: Store | TypeDef<any, Type>,
  ...typeDefs: Readonly<TypeDefList[]>
): TypeDefs<Type, TypeDefList> {
  const config = {} as TypeDefs<Type, TypeDefList>;

  if (storeOrTypeDef instanceof Store) {
    for (const typeDef of typeDefs) {
      // deno-lint-ignore no-explicit-any
      (config as any)[storeOrTypeDef.expand(typeDef.type)] = typeDef;
    }
  } else {
    // deno-lint-ignore no-explicit-any
    (config[storeOrTypeDef.type] as any) = storeOrTypeDef;
    for (const typeDef of typeDefs) {
      // deno-lint-ignore no-explicit-any
      (config as any)[typeDef.type] = typeDef;
    }
  }

  return config;
}
