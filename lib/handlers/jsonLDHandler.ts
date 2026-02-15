import type {JSONLDContextStore} from "@occultist/mini-jsonld";
import type {JSONObject} from "../types/common.js";
import type { Handler } from "../types/store.js";

let store: JSONLDContextStore | undefined;

export const jsonLDHandler: Handler = {
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
};
