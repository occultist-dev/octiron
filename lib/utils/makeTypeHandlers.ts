import { Store } from "../store.js";
import type { TypeHandler, TypeHandlers } from "../types/octiron.js";


export function makeTypeHandlers<
  const Type extends string = string,
  // deno-lint-ignore no-explicit-any
  const TypeHandlerList extends TypeHandler<any, Type> = TypeHandler<any, Type>,
>(
  store: Store,
  ...typeHandlers: Readonly<TypeHandlerList[]>
): TypeHandlers<Type, TypeHandlerList>;

export function makeTypeHandlers<
  const Type extends string = string,
  // deno-lint-ignore no-explicit-any
  const TypeHandlerList extends TypeHandler<any, Type> = TypeHandler<any, Type>,
>(
  ...typeHandlers: Readonly<TypeHandlerList[]>
): TypeHandlers<Type, TypeHandlerList>;

/**
 * @description
 * Aggregates a list of type handlers into an easier to access
 * type handler config object.
 *
 * @param typeHandlers The type handlers to aggregate.
 */
export function makeTypeHandlers<
  const Type extends string = string,
  // deno-lint-ignore no-explicit-any
  const TypeHandlerList extends TypeHandler<any, Type> = TypeHandler<any, Type>,
>(
  // deno-lint-ignore no-explicit-any
  storeOrTypeHandler: Store | TypeHandler<any, Type>,
  ...typeHandlers: Readonly<TypeHandlerList[]>
): TypeHandlers<Type, TypeHandlerList> {
  const config = {} as TypeHandlers<Type, TypeHandlerList>;

  if (storeOrTypeHandler instanceof Store) {
    for (const typeHandler of typeHandlers) {
      // deno-lint-ignore no-explicit-any
      (config as any)[storeOrTypeHandler.expand(typeHandler.type)] = typeHandler;
    }
  } else {
    // deno-lint-ignore no-explicit-any
    (config[storeOrTypeHandler.type] as any) = storeOrTypeHandler;
    for (const typeHandler of typeHandlers) {
      // deno-lint-ignore no-explicit-any
      (config as any)[typeHandler.type] = typeHandler;
    }
  }

  return config;
}
