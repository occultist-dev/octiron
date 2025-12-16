import type { OctironRoot, TypeDef } from "./types/octiron.js";
import { rootFactory } from "./factories/rootFactory.js";
import { makeTypeDefs } from "./utils/makeTypeDefs.js";
import { Store } from "./store.js";

export * from './types/common.js';
export * from './types/store.js';
export * from './types/octiron.js';
export * from './store.js';
export * from './utils/classes.js';
export * from './utils/makeTypeDef.js';
export * from './utils/makeTypeDefs.js';
export * from './handlers/jsonLDHandler.js';
export * from './handlers/longformHandler.js';
export * from './components/OctironJSON.js';
export * from './components/OctironDebug.js';
export * from './components/OctironExplorer.js';
export * from './components/OctironForm.js';
export * from './components/OctironSubmitButton.js';

/**
 * Creates a root octiron instance.
 */
export function octiron({
  typeDefs,
  ...storeArgs
}: ConstructorParameters<typeof Store>[0] & {
  // deno-lint-ignore no-explicit-any
  typeDefs?: TypeDef<any>[];
}): OctironRoot {
  const store = new Store(storeArgs);
  const config = typeDefs != null
    ? makeTypeDefs(store, ...typeDefs)
    : {};

  return rootFactory({
    store,
    typeDefs: config,
  });
}

octiron.fromInitialState = ({
  typeDefs,
  ...storeArgs
}: Parameters<typeof Store.fromInitialState>[0] & {
  // deno-lint-ignore no-explicit-any
  typeDefs?: TypeDef<any>[];
}) => {
  const store = Store.fromInitialState({
    ...storeArgs,
  });
  const config = typeDefs != null
    ? makeTypeDefs(store, ...typeDefs)
    : {};

  return rootFactory({
    store,
    typeDefs: config,
  });
}
