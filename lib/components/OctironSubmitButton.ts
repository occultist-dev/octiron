import m from 'mithril';
import type { OctironAction } from "../types/octiron.js";
import { classes } from "../utils/classes.js";

export type OctironSubmitButtonAttrs = {
  o: OctironAction;
  id?: string;
  class?: string;
};

export const OctironSubmitButton: m.ClosureComponent<
  OctironSubmitButtonAttrs
> = () => {
  return {
    view: ({ attrs, children }) => {
      return m(
        'button.oct-button.oct-submit-button',
        {
          id: attrs.id,
          type: 'submit',
          class: classes(attrs.class),
        },
        children,
      );
    },
  };
};
