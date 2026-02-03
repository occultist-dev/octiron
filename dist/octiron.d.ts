import type { OctironRoot, TypeHandler } from "./types/octiron.js";
import { Store } from "./store.js";
export * from './types/common.js';
export * from './types/store.js';
export * from './types/octiron.js';
export * from './store.js';
export * from './utils/classes.js';
export * from './utils/makeTypeHandler.js';
export * from './utils/makeTypeHandlers.js';
export * from './handlers/jsonLDHandler.js';
export * from './handlers/longformHandler.js';
export * from './handlers/problemDetailsJSONHandler.js';
export * from './components/OctironJSON.js';
export * from './components/OctironDebug.js';
export * from './components/OctironExplorer.js';
export * from './components/OctironForm.js';
export * from './components/OctironSubmitButton.js';
/**
 * Creates a root octiron instance.
 */
export declare function octiron({ typeHandlers, ...storeArgs }: ConstructorParameters<typeof Store>[0] & {
    typeHandlers?: TypeHandler<any>[];
}): OctironRoot;
export declare namespace octiron {
    var fromInitialState: ({ typeHandlers, ...storeArgs }: Parameters<typeof Store.fromInitialState>[0] & {
        typeHandlers?: TypeHandler<any>[];
    }) => OctironRoot;
}
