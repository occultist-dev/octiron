import type { OctironRoot, TypeDef } from "./types/octiron.ts";
import { rootFactory } from "./factories/rootFactory.ts";
import { makeTypeDefs } from "./utils/makeTypeDefs.ts";
import { Store } from "./store.ts";
import "./octiron.css";

export * from './types/common.ts';
export * from './types/store.ts';
export * from './types/octiron.ts';
export * from './store.ts';
export * from './utils/classes.ts';
export * from './utils/makeTypeDef.ts';
export * from './utils/makeTypeDefs.ts';
export * from './handlers/jsonLDHandler.ts';
export * from './handlers/longformHandler.ts';
export * from './components/OctironJSON.ts';
export * from './components/OctironDebug.ts';
export * from './components/OctironExplorer.ts';
export * from './components/OctironForm.ts';
export * from './components/OctironSubmitButton.ts';

/**
 * Creates a root octiron instance.
 */
export default function octiron({
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
