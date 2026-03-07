import m from 'mithril';
import {RequestHandler} from '../octiron';
import {isBrowserRender} from '../consts';


export type OnRendered = () => void;

export type ElementHashParser<
  ParsedHash extends unknown = string,
> = (fragment: string) => ParsedHash;

export type ElementFragmentChangeHandler<
  ParsedHash extends unknown = string,
> = (fragmentValue: ParsedHash, fragment: string) => void;

export type ElementRemoveHandler = () => void;

export type ElementCreateContext<ParsedHash extends unknown = string> = {
  fragment?: string;
  fragmentValue: ParsedHash | string;
  dom: Element;
};

export type ElementCreateHandler = (context: ElementCreateContext) => undefined | {
  onFragmentChange: ElementFragmentChangeHandler;
  onRemove: ElementRemoveHandler;
};

export type ElementRendererAttrs = {
  dom: Element;
  fragment: string;
  hashParser: ElementHashParser;
  createHandler?: ElementCreateHandler;
  onRendered: OnRendered;
};

export type ElementRendererState = {
  fragment: string;
  onFragmentChange?: ElementFragmentChangeHandler;
  onRemove?: ElementRemoveHandler;
  context?: ElementCreateContext;
};

export const ElementRenderer: m.Component<ElementRendererAttrs, ElementRendererState> = {
  oninit(vnode) {
    if (!isBrowserRender) {
      vnode.attrs.onRendered();
    }
  },
  oncreate(vnode) {
    if (vnode.attrs.createHandler != null) {
      const fragmentValue = vnode.attrs.hashParser !== null
        ? vnode.attrs.hashParser(vnode.attrs.fragment)
        : '';

      vnode.state.context = {
        dom: vnode.dom,
        fragment: vnode.attrs.fragment,
        fragmentValue,
      };

      const result = vnode.attrs.createHandler(vnode.state.context);

      if (result?.onFragmentChange != null) {
        vnode.state.onFragmentChange = result.onFragmentChange;
      }
      if (result?.onRemove != null) {
        vnode.state.onRemove = result.onRemove;
      }
    }
  },
  onbeforeupdate(vnode) {
    if (vnode.state.onFragmentChange != null &&
        vnode.attrs.fragment !== vnode.attrs.fragment) {
      const fragmentValue = vnode.attrs.hashParser !== null
        ? vnode.attrs.hashParser(vnode.attrs.fragment)
        : '';

      vnode.state.context.fragment = vnode.attrs.fragment;
      vnode.state.context.fragmentValue = fragmentValue;
      vnode.state.onFragmentChange(fragmentValue, vnode.attrs.fragment);
      vnode.state.fragment = vnode.attrs.fragment;
    }
  },
  onbeforeremove(vnode) {
    if (vnode.state.onRemove != null) vnode.state.onRemove();
  },
  view(vnode) {
    return m.dom(vnode.attrs.dom);
  },
};

export type SerializableElementHandlerResult = {
  html: string;
  selector: string;
};

export type ElementHandlerResult = {
  html: string;
  selector: string;
  dom: Element;
};

/**
 * Details about the integrated content which are
 * written into the server rendered HTML for client
 * side initial state.
 */
export type ElementStateInfo = {
  iri: string;
  method: string;
  contentType: string;
  rendered: boolean;
  selector: string;
};

export type ElementHandler<
  ParsedHash extends unknown = '',
> = {
  integrationType: 'element',
  contentType: string;
  handler: RequestHandler<SerializableElementHandlerResult>;

  /**
   * The fragment parser is run on every fragment update and
   * written to the create handler context as the `fragmentValue`.
   * If omitted the `fragmentValue` defaults to the fragment string.
   */
  hashParser?: ElementHashParser<ParsedHash>;
  
  /**
   * Runs once the element is created in a DOM environment.
   */
  createHandler?: ElementCreateHandler;
};

export type ElementIntegrationArgs = {

  /**
   * The IRI of the content.
   */
  iri: string;

  /**
   * The HTTP method used to retrieve the content.
   */
  method: string;

  /**
   * The HTTP content type.
   */
  contentType: string;

  /**
   * The processed content.
   */
  content: ElementHandlerResult;
};

