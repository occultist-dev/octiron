import m from 'mithril';
import type {RequestHandler} from '../octiron.ts';
import {isBrowserRender} from '../consts.ts';


type FragmentCache = [
  identifier: string,
  type: Fragment['type'] | undefined,
  html: string,
  dom?: Element[],
];

type OnRendered = (identifier: string) => void;

export type FragmentsRemoveHandler = () => void;
export type FragmentsCreateHandler = (dom: Element) => undefined | FragmentsRemoveHandler;

export type FragmentRendererAttrs = {
  fragment: FragmentCache;
  handler?: FragmentsCreateHandler;
  onRendered: OnRendered;
};

type FragmentRendererState = {
  fragment: FragmentCache;
  didChange?: boolean;
  onRemove?: FragmentsRemoveHandler;
};

/**
 * Populates the dom value in a fragment.
 *
 * @param fragment The fragment cache entry.
 */
function populateDOM(fragment: FragmentCache) {
  const template = document.createElement('template');

  template.innerHTML = fragment[2];
  fragment[3] = Array.from(template.content.children);
}

/**
 * Finds the fragment relating to a URL hash and caches the it.
 * If the fragment is a template it is processed before being
 * cached against the hash.
 *
 * @param hash The URL fragment.
 * @param hashParser Parser function that can separate the fragment identifier from any template args.
 * @param content The HTML fragments content.
 * @param cache A map of URL fragments to the processed fragment.
 */
function cacheFragment(
  hash: string,
  hashParser: FragmentsHashParser | undefined,
  templateParser: FragmentsTemplateParser | undefined,
  fragmentHook: FragmentRetrievalHook | undefined,
  content: FragmentsHandlerResult,
  cache: Map<string, FragmentCache | null>,
): void {
  let fragmentCache: FragmentCache = null;

  if (hashParser == null) {
    const fragment = content.fragments[hash];

    if (fragment != null) {
      fragmentCache = [fragment.id, fragment.type, fragment.html, fragment.dom];
    }
  } else {
    const result = hashParser(hash);

    if (result?.args != null && templateParser != null) {
      const template = content.templates != null ? content.templates[result.identifier] : undefined;
      
      if (template != null) {
        const html = templateParser(
          template,
          result.args,
          fragmentHook,
        );

        fragmentCache = [result.identifier, undefined, html];
      }
    } else if (result != null && result.args == null) {
      const fragment = content.fragments[result.identifier];
      
      if (fragment != null) {
        fragmentCache = [result.identifier, fragment.type, fragment.html, fragment.dom];
      }
    }
  }

  cache.set(hash, fragmentCache);
}

export const FragmentRenderer: m.Component<FragmentRendererAttrs, FragmentRendererState> = {
  oninit(vnode) {
    vnode.state.fragment = vnode.attrs.fragment;

    if (!isBrowserRender) {
      // used for SSR to determine if a fragment has been
      // written to the HTML document or should be appended
      // as a template.
      vnode.attrs.onRendered(vnode.attrs.fragment[0]);
    }

    if (isBrowserRender && vnode.attrs.fragment[3] == null) {
      populateDOM(vnode.attrs.fragment);
    }
  },
  oncreate(vnode) {
    if (vnode.attrs.handler != null) {
      vnode.state.onRemove = vnode.attrs.handler(vnode.dom);
    }
  },
  onbeforeupdate(vnode) {
    if (vnode.attrs.fragment !== vnode.state.fragment) {
      vnode.state.didChange = true;
      vnode.state.fragment = vnode.attrs.fragment;

      if (vnode.attrs.fragment[3] == null) {
        populateDOM(vnode.attrs.fragment);
      }

      if (vnode.state.onRemove != null) {
        vnode.state.onRemove();
      }
    }
  },
  onupdate(vnode) {
    if (vnode.state.didChange && vnode.attrs.handler != null) {
      vnode.state.didChange = false;

      if (vnode.attrs.handler != null) {
        vnode.state.onRemove = vnode.attrs.handler(vnode.dom);
      }
    }
  },
  onbeforeremove(vnode) {
    if (vnode.state.onRemove != null) vnode.state.onRemove();
  },
  view(vnode) {
    if (vnode.attrs.fragment[1] === 'text' || !isBrowserRender) {
      return m.trust(vnode.attrs.fragment[2]);
    }

    return m.dom(vnode.attrs.fragment[3]);
  },
};

export type FragmentType =
  | 'embed'
  | 'bare'
  | 'text'
  | 'range'
;

export type FragmentSSR = {
  id: string;
  type: FragmentType;
  html?: string;
  selector: string;
};

export type Fragment = {
  id: string;
  type: FragmentType;
  html?: string;
  dom?: Element[];
  selector?: string;
};

export type SerializableFragmentsHandlerResult = {
  root?: string | null;
  selector?: string;
  fragments: Record<string, FragmentSSR>;
  templates?: Record<string, string>;
};

