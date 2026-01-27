import type { Handler } from "../types/store.js";

export const longformHandler: Handler = {
  integrationType: 'html-fragments',
  contentType: 'text/longform',
  handler: async ({ res }) => {
    const { longform } = await import('@longform/longform');

    return longform(await res.text());
  },
};