export interface ElementIntegrationType {
  
  /**
   * The IRI of the content.
   */
  iri: string;

  /**
   * The HTTP method used to retrieve the content.
   */
  method: string;

  /**
   * The HTTP content type.
   */
  contentType: string;

  /**
   * Returns the vdom representation of the fragment.
   *
   * @param hash The URL hash.
   */
  render(hash?: string): m.Children;

  /**
   * Returns the state info used for re-constructing the element
   * in a DOM environment from server side rendered document.
   */
  getStateInfo(): ElementStateInfo;

  /**
   * Returns a HTML string containing all content so the entire HTML
   * fragments content can be re-constructed in the browser. The 
   * HTML fragments integration can reuse DOM created when processing
   * the original HTML document where root, embedded, bare and range
   * fragment types are used and when they are rendered into the HTML
   * document.
   *
   * All other fragment types and un-rendered fragments must be written
   * into the initial state so they are available for client side
   * rendering.
   */
  toInitialState(): string;

};

export interface ElementIntegrationFactory {

  /**
   * The integration type this factory produces.
   */
  type: 'element';

  /**
   * The element integration is used with media types that support 
   * being written as one blob to a single HTML element.
   *
   * The element integration's most powerful feature is the ability
   * to hook into Octiron form changes when those changes are targeting
   * the hash value of the target URI.
   *
   * The integration can listen to changes in the hash, process the hash
   * as according to the configured media-type rules and dynamically
   * update the contents of the rendered HTML.
   *
   * @param handler The content type's handler configuration.
   * @param args The fragments integration args.
   */
  (handler: ElementHandler, args: ElementIntegrationArgs): ElementIntegrationType;

  /**
   * Creates a elements integration from initial state rendered into a
   * HTML document.
   *
   * @param stateInfo 
   * @param handler The content type's handler configuration.
   */
  fromInitialState: (stateInfo: ElementStateInfo, handler: ElementHandler) => ElementIntegrationType;
};

export const ElementIntegration = ((
  handler: ElementHandler,
  args: ElementIntegrationArgs,
): Readonly<ElementIntegrationType> => {
  let rendered = false;
  const hashParser = handler.hashParser;
  const createHandler = handler.createHandler;
  const html = args.content.html;
  let dom: Element | null | undefined = args.content.dom;

  const onRendered: OnRendered = () => {
    rendered = true;
  };

  const integration: ElementIntegrationType = {
    iri: args.iri,
    method: args.method,
    contentType: args.contentType,
    render(hash: string): m.Children {
      if (dom === undefined) {
        const template = document.createElement('template');
        template.innerHTML = html;
        dom = template.content.children[0] ?? null;
      }

      if (dom === null) return;

      return m(ElementRenderer, {
        dom: dom as Element,
        fragment: hash,
        hashParser,
        createHandler,
        onRendered,
      });
    },
    getStateInfo() {
      return {
        iri: args.iri,
        method: args.method,
        contentType: args.contentType,
        rendered,
        selector: args.content.selector,
      };
    },
    toInitialState() {
      if (!rendered) {
        return `<template id="element:${args.iri}|${args.method}|${args.contentType}">${html}</template>`;
      }

      return '';
    },
  };

  return Object.freeze(integration);
}) as ElementIntegrationFactory;

ElementIntegration.type = 'element';

ElementIntegration.fromInitialState = (
  stateInfo: ElementStateInfo,
  handler: ElementHandler,
): Readonly<ElementIntegrationType> => {
  const content: ElementHandlerResult = {
    selector: stateInfo.selector,
    html: '',
    dom: undefined,
  };
  
  if (stateInfo.rendered) {
    content.dom = document.querySelector(stateInfo.selector) ?? null;
  } else {
    const template = document.getElementById(`element:${stateInfo.iri}|${stateInfo.method}|${stateInfo.contentType}`) as HTMLTemplateElement;

    if (template != null || !(template instanceof HTMLTemplateElement)) {
      content.dom = template.children[0] ?? null;
    }
  }

  return ElementIntegration(handler, {
    iri: stateInfo.iri,
    method: stateInfo.method,
    contentType: stateInfo.contentType,
    content,
  });
};

Object.freeze(ElementIntegration);



