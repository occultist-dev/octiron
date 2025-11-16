import type { Store } from "../store.ts";

export type SelectorObject = {
  fragment?: string;
  filter?: string;
};

const selectorRe = /\s*(?<subject>([^\[\s]+))(\[(?<filter>([^\]])+)\])?\s*/g;

/**
 * @description
 * Parses a selector string producing a selector list
 * The subject value of a selector could be an iri or a type depending on the
 * outer context.
 *
 * @param selector - The selector string to parse.
 */
export function parseSelectorString(selector: string, store: Store): SelectorObject[] {
  let match: RegExpExecArray | null;
  const selectors: SelectorObject[] = [];

  while ((match = selectorRe.exec(selector))) {
    const subject = match.groups?.subject;
    const filter = match.groups?.filter;

    if (typeof filter === 'string' && typeof subject === 'string') {
      selectors.push({
        subject: store.expand(subject),
        filter,
      });
    } else if (typeof subject === 'string') {
      selectors.push({
        subject: store.expand(subject),
      });
    } else {
      throw new Error(`Invalid selector: ${selector}`);
    }
  }

  return selectors;
}
