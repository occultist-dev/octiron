import {JSONLDContextStore} from '@occultist/mini-jsonld';
import {Registry} from '@occultist/occultist';
import {JSDOM} from 'jsdom';
import m from 'mithril';
import mountRedraw from 'mithril/api/mount-redraw.js';
import render from 'mithril/render.js';
import {makeJSONLDHandler} from '../../lib/handlers/jsonLDHandler.ts';
import {longformHandler, octiron} from '../../lib/octiron.ts';
import {type StoreArgs} from '../../lib/store.ts';
import {format} from 'prettier';
import { setIsBrowserRender } from '../../lib/consts.ts';


class Scheduler {
  cb: () => void;

  schedule = (cb) => {
    this.cb = cb;
  };

  handleScheduled() {
    const { resolve, promise } = Promise.withResolvers();

    setImmediate(() => {
      this.cb();
      resolve();
    });

    return promise;
  }
}


export function domTest() {
  // setIsBrowserRender(true);

  const rootIRI = 'http://example.com';
  const vocab = 'http://schema.example.com/';
  const dom = new JSDOM(`
    <!doctype html>
    <html lang=en><body></body></html>
  `, {
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  const window = dom.window;
  const document = dom.window.document;

  globalThis.window = window;
  globalThis.document = dom.window.document;
  
  const registry = new Registry({
    rootIRI: 'http://example.com',
  });
  const scope = registry.scope('/actions');
  let promises: Array<Promise<Response>> = [];
  const fetcher: StoreArgs['fetcher'] = async (iri, args) => {
    const res = await registry.handleRequest(new Request(iri, args));

    return res;
  };
  const responseHook: StoreArgs['responseHook'] = (res) => promises.push(res);
  const store = new JSONLDContextStore({
    fetcher: (iri, init) => registry.handleRequest(new Request(iri, init)),
  });
  const o = octiron({
    rootIRI,
    vocab,
    handlers: [
      makeJSONLDHandler({ store }),
      longformHandler,
    ],
    fetcher,
    responseHook,
  });

  const scheduler = new Scheduler();
  const { mount, redraw } = mountRedraw(render, scheduler.schedule, console);

  async function redrawAsync(limit: number = -1) {
    redraw();
    await scheduler.handleScheduled();

    while (promises.length !== 0) {
      await Promise.all(promises);
      promises = [];
      redraw();
      await scheduler.handleScheduled();

      limit--;
    }
  }

  async function pretty() {
    return format(dom.serialize(), { parser: 'html' });
  }

  return {
    vocab,
    rootIRI,
    m,
    o,
    store: o.store,
    dom,
    window,
    document,
    registry,
    scope,
    promises,
    mount,
    redraw: redrawAsync,
    pretty,
  };
}
