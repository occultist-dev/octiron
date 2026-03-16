import {longform, processTemplate as templateParser} from '@longform/longform';
import type {Handler} from "../store.ts";

export const longformHandler: Handler = {
  integrationType: 'fragments',
  contentType: 'text/longform',
  templateParser,
  async handler({ res }) {
    return longform(await res.text());
  },
  hashParser(hash) {
    const [identifier, templateArgs] = hash.split(/\?(.*)/, 2);

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
