import type { Handler } from "../types/store.js";
import { isJSONObject } from '../utils/isJSONObject.js';
import jsonld from 'jsonld';


export const jsonLDHandler: Handler = {
  integrationType: 'jsonld',
  contentType: 'application/ld+json',
  handler: async ({ res }) => {
    const json = await res.json();

    // cannot use json-ld ops on scalar types
    if (!isJSONObject(json) && !Array.isArray(json)) {
      throw new Error('JSON-LD Document should be an object');
    }

    const expanded = await jsonld.expand(json, {
      documentLoader: async (url: string) => {
        const res = await fetch(url, {
          headers: {
            'accept': 'application/ld+json',
          }
        });
        const document = await res.json();

        return {
          documentUrl: url,
          document,
        };
      }
    });

    const compacted = await jsonld.compact(expanded, {});

    return {
      jsonld: compacted,
    };
  },
};
