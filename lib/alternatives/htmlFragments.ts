import m from 'mithril';
import {processTemplate} from '@longform/longform';
import type { HTMLFragmentsHandler, HTMLFragmentsHandlerResult, IntegrationState } from "../types/store.ts";
import type { Octiron } from "../types/octiron.ts";
import {isBrowserRender} from '../consts.ts';

function fragmentToHTML(fragment: DocumentFragment) {
  let html: string = '';

  for (let i = 0; i < fragment.children.length; i++) {
    html += fragment.children[i].outerHTML;
  }

  return html;
}

function cloneFragment(fragment: DocumentFragment) {
  const dom = document.createDocumentFragment();

  for (let i = 0; i < fragment.children.length; i++) {
    dom.appendChild(fragment.children[i].cloneNode(true));
  }

  return dom;
}

export type HTMLFragmentsIntegrationComponentAttrs = {
  o: Octiron;
  integration: HTMLFragmentsIntegration;
  fragment?: string;
  output: HTMLFragmentsHandlerResult;
};

export type HTMLFragmentsIntegrationComponentType = m.ComponentTypes<HTMLFragmentsIntegrationComponentAttrs>;

export const HTMLFragmentsIntegrationComponent: HTMLFragmentsIntegrationComponentType = () => {
  let fragment: string | undefined;
  let html: string | DocumentFragment | undefined;

  function setDomServer(attrs: HTMLFragmentsIntegrationComponentAttrs) {
    if (fragment === attrs.fragment) {
      return;
    }
    fragment = attrs.fragment;
    
    if (attrs.fragment == null) {
      html = attrs.output.root;
      return;
    }

    const [id, rest] = attrs.fragment.split('?');

    if (rest == null) {
      html = attrs.output.fragments[id]?.html;
      return;
    }

    const template = attrs.output.templates[id];

    if (template == null) {
      return;
    }

    try {
      const args = Object.fromEntries(new URLSearchParams(rest));

      html = processTemplate(template, args, (fragment) => {
        return attrs.output.fragments[fragment]?.html;
      });
    } catch (err) {
      console.error(err);
    }
  }

  function setDomClient(attrs: HTMLFragmentsIntegrationComponentAttrs) {
    if (attrs.fragment == null) {
      html = attrs.output.dom;

      return;
    }

    const [id, rest] = attrs.fragment.split('?');

    if (rest == null) {
      const fragment = attrs.output.fragments[id];

      if (fragment == null) {
        return;
      } else if (fragment.type === 'text') {
        html = fragment.html;

        return;
      } else if (fragment.dom == null) {
        return;
      }

      html = cloneFragment(fragment.dom);

      return;
    }

    const template = attrs.output.templates[id];

    if (template == null) {
      return;
    }

    try {
      const args = Object.fromEntries(new URLSearchParams(rest));
    
      html = processTemplate(template, args, (ref) => {
        if (attrs.output.fragments[ref] != null &&
            attrs.output.fragments[ref].html == null &&
            attrs.output.fragments[ref].dom != null
        ) {
          attrs.output.fragments[ref].html = fragmentToHTML(attrs.output.fragments[ref].dom);
        }

        return attrs.output.fragments[ref]?.html;
      });
    } catch (err) {
      console.error(err);
    }
  }

  return {
    oninit({ attrs }) {
      if (isBrowserRender) {
        setDomClient(attrs);
      } else {
        setDomServer(attrs);
      }
    },
    view() {
      if (isBrowserRender && html instanceof DocumentFragment) {
        return m.dom(html);
      } else if (html != null) {
        return m.trust(html);
      }

      return null;
    },
  };
};

export type HTMLFragmentsIntegrationArgs = {
  iri: string;
  contentType: string;
  output: HTMLFragmentsHandlerResult;
};

export type FragmentState = {
  type: 'embed' | 'bare' | 'range';
  id: string;
  rendered: boolean;
  selector: string;
};

type HTMLFragmentsStateInfo = {
  iri: string,
  contentType: string,
  rendered?: boolean;
  selector?: string;
  fragments: FragmentState[];
  texts: Record<string, string>;
  templates: Record<string, string>;
};

export class HTMLFragmentsIntegration implements IntegrationState {
  static type = 'html-fragments' as const;

  readonly integrationType = 'html-fragments' as const;

  #rootRendered: boolean = false;
  #rendered: Set<string> = new Set();
  #iri: string;
  #contentType: string;
  #handler: HTMLFragmentsHandler;
  #output: HTMLFragmentsHandlerResult;

  constructor(handler: HTMLFragmentsHandler, {
    iri,
    contentType,
    output,
  }: HTMLFragmentsIntegrationArgs) {
    this.#handler = handler;
    this.#iri = iri;
    this.#contentType = contentType;
    this.#output = output;
  }

  get iri(): string {
    return this.#iri;
  }

  get contentType(): string {
    return this.#contentType;
  }

  get output(): HTMLFragmentsHandlerResult {
    return this.#output;
  }

  getFragment(fragment?: string): string | Node | null {
    return fragment != null
      ? this.#output.fragments[fragment]?.html ?? null
      : this.#output.root ?? null;
  }

  #fragmentHTML(fragment: DocumentFragment): string {
    let html = '';

    for (let i = 0; i < fragment.children.length; i++) {
      html += fragment.children[i].outerHTML;
    }

