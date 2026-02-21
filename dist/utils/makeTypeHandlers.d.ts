import { Store } from "../store.ts";
import type { TypeHandler, TypeHandlers } from "../types/octiron.ts";
export declare function makeTypeHandlers<const Type extends string = string, const TypeHandlerList extends TypeHandler<any, Type> = TypeHandler<any, Type>>(store: Store, ...typeHandlers: Readonly<TypeHandlerList[]>): TypeHandlers<Type, TypeHandlerList>;
export declare function makeTypeHandlers<const Type extends string = string, const TypeHandlerList extends TypeHandler<any, Type> = TypeHandler<any, Type>>(...typeHandlers: Readonly<TypeHandlerList[]>): TypeHandlers<Type, TypeHandlerList>;
