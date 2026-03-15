import type { OctironRoot, TypeHandler } from "./types/octiron.ts";
import { makeStore, type MakeStoreArgs } from "./store.ts";
export * from './types/common.ts';
export * from './types/store.ts';
export * from './types/octiron.ts';
export * from './utils/classes.ts';
export * from './utils/makeTypeHandler.ts';
export * from './utils/makeTypeHandlers.ts';
export * from './handlers/jsonLDHandler.ts';
export * from './handlers/longformHandler.ts';
export * from './handlers/problemDetailsJSONHandler.ts';
export * from './components/OctironJSON.ts';
export * from './components/OctironDebug.ts';
export * from './components/OctironExplorer.ts';
export * from './components/OctironForm.ts';
export * from './components/OctironSubmitButton.ts';
export type OctironArgs = {
    typeHandlers?: TypeHandler<any>[];
} & MakeStoreArgs;
/**
 * Creates a root octiron instance.
 */
export declare function octiron({ typeHandlers, ...storeArgs }: OctironArgs): OctironRoot;
export declare namespace octiron {
    var fromInitialState: ({ typeHandlers, ...storeArgs }: Parameters<typeof makeStore.fromInitialState>[0] & {
        typeHandlers?: TypeHandler<any>[];
    }) => OctironRoot;
}
