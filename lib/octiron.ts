import type { OctironRoot, TypeHandler } from "./types/octiron.ts";
import { rootFactory } from "./factories/rootFactory.ts";
import { makeTypeHandlers } from "./utils/makeTypeHandlers.ts";
import {makeStore, type MakeStoreArgs} from "./store.ts";

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
export function octiron({
  typeHandlers,
  ...storeArgs
}: OctironArgs): OctironRoot {
  const store = makeStore(storeArgs);
  const config = typeHandlers != null
    ? makeTypeHandlers(store, ...typeHandlers)
    : {};

  return rootFactory({
    store,
    typeHandlers: config,
  })[0];
}

octiron.fromInitialState = ({
  typeHandlers,
  ...storeArgs
}: Parameters<typeof makeStore.fromInitialState>[0] & {
  // deno-lint-ignore no-explicit-any
  typeHandlers?: TypeHandler<any>[];
}) => {
  const store = makeStore.fromInitialState({
    ...storeArgs,
  });
  const config = typeHandlers != null
    ? makeTypeHandlers(store, ...typeHandlers)
    : {};

  return rootFactory({
    store,
    typeHandlers: config,
  })[0];
}
