import type {JSONLDContextStore} from "@occultist/mini-jsonld";
import type {JSONObject} from "../types/common.ts";
import type { JSONLDHandler } from "../types/store.ts";

let store: JSONLDContextStore | undefined;

export type MakeJSONLDHandlerArgs = {
  store?: JSONLDContextStore,
};

export const makeJSONLDHandler = (args: MakeJSONLDHandlerArgs): JSONLDHandler => {
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
      const jsonld = await expand(json, { store, url: res.url }) as JSONObject;
  
      return {
        jsonld,
      };
    },
  } satisfies JSONLDHandler;
}
