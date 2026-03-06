import m from 'mithril';
import {processTemplate} from '@longform/longform';
import {HTMLFragment, HTMLFragmentsHandlerResult} from '../octiron.ts';
import {isBrowserRender} from '../consts.ts';


export type HTMLFragmentCache = [
  identifier: string,
  type: HTMLFragment['type'] | undefined,
  html: string,
  dom?: Element[],
];

export type OnRendered = (identifier: string) => void;

export type HTMLFragmentRendererAttrs = {
  fragment: HTMLFragmentCache;
  onRendered: OnRendered;
};

/**
 * Component for rendering content using a HTML fragments integration.
 */
export const HTMLFragmentRenderer: m.Component<HTMLFragmentRendererAttrs> = {
  oninit(vnode) {
    if (!isBrowserRender) {
      // used for SSR to determine if a fragment has been
      // written to the HTML document or should be appended
      // as a template.
      vnode.attrs.onRendered(vnode.attrs.fragment[0]);
    }

    if (isBrowserRender && vnode.attrs.fragment[3] == null) {
      const template = document.createElement('template');
      template.innerHTML = vnode.attrs.fragment[2];
      vnode.attrs.fragment[3] = Array.from(
        template.content.children,
      );
    }
  },
  view(vnode) {
    if (isBrowserRender) {
      return m.dom(vnode.attrs.fragment[2]);
    }

    return m.trust(vnode.attrs.fragment[1]);
  },
};

export type HTMLFragmentState = {
  id: string;
  type: 'embed' | 'bare' | 'range';
  rendered: boolean;
  selector: string;
};

/**
 * Details about the integrated content which are
 * written into the server rendered HTML for client
 * side initial state.
 */
export type HTMLFragmentsStateInfo = {
  iri: string;
  method: string;
  contentType: string;
  rendered?: boolean;
  selector?: string;
  fragments: HTMLFragmentState[];
  texts: Record<string, string>;
  templates: Record<string, string>;
}

/**
 * Parsed result of a URL hash.
 */
export type ParsedHTMLFragmentsHash = {

  /**
   * The fragment identifier.
   */
  identifier: string;

  /**
   * Fragment args.
   */
  args?: unknown;
}

/**
 * Function for parsing the fragment identifier
 * args from a URL hash value.
 *
 * @param hash The URL hash.
 */
export type HTMLFragmentsHashParser = (hash: string) => ParsedHTMLFragmentsHash | undefined;


export type HTMLFragmentsIntegrationArgs = {

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
   * The content parsed into HTML fragments.
   */
  content: HTMLFragmentsHandlerResult;

  /**
   * Function for parsing the fragment identifier
   * and optional args from a URL hash value.
   *
   * If omitted the hash is treated as the fragment identifier.
   */
  parser?: HTMLFragmentsHashParser;
};

export interface HTMLFragmentsIntegrationType {
  
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
   * @param o The parent octiron instance.
   * @param hash The URL hash.
   */
  render(hash?: string): m.Children;
};

/**
 * The HTML fragments integration is used with container media types
 * which support being accessed using fragment identifiers in the hash
 * of the URL and rendered to HTML.
 *
 * If the media-type supports having args passed by the client
 * to fragments a parser function must be passed to the integration
 * to separate arguments from the fragment identifier.
 *
 * Fragment identifiers with text semantics can be accessed as text
 * instead of vdom using the text method on the integration.
 *
 * The integration does not support passing args to the root fragment
 * or rendering the root fragment as text.
 */
export const HTMLFragmentsIntegration = (args: HTMLFragmentsIntegrationArgs): Readonly<HTMLFragmentsIntegrationType> => {
  let root: HTMLFragmentCache | undefined | null;
  let renderedRoot = false;
  const cache = new Map<string, HTMLFragmentCache>();
  const rendered: string[] = [];

  const onRendered: OnRendered = (identifier) => {
    if (identifier == null) {
      renderedRoot = true;
    } else {
      rendered.push(identifier);
    }
  };

  const integration: HTMLFragmentsIntegrationType = {
    iri: args.iri,
    method: args.method,
    contentType: args.contentType,
    text(hash: string): string | undefined {
      if (hash == null) return;

      if (!cache.has(hash)) {
        cacheFragment(hash, args.parser, args.content, cache)
      }

      const fragment = cache.get(hash);
      
      if (fragment[1] !== 'text') {
        return;
      }
      return fragment[2];
    },
    render(hash: string): m.Children {
      if (hash == null) {
        if (root == null) {
          return;
        } else if (root === undefined &&
                   args.content.root == null) {
          root = null;
          return;
        } else if (root === undefined) {
          root = [undefined, undefined, args.content.root];
        }

        return m(HTMLFragmentRenderer, {
          fragment: root,
          onRendered,
        });
      }

      if (!cache.has(hash)) {
        cacheFragment(hash, args.parser, args.content, cache)
      }

      const fragment = cache.get(hash);
      
      return m(HTMLFragmentRenderer, {
        fragment,
        onRendered,
      });
    },
  };
  
  return Object.freeze(integration);
};

function cacheFragment(
  hash: string,
  parser: HTMLFragmentsHashParser | undefined,
  content: HTMLFragmentsHandlerResult,
  cache: Map<string, HTMLFragmentCache | null>,
): void {
  if (parser == null) {
    const fragment = content.fragments[hash];

    if (fragment == null) {
      cache.set(hash, null);
    }

    cache.set(hash, [fragment.id, fragment.type, fragment.html]);
  }

  const result = parser(hash);

  if (result == null) {
    cache.set(hash, null);
    return;
  }

  if (result.args != null) {
    const template = content.templates[result.identifier];
    // TODO allow injection of template processing method
    const html = processTemplate(
      template,
      result.args as Record<string, string>,
      (identifier) => {
        return content.fragments[identifier].html;
      },
    );

    cache.set(hash, [result.identifier, undefined, html]);

    return;
  }
  
  const fragment = content.fragments[result.identifier];
  
  cache.set(hash, [result.identifier, fragment.type, fragment.html]);
}

