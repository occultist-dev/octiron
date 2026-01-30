import { Store } from "../store.js";
import type { TypeHandler, TypeHandlers } from "../types/octiron.js";
export declare function makeTypeHandlers<const Type extends string = string, const TypeHandlerList extends TypeHandler<any, Type> = TypeHandler<any, Type>>(store: Store, ...typeHandlers: Readonly<TypeHandlerList[]>): TypeHandlers<Type, TypeHandlerList>;
export declare function makeTypeHandlers<const Type extends string = string, const TypeHandlerList extends TypeHandler<any, Type> = TypeHandler<any, Type>>(...typeHandlers: Readonly<TypeHandlerList[]>): TypeHandlers<Type, TypeHandlerList>;
