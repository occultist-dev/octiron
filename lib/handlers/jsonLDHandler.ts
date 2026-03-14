import type {JSONLDContextStore, JSONObject} from "@occultist/mini-jsonld";
import type { JSONLDHandler } from "../store.ts";

let store: JSONLDContextStore | undefined;

export type MakeJSONLDHandlerArgs = {
  store?: JSONLDContextStore,
};

export const makeJSONLDHandler = (args?: MakeJSONLDHandlerArgs): JSONLDHandler => {
  if (args?.store != null) {
    store = args.store;
  }

  return {
    integrationType: 'jsonld',
    contentType: 'application/ld+json',
    handler: async ({ res }) => {
      const { expand, JSONLDContextStore } = await import('@occultist/mini-jsonld');
  
      if (store == undefined) {
        store = new JSONLDContextStore({ cacheMethod: 'cache' });
      }
  
      const json = await res.json();

      return expand(json, { store, url: res.url }) as Promise<JSONObject>;
    },
  } satisfies JSONLDHandler;
}
