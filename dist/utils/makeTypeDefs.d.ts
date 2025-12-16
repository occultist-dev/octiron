import { Store } from "../store.js";
import type { TypeDef, TypeDefs } from "../types/octiron.js";
export declare function makeTypeDefs<const Type extends string = string, const TypeDefList extends TypeDef<any, Type> = TypeDef<any, Type>>(store: Store, ...typeDefs: Readonly<TypeDefList[]>): TypeDefs<Type, TypeDefList>;
export declare function makeTypeDefs<const Type extends string = string, const TypeDefList extends TypeDef<any, Type> = TypeDef<any, Type>>(...typeDefs: Readonly<TypeDefList[]>): TypeDefs<Type, TypeDefList>;
