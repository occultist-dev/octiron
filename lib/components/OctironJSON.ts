import m from 'mithril';
import type { JSONArray, JSONObject, JSONPrimitive, JSONValue } from "../types/common.js";
import { isJSONObject } from "../utils/isJSONObject.js";


export type OctironJSONAttrs = {
  // If given object keys will be rendered as clickable links to their own
  // selection. This is used by `OctironExplorer` to allow navigation of the
  // API serving the JSON-ld.
  selector?: string;

  // The JSON-ld value to render.
  value: JSONValue;

  location?: URL;
};

export const OctironJSON: m.ClosureComponent<OctironJSONAttrs> = () => {
  function renderIRI(iri: string) {
    return m('code', [
      m('span.oct-json-quote', '"'),
      m('a.oct-json-iri', {
        href: iri,
      }, iri),
      m('span.oct-json-quote', '"'),
    ]);
  }

  function renderPrimitive(value: JSONPrimitive) {
    const className = typeof value === 'boolean'
      ? 'oct-json-boolean'
      : typeof value === 'number'
      ? 'oct-json-number'
      : 'oct-json-string';

    let presentValue: m.Children;

    if (typeof value === 'boolean' && value) {
      presentValue = 'true';
    } else if (typeof value === 'boolean') {
      presentValue === 'false';
    } else if (typeof value === 'string') {
      presentValue = [
        m('span.oct-json-quote', '"'),
        value,
        m('span.oct-json-quote', '"'),
      ];
    } else {
      presentValue = value;
    }

    return m('code', { className }, presentValue);
  }

  function renderArray(list: JSONArray, url?: URL, selector: string = '') {
    const children: m.Children[] = [];

    for (let index = 0; index < list.length; index++) {
      const value = list[index];
      children.push(
        m(
          'li.oct-json-arr-item',
          maybeRenderDetails(null, value, url, selector),
        ),
      );
    }

    return m('ul.oct-json-arr', children);
  }

  const terminalTypes = ['@id', '@type', '@context'];
  function renderObject(value: JSONObject, url?: URL, selector: string = '') {
    const items: m.Children[] = [];
    const list = Object.entries(value);
    
    list.sort();

    for (let index = 0; index < list.length; index++) {
      const [term, value] = list[index];
      let children: m.Children;
      const summary = [
        m('span.oct-json-quote', '"'),
        m('span.oct-json-obj-key', term),
        m('span.oct-json-quote', '"'),
        m('span.oct-json-obj-colon', ': '),
      ];

      if (term === '@id') {
        children = [m('code', summary), renderIRI(value as string)];
      } else if (url == null || terminalTypes.includes(term)) {
        children = maybeRenderDetails(summary, value);
      } else if (term.startsWith('@')) {
        children = maybeRenderDetails(summary, value, url, selector);
      } else {
        const currentSelector = `${selector} ${term}`;
        const currentURL = new URL(url);

        currentURL.searchParams.set('selector', currentSelector);

        const summary = [
          m('span.oct-json-quote', '"'),
          m(
            'span.oct-json-obj-key',
            m(
              'a',
              { href: currentURL },
              term,
            ),
          ),
          m('span.oct-json-quote', '"'),
          m('span.oct-json-obj-colon', ': '),
        ];
        children = maybeRenderDetails(summary, value, url, currentSelector);
      }

      items.push(m('li.oct-json-obj-item', children));
    }

    return m('ul.oct-json-obj', items);
  }

  function maybeRenderDetails(
    summary: m.Children,
    value: JSONValue,
    url?: URL,
    selector: string = '',
  ) {
    if (isJSONObject(value)) {
      return [
        m(
          'details.oct-json-details',
          { open: true },
          m(
            'summary.oct-json-details-sum',
            m('code', summary, m('span.oct-json-obj-open', '{')),
          ),
          renderValue(value, url, selector),
        ),
        m('code.oct-json-obj-close', '}'),
      ];
    } else if (Array.isArray(value)) {
      return [
        m(
          'details.oct-json-details',
          { open: true },
          m(
            'summary.oct-json-details-sum',
            m('code', summary, m('span.oct-json-obj-open', '[')),
          ),
          renderValue(value, url, selector),
        ),
        m('code.oct-json-obj-close', ']'),
      ];
    }

    return [m('code', summary), renderValue(value, url, selector)];
  }

  function renderValue(value: JSONValue, url?: URL, selector: string = '') {
    if (isJSONObject(value)) {
      return renderObject(value, url, selector);
    } else if (Array.isArray(value)) {
      return renderArray(value, url, selector);
    }

    return renderPrimitive(value);
  }

  return {
    view: ({ attrs: { value, selector, location } }) => {
      const url = location != null ? new URL(location) : undefined;

      return m('.oct-json', [
        maybeRenderDetails(
          null,
          value,
          url,
          typeof selector === 'string' ? selector.trim() : undefined,
        ),
      ]);
    },
  };
};
