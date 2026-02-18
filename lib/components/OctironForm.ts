import m from 'mithril';
import type { OctironAction } from "../types/octiron.ts";

export type OctironFormAttrs = {
  o: OctironAction;
  id?: string;
  class?: string;
};

export const OctironForm: m.ClosureComponent<OctironFormAttrs> = (vnode) => {
  const o = vnode.attrs.o;
  const method = o.method?.toUpperCase() as 'GET' || 'POST' || 'GET';
  const enctypes = {
    GET: 'application/x-www-form-urlencoded',
    POST: 'multipart/form-data',
  } as const;

  return {
    view: ({ attrs: { o, ...attrs }, children }) => {
      return m(
        'form.oct-form',
        {
          ...attrs,
          method,
          enctype: enctypes[method || 'GET'],
          action: o.url,
          onsubmit: (evt: SubmitEvent) => {
            evt.preventDefault();

            o.submit();
          },
        },
        children,
      );
    },
  };
};
