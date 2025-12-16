import m from 'mithril';
import type { AnyComponent, Octiron } from "../types/octiron.js";
import { OctironDebug, OctironDebugPresentationStyle } from "./OctironDebug.js";


export type OctironExplorerAttrs = {
  autofocus?: boolean;
  selector?: string;
  presentationStyle?: OctironDebugPresentationStyle;
  childControls?: boolean;
  onChange?: (
    selector: string,
    presentationStyle: OctironDebugPresentationStyle,
  ) => void;
  location?: URL;
  o: Octiron;
};

export const OctironExplorer: m.ClosureComponent<OctironExplorerAttrs> = ({
  attrs,
}) => {
  let value: string = attrs.selector || '';
  let previousSelector: string = value;
  let selector: string = value;
  let presentationStyle: OctironDebugPresentationStyle = 'value';
  let onChange = attrs.onChange;
  const fallbackComponent: AnyComponent = {
    view: ({ attrs: { o } }) => {
      return m(OctironDebug, { o, location: attrs.location });
    },
  };

  function onSearch(evt: KeyboardEvent) {
    value = (evt.target as HTMLInputElement).value;
  }

  function onEnter(evt: KeyboardEvent) {
    if (evt.key === 'Enter') {
      onApply();
    }
  }

  function onApply() {
    selector = value;

    if (typeof onChange === 'function') {
      onChange(selector, presentationStyle);
    }
  }

  function onSetValue(evt: Event) {
    evt.preventDefault();
    presentationStyle = 'value';

    if (typeof onChange === 'function') {
      onChange(selector, presentationStyle);
    }
  }

  function onSetActionValue(evt: Event) {
    evt.preventDefault();
    presentationStyle = 'action-value';

    if (typeof onChange === 'function') {
      onChange(selector, presentationStyle);
    }
  }

  return {
    oninit: ({ attrs }) => {
      onChange = attrs.onChange;
    },
    onbeforeupdate: ({ attrs }) => {
      selector = attrs.selector ?? '';

      if (selector !== previousSelector) {
        value = previousSelector = selector;
      }

      onChange = attrs.onChange;
    },
    view: ({ attrs: { autofocus, o } }) => {
      let children: m.Children;
      let upURL: URL;
      let valueURL: URL;
      let actionValueURL: URL;

      if (selector.length !== 0 && presentationStyle === 'value') {
        children = o.root(selector, (o) => m(OctironDebug, {
          o,
          selector,
          location: attrs.location,
          initialPresentationStyle: attrs.presentationStyle,
          availableControls: !!attrs.childControls == false ? undefined : [],
        }));
      } else if (selector.length !== 0) {
        children = o.root(
          selector,
          (o) =>
            m('div', o.default({ fallbackComponent, attrs: { selector } })),
        );
      } else if (presentationStyle === 'value') {
        children = o.root((o) => m(OctironDebug, {
          o,
          selector,
          location: attrs.location,
          initialPresentationStyle: attrs.presentationStyle,
          availableControls: !!attrs.childControls ? undefined : [],
        }));
      } else {
        children = o.root((o) =>
          m('div', o.default({ fallbackComponent, attrs: { selector } }))
        );
      }

      if (attrs.location != null && selector.length !== 0) {
        const upSelector =
          attrs.selector.trim().includes(' ')
            ? attrs.selector.replace(/\s+([^\s]+)$/, '')
            : '';
        
        upURL = new URL(attrs.location);
        if (upSelector != null) {
          upURL.searchParams.set('selector', upSelector);
        } else {
          upURL.searchParams.delete('selector');
        }
      }

      if (attrs.location != null) {
        valueURL = new URL(attrs.location);
        actionValueURL = new URL(attrs.location);

        valueURL.searchParams.set('presentationStyle', 'value');
        actionValueURL.searchParams.set('presentationStyle', 'action-value');
      }

      return m('.oct-explorer', m('.oct-explorer-controls',
          m('form.oct-form-group', {
            action: attrs.location?.toString?.(),
            onsubmit: (evt: Event) => {
              evt.preventDefault();

              onApply();
            },
          }, [
            upURL != null
              ? m('a.oct-button', { href: upURL.toString() }, 'Up')
              : m('button.oct-button', { type: 'button', disabled: true }, 'Up'),
            m('input', {
              name: 'selector',
              value,
              autofocus,
              oninput: onSearch,
              onkeypress: onEnter,
            }),
            m(
              'button.oct-button',
              {
                type: 'submit',
                disabled: selector === value && typeof window !== 'undefined',
              },
              'Apply',
            ),
          ]),

          m('.oct-button-group',
            presentationStyle === 'value' || valueURL == null
              ? m('button.oct-button', {
                  type: 'button',
                  disabled: typeof window === 'undefined',
                  onclick: onSetValue,
                }, 'Value')
              : m('a.oct-button', {
                  href: valueURL.toString(),
                  onclick: onSetValue,
                }, 'Value'),

            presentationStyle === 'action-value' || actionValueURL == null
              ? m('button.oct-button', {
                  type: 'button',
                  disabled: typeof window === 'undefined',
                  onclick: onSetActionValue,
                }, 'Action value')
              : m('a.oct-button', {
                  href: actionValueURL.toString(),
                  onclick: onSetActionValue,
                }, 'Action value'),
          ),
        ),
        m('pre.oct-explorer-body', children),
      );
    },
  };
};
