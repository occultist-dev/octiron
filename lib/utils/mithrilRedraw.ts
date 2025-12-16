import m from 'mithril';
import { isBrowserRender } from "../consts.js";

/**
 * @description
 * Calls Mithril's redraw function if the window object exists.
 */
export function mithrilRedraw(): void {
  if (isBrowserRender) {
    m.redraw();
  }
}
