import type { JSONValue } from '../types/common.js';
import type { TypeHandler } from '../types/octiron.js';
/**
 * @description
 * Utility for creating a well typed typeHandler.
 *
 * @param typeHandler An object to property define the types for.
 */
export declare function makeTypeHandler<const Model extends JSONValue = JSONValue, const Type extends string = string>(typeHandler: TypeHandler<Model, Type>): TypeHandler<Model, Type>;