export type FragmentsHandlerResult = {
  root?: string | null;
  dom?: Element[];
  selector?: string;
  fragments: Record<string, Fragment>;
  templates: Record<string, string>;
};

export type FragmentState = {
  id: string;
  type: Exclude<FragmentType, 'text'>;
  rendered: boolean;
  selector: string;
};

/**
 * Details about the integrated content which are
 * written into the server rendered HTML for client
 * side initial state.
 */
export type FragmentsStateInfo = {
  iri: string;
  method: string;
  contentType: string;
  integrationType: 'fragments';
  rendered?: boolean;
  selector?: string;
  fragments: FragmentState[];
  text: Record<string, string>;
  templates: Record<string, string>;
};

/**
 * Parsed result of a URL hash.
 */
export type ParsedFragmentsHash = {

  /**
   * The fragment identifier.
   */
  identifier: string;

  /**
   * Fragment args.
   */
  args?: unknown;
};

/**
 * Function for parsing the fragment identifier
 * args from a URL hash value.
 *
 * @param hash The URL hash.
 */
export type FragmentsHashParser = (hash: string) => ParsedFragmentsHash | undefined;

export type FragmentRetrievalHook = (fragmentIdentifier: string) => string | undefined;

export type FragmentsTemplateParser = (
  template: string,
  args: unknown,
  hook?: (fragmentIdentifier: string) => string | undefined,
) => string | undefined;

export type FragmentsHandlerFnArgs = {
  res: Response;
};

export type FragmentsHandlerFn = (args: FragmentsHandlerFnArgs) => Promise<SerializableFragmentsHandlerResult>;

export type FragmentsHandler = {
  integrationType: 'fragments';
  contentType: string;

  /**
   * Function for producing the parsed fragments content from a
   * request of the configured content type.
   */
  handler: FragmentsHandlerFn;

  /**
   * Function for parsing the fragment identifier
   * and optional args from a URL hash value.
   *
   * If omitted the hash is treated as the fragment identifier.
   */
  hashParser?: FragmentsHashParser;

  /**
   * Function for parsing templates if supported by
   * the media type.
   */
  templateParser?: FragmentsTemplateParser;

  /**
   * Lifecycle hook that is called when a fragment is mounted.
   */
  createHandler?: FragmentsCreateHandler;
};

export type FragmentsIntegrationArgs = {

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
  content: FragmentsHandlerResult;
};

export interface FragmentsIntegrationType {
  
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
   * Returns a text fragment as text.
   * The root fragment cannot be accessed as text.
   *
   * @param The URL hash.
   */
  text(hash: string): string | undefined;

  /**
   * Returns the vdom representation of the fragment.
   *
   * @param hash The URL hash.
   */
  render(hash?: string): m.Children;

  /**
   * Returns the state info used for re-constructing the fragments
   * in a DOM environment from server side rendered document.
   */
  getStateInfo(): FragmentsStateInfo;

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

export interface FragmentsIntegrationFactory {
  
  /**
   * The integration type this factory produces.
   */
  type: 'fragments';

  /**
   * The fragments integration is used with media types that support
   * having parts or views of their content being accessed using fragment
   * identifiers in the hash of the URL and rendered to HTML.
   *
   * If the media-type supports having args passed by the client
   * to fragments a parser function must be passed to the integration
   * to separate arguments from the fragment identifier.
   *
   * Fragment identifiers with text semantics can be accessed as text
   * instead of VDOM using the text method on the integration.
   *
   * The integration does not support passing args to the root fragment
   * or rendering the root fragment as text.
   *
   * @param args The fragments integration args.
   * @param handler The content type's handler configuration.
   */
  (args: FragmentsIntegrationArgs, handler: FragmentsHandler): FragmentsIntegrationType;

