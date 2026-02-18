import { isBrowserRender } from "../consts.ts";
import m from 'mithril';
import type { HTMLCleanupFn, HTMLHandler, IntegrationState } from "../types/store.ts";
import type { Octiron } from "../types/octiron.ts";

export type HTMLIntegrationComponentAttrs = {
  o: Octiron,
  html: string;
  el?: Element;
  handler: HTMLHandler;
};

export type HTMLIntegrationComponentType = m.ComponentTypes<HTMLIntegrationComponentAttrs>;

export const HTMLIntegrationComponent: HTMLIntegrationComponentType = () => {
  let onRemove: HTMLCleanupFn;

  return {
    oncreate({ dom, attrs: { o, el, handler } }) {
      if (el != null) {
        dom.append(el);
      }

      if (handler.onCreate != null) {
        onRemove = handler.onCreate({
          o,
          dom,
          addFragmentListener: () => {},
        });
      }
    },
    onbeforeremove() {
      if (onRemove != null) {
        onRemove();
      }
    },
    view({ attrs: { html, el }}) {
      if (el != null) {
        return null;
      }

      return m.trust(html);
    },
  }
};

export type HTMLIntegrationArgs = {
  iri: string;
  contentType: string;
  html: string;
  id?: string;
  el?: Element;
};

export class HTMLIntegration implements IntegrationState {
  static type = 'html' as const;

  readonly integrationType = 'html' as const;

  #handler: HTMLHandler;
  #rendered: boolean = false;
  #iri: string;
  #contentType: string;
  #html: string;
  #id: string | undefined;
  #el: Element | undefined;

  constructor(handler: HTMLHandler, {
    iri,
    contentType,
    html,
    id,
    el,
  }: HTMLIntegrationArgs) {
    this.#handler = handler;
    this.#iri = iri;
    this.#contentType = contentType;
    this.#html = html;
    this.#id = id;
    this.#el = el;
  }

  get iri(): string {
    return this.#iri;
  }

  get contentType(): string {
    return this.#contentType;
  }

  public render(o: Octiron) {
    if (!isBrowserRender && !this.#rendered) {
      this.#rendered = true;
    }

    return m(HTMLIntegrationComponent, {
      o,
      html: this.#html,
      el: this.#el,
      handler: this.#handler,
    });
  }

  public getStateInfo() {
    return {
      iri: this.#iri,
      contentType: this.#contentType,
      id: this.#id,
    };
  }

  public toInitialState(): string {
    if (this.#id != null && this.#rendered) {
      return '';
    }

    return `<template id="html:${this.#iri}|${this.#contentType}">${this.#html}</template>\n`;
  }

  static fromInitialState(handler: HTMLHandler, {
    iri,
    contentType,
    id,
  }: {
    iri: string,
    contentType: string,
    id?: string,
  }): HTMLIntegration | null {
    let el: Element | null = null;

    if (id != null) {
      el = document.getElementById(id);
    }

    if (el != null) {
      return new HTMLIntegration(handler, {
        iri,
        contentType,
        html: el.outerHTML,
        id,
        el,
      });
    }

    el = document.getElementById(`html:${iri}|${contentType}`);

    if (el instanceof HTMLTemplateElement) {
      el = el.cloneNode(true) as Element;

      return new HTMLIntegration(handler, {
        iri,
        contentType,
        html: el.outerHTML,
        id,
        el,
      });
    }

    return null;
  }

}
