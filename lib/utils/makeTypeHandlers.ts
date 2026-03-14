import {makeStore, type StoreType} from "../store.ts";
import type {TypeHandler, TypeHandlers} from "../types/octiron.ts";


export function makeTypeHandlers<
  const Type extends string = string,
  // deno-lint-ignore no-explicit-any
  const TypeHandlerList extends TypeHandler<any, Type> = TypeHandler<any, Type>,
>(
  store: StoreType,
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
  storeOrTypeHandler: StoreType | TypeHandler<any, Type>,
  ...typeHandlers: Readonly<TypeHandlerList[]>
): TypeHandlers<Type, TypeHandlerList> {
  const config = {} as TypeHandlers<Type, TypeHandlerList>;

  if (storeOrTypeHandler.type === 'octiron-store') {
    for (const typeHandler of typeHandlers) {
      if (typeHandler.type === '@id') {
        config['@id'] = typeHandler;
      } else {
      // deno-lint-ignore no-explicit-any
        config[(storeOrTypeHandler as StoreType).expand(typeHandler.type)] = typeHandler;
      }
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