  /**
   * Creates a fragments integration from initial state rendered into a
   * HTML document.
   *
   * @param stateInfo 
   * @param handler The content type's handler configuration.
   */
  fromInitialState(stateInfo: FragmentsStateInfo, handler: FragmentsHandler): FragmentsIntegrationType | null;
};

export const FragmentsIntegration = ((
  args: FragmentsIntegrationArgs,
  handler: FragmentsHandler,
): Readonly<FragmentsIntegrationType> => {
  let root: FragmentCache | undefined | null;
  let renderedRoot = false;
  const cache = new Map<string, FragmentCache>();
  const rendered: string[] = [];
  const hashParser = handler.hashParser;
  const templateParser = handler.templateParser;
  const content = args.content;

  const fragmentHook: FragmentRetrievalHook = (fragmentIdentifier: string): string | undefined => {
    const fragment = content.fragments[fragmentIdentifier];

    return fragment?.html;
  };

  const onRendered: OnRendered = (identifier) => {
    if (identifier == null) {
      renderedRoot = true;
    } else {
      rendered.push(identifier);
    }
  };

  const integration: FragmentsIntegrationType = {
    iri: args.iri,
    method: args.method,
    contentType: args.contentType,
    text(hash: string): string | undefined {
      if (hash == null) return;

      if (!cache.has(hash)) {
        cacheFragment(hash, hashParser, templateParser, fragmentHook, content, cache);
      }

      const fragment = cache.get(hash);

      if (fragment[1] !== 'text') {
        return;
      }
      return fragment[2];
    },
    render(hash: string): m.Children {
      if (hash == null) {
        if (Array.isArray(root)) {
          return m(FragmentRenderer, {
            fragment: root,
            onRendered,
          });
        } else if (args.content.root == null) {
          return;
        }

        root = [undefined, undefined, args.content.root, args.content.dom];

        return m(FragmentRenderer, {
          fragment: root,
          onRendered,
        });
      }

      if (!cache.has(hash)) {
        cacheFragment(hash, hashParser, templateParser, fragmentHook, content, cache);
      }

      const fragment = cache.get(hash);

      if (fragment == null) return;
      
      return m(FragmentRenderer, {
        fragment,
        onRendered,
      });
    },
    getStateInfo() {
      const text: Record<string, string> = {};
      const fragments: FragmentState[] = [];
      const entries = Object.values(content.fragments);

      for (let i = 0, l = entries.length; i < l; i++) {
        if (entries[i].type === 'text') {
          text[entries[i].id] = entries[i].html as string;
        } else {
          fragments.push({
            id: entries[i].id,
            type: entries[i].type as Exclude<FragmentType, 'text'>,
            selector: entries[i].selector,
            rendered: rendered.includes(entries[i].id),
          });
        }
      }

      return {
        iri: args.iri,
        method: args.method,
        contentType: args.contentType,
        integrationType: 'fragments',
        rendered: renderedRoot,
        selector: content.selector,
        templates: content.templates,
        text,
        fragments,
      };
    },
    toInitialState() {
      let html = '';
      const entries = Object.values(content.fragments);

      if (content.root != null && !renderedRoot) {
        html += `<template id="fragment:${args.iri}|${args.method}|${args.contentType}">${content.root}</template>\n`;
      }

      for (let i = 0, l = entries.length; i < l; i++) {
        if (entries[i].type === 'text') {
          continue;
        }

        if (!rendered.includes(entries[i].id)) {
          html += `<template data-fragment="${entries[i].id}">${entries[i].html}</template>\n`;
        } 
      }

      return html;
    },
  };
  
  return Object.freeze(integration);
}) as unknown as FragmentsIntegrationFactory;

FragmentsIntegration.type = 'fragments';

FragmentsIntegration.fromInitialState = (
  stateInfo: FragmentsStateInfo,
  handler: FragmentsHandler,
): Readonly<FragmentsIntegrationType> | null => {
  const content: FragmentsHandlerResult = Object.create(null);

  content.fragments = Object.create(null);
  content.templates = stateInfo.templates;

  if (stateInfo.selector != null && stateInfo.rendered) {
    const element = document.querySelector(stateInfo.selector);

    if (element != null) {
      content.root = element.outerHTML;
    }
  } else if (stateInfo.selector != null) {
    const template = document.getElementById(`fragment:${stateInfo.iri}|${stateInfo.contentType}`);

    content.root = template?.textContent;
  }

  const textEntries = Object.entries(stateInfo.text);

  for (let i = 0, l = textEntries.length; i < l; i++) {
    content.fragments[textEntries[i][0]] = {
      id: textEntries[i][0],
      type: 'text',
      html: textEntries[i][1],
    };
  }

  for (let i = 0, l = stateInfo.fragments.length; i < l; i++) {
    const fragment = stateInfo.fragments[i];

    if (fragment.rendered) {
      let element: Element | undefined;

      switch (fragment.type) {
        case 'embed': {
          element = document.getElementById(fragment.id) as Element;

          if (element == null) {
            break;
          }
          
          content.fragments[fragment.id] = {
            id: fragment.id,
            type: fragment.type,
            dom: [element],
            selector: fragment.selector,
          };
          break;
        }
        case 'bare': {
          element = document.querySelector(fragment.selector) as Element;

          if (element == null) {
            break;
          }

          content.fragments[fragment.id] = {
            id: fragment.id,
            type: fragment.type,
            dom: [element],
            selector: fragment.selector,
          };
          break;
        }
        case 'range': {
          const elements = document.querySelectorAll(fragment.selector);

          content.fragments[fragment.id] = {
            id: fragment.id,
            type: fragment.type,
            selector: fragment.selector,
            dom: Array.from(elements),
          };
        }
      }
    } else {
      const template = document.querySelector(`[data-fragment="${fragment.id}"]`) as HTMLTemplateElement;
      
      if (template == null) {
        continue;
      }

      content.fragments[fragment.id] = {
        id: fragment.id,
        type: fragment.type,
        dom: Array.from(template.content.children),
        selector: fragment.selector,
      };
    }
  }

  return FragmentsIntegration({
    iri: stateInfo.iri,
    method: stateInfo.method,
    contentType: stateInfo.contentType,
    content,
  }, handler);
}

Object.freeze(FragmentsIntegration);

