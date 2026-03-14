import type {Handler} from "../store.ts";

export const longformHandler: Handler = {
  integrationType: 'fragments',
  contentType: 'text/longform',
  handler: async ({ res }) => {
    const { longform } = await import('@longform/longform');

    return longform(await res.text());
  },
};
