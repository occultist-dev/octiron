import type {Handler} from "../store.ts";

export const longformHandler: Handler = {
  integrationType: 'fragments',
  contentType: 'text/longform',
  handler: async ({ res }) => {
    const { longform } = await import('@longform/longform');

    return longform(await res.text());
  },
  hashParser(hash) {
    const [identifier, templateArgs] = hash.split('?');

    if (templateArgs == null) {
      return {
        identifier,
      };
    }

    return {
      identifier,
      args: Object.fromEntries(new URLSearchParams(templateArgs).entries()),
    };
  },
};
