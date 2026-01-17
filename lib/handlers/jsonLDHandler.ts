import type {JSONObject} from "../types/common.js";
import type { Handler } from "../types/store.js";
import { expand } from '@occultist/mini-jsonld';


export const jsonLDHandler: Handler = {
  integrationType: 'jsonld',
  contentType: 'application/ld+json',
  handler: async ({ res }) => {
    const json = await res.json();
    const jsonld = await expand(json) as JSONObject;

    return {
      jsonld,
    };
  },
};
