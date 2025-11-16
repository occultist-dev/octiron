import type { Handler } from "../types/store.ts";
import { longform } from '@longform/longform';

export const longformHandler: Handler = {
  integrationType: 'html-fragments',
  contentType: 'text/longform',
  handler: async ({ res }) => {
    return longform(await res.text());
  },
};
