import type {JSONObject} from "../types/common.js";
import type { Handler } from "../types/store.js";


export const jsonLDHandler: Handler = {
  integrationType: 'jsonld',
  contentType: 'application/ld+json',
  handler: async ({ res }) => {
    const { expand } = await import('@occultist/mini-jsonld');

    const json = await res.json();
    const jsonld = await expand(json) as JSONObject;

    return {
      jsonld,
    };
  },
};