    return html;
  }

  /**
   * Returns a text representaion of a fragment.
   */
  public text(fragment?: string): string | undefined {
    if (fragment == null) {
      if (this.output.root == null && this.#output.dom) {
        this.output.root = this.#fragmentHTML(this.#output.dom);
      }

      return this.output.root;
    }

    const [id, rest] = fragment.split('?');

    if (rest == null) {
      const fragment = this.#output.fragments[id];

      if (fragment == null) {
        return;
      }

      if (fragment.html == null && fragment.dom) {
        fragment.html = this.#fragmentHTML(fragment.dom);
      }

      return fragment.html;
    }

    const template = this.#output.templates[id];

    if (template == null) {
      return;
    }
    
    try {
      const args = Object.fromEntries(new URLSearchParams(rest));

      return processTemplate(
        template,
        args,
        (ref) => {
          const fragment = this.#output.fragments[ref];
          if (fragment == null) return;
          if (fragment.html == null && fragment.dom != null) {
            fragment.html = this.#fragmentHTML(fragment.dom);
          }

          return fragment.html;
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  public render(o: Octiron, fragment?: string) {
    if (fragment == null) {
      this.#rootRendered = true;
    } else {
      this.#rendered.add(fragment);
    }

    return m(HTMLFragmentsIntegrationComponent, {
      o,
      integration: this,
      fragment,
      output: this.#output,
    });
  }

  public getStateInfo(): HTMLFragmentsStateInfo {
    const texts: Record<string, string> = {};
    const fragments: FragmentState[] = [];
    const entries = Object.values(this.#output.fragments);

    for (let i = 0; i < entries.length; i++) {
      if (entries[i].type === 'text') {
        texts[entries[i].id] = entries[i].html as string;
      } else {
        fragments.push({
          id: entries[i].id,
          type: entries[i].type as 'embed' | 'bare' | 'range',
          selector: entries[i].selector,
          rendered: this.#rendered.has(entries[i].id),
        });
      }
    }

    return {
      iri: this.#iri,
      contentType: this.#contentType,
      rendered: this.#rootRendered,
      selector: this.#output.selector,
      templates: this.#output.templates,
      texts,
      fragments,
    };
  }

  public toInitialState(): string {
    let html = '';
    const entries = Object.values(this.#output.fragments);

    if (this.#output.root != null && !this.#rootRendered) {
      html += `<template id="htmlfrag:${this.#iri}|${this.#contentType}">${this.#output.root}</template>\n`;
    }

    for (let i = 0; i < entries.length; i++) {
      if (entries[i].type === 'text') {
        continue;
      }

      if (!this.#rendered.has(entries[i].id)) {
        html += `<template data-htmlfrag="${entries[i].id}">${entries[i].html}</template>\n`;
      } 
    }

    return html;
  }

  static fromInitialState(handler: HTMLFragmentsHandler, {
    iri,
    contentType,
    rendered,
    selector,
    texts,
    fragments,
    templates,
  }: HTMLFragmentsStateInfo): HTMLFragmentsIntegration | null {
    const output: HTMLFragmentsHandlerResult = Object.create(null);

    output.fragments = Object.create(null);
    output.templates = templates;

    if (selector != null && rendered) {
      const element = document.querySelector(selector);

      if (element != null) {
        output.root = element.outerHTML;
      }
    } else if (selector != null) {
      const template = document.getElementById(`htmlfrag:${iri}|${contentType}`);

      output.root = template?.textContent;
    }

    const textEntries = Object.entries(texts);

    for (let i = 0; i < textEntries.length; i++) {
      output.fragments[textEntries[i][0]] = {
        id: textEntries[i][0],
        type: 'text',
        html: textEntries[i][1],
        selector: '',
      };
    }

    for (let i = 0; i < fragments.length; i++) {
      const fragment = fragments[i];
      const dom = document.createDocumentFragment();

      if (fragment.rendered) {
        let element: Element | undefined;

        switch (fragment.type) {
          case 'embed': {
            element = document.getElementById(fragment.id) as Element;

            if (element == null) {
              break;
            }
            
            performance.mark('octiron:clone-embed-start');
            dom.appendChild(element.cloneNode(true));
            performance.mark('octiron:clone-embed-end');
            performance.measure(
              'octiron:clone-embed-duration',
              'octiron:clone-embed-start',
              'octiron:clone-embed-end',
            );

            output.fragments[fragment.id] = {
              id: fragment.id,
              type: fragment.type,
              dom,
              selector: fragment.selector,
            };
            break;
          }
          case 'bare': {
            element = document.querySelector(fragment.selector) as Element;

            if (element == null) {
              break;
            }

            dom.appendChild(element.cloneNode(true));

            output.fragments[fragment.id] = {
              id: fragment.id,
              type: fragment.type,
              dom,
              selector: fragment.selector,
            };
            break;
          }
          case 'range': {
            const elements = document.querySelectorAll(fragment.selector);

            dom.append(...elements);

            output.fragments[fragment.id] = {
              id: fragment.id,
              type: fragment.type,
              selector: fragment.selector,
              dom,
            };
          }
        }
      } else {
        const template = document.querySelector(`[data-htmlfrag="${fragment.id}"]`) as HTMLTemplateElement;
        
        if (template == null) {
          continue;
        }

        dom.append(...template.content.children);

        output.fragments[fragment.id] = {
          id: fragment.id,
          type: fragment.type,
          dom,
          selector: fragment.selector,
        };
      }
    }

    return new HTMLFragmentsIntegration(handler, {
      contentType,
      iri,
      output,
    });
  }
}
