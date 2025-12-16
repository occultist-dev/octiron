import m from 'mithril';
import { mithrilRedraw } from "../utils/mithrilRedraw.js";
import type { JSONObject } from "../types/common.js";
import type { Octiron } from "../types/octiron.js";
import { OctironJSON } from "./OctironJSON.js";

export type OctironDebugPresentationStyle =
  | 'value'
  | 'action-value'
  | 'component'
  | 'log'
;

export type OctironDebugAttrs = {
  o: Octiron;
  selector?: string;
  location?: URL;
  initialPresentationStyle?: OctironDebugPresentationStyle;
  availableControls?: OctironDebugPresentationStyle[];
};

export const OctironDebug: m.ClosureComponent<OctironDebugAttrs> = ({
  attrs,
}) => {
  let currentAttrs = attrs;
  let value = attrs.o.value as JSONObject;
  let rendered: m.Children;
  let presentationStyle: OctironDebugPresentationStyle = attrs.initialPresentationStyle ?? 'value';

  function onRender(redraw: boolean = true) {
    const { o } = currentAttrs;
    if (presentationStyle === 'value') {
      rendered = m(OctironJSON, {
        value,
        selector: currentAttrs.selector,
        location: currentAttrs.location,
      });
    } else if (
      presentationStyle === 'action-value' && (
        o.octironType === 'action' ||
        o.octironType === 'action-selection'
      )
    ) {
      rendered = m(OctironJSON, { value: o.actionValue.value, selector: currentAttrs.selector, location: currentAttrs.location })
    }
    if (redraw) {
      mithrilRedraw();
    }
  }

  function onSetValue(e: MouseEvent & { redraw: boolean }) {
    e.redraw = false;
    presentationStyle = 'value';

    onRender();
  }

  function onSetActionValue(e: MouseEvent & { redraw: boolean }) {
    e.redraw = false;
    presentationStyle = 'action-value';

    onRender();
  }

  function onSetComponent(e: MouseEvent & { redraw: boolean }) {
    e.redraw = false;
    presentationStyle = 'component';

    onRender();
  }

  return {
    oninit: ({ attrs }) => {
      currentAttrs = attrs;

      onRender(false);
    },
    onbeforeupdate: ({ attrs }) => {
      if (attrs.o.value !== value) {
        value = attrs.o.value as JSONObject;

        onRender(true);
      }
    },
    view: ({ attrs: { o, availableControls } }) => {
      let children: m.Children;
      let actionValueAction: m.Children;
      const controls: m.Children = [];

      if (presentationStyle === 'component') {
        children = m('.oct-debug-body', o.default());
      } else {
        children = m('.oct-debug-body', rendered);
      }

      if (o.octironType === 'action' || o.octironType === 'action-selection') {
        actionValueAction = m('button.oct-button', { type: 'button', onclick: onSetActionValue }, 'Action value');
      }

      if (availableControls == null || availableControls.includes('value')) {
        controls.push(
            m('button.oct-button', { type: 'button', onclick: onSetValue }, 'Value'),
        );
      } else if (
        actionValueAction != null && (
          availableControls == null ||
          availableControls.includes('action-value')
      )) {
        controls.push(actionValueAction);
      } else if (availableControls == null || availableControls.includes('component')) {
        controls.push(
            m('button.oct-button', { type: 'button', onclick: onSetComponent }, 'Component'),
        );
      } else if (availableControls == null || availableControls.includes('log')) {
        controls.push(
            m('button.oct-button', { type: 'button', onclick: () => console.debug(o) }, 'Log'),
        );
      }

      return m(
        'aside.oct-debug',
        m(
          '.oct-debug-controls',
          m(
            '.oct-button-group',
            ...controls,
          ),
        ),
        children,
      );
    },
  };
};
