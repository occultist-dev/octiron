import {Registry} from '@occultist/occultist';
import {JSDOM} from 'jsdom';
import m from 'mithril';
import mountRedraw from 'mithril/api/mount-redraw.js';
import render from 'mithril/render.js';
import {jsonLDHandler} from '../../lib/handlers/jsonLDHandler.ts';
import {octiron} from '../../lib/octiron.ts';
import {type StoreArgs} from '../../lib/store.ts';


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
  const dom = new JSDOM(`
    <!doctype html>
    <html lang=en><body></body></html>
  `);
  const window = dom.window;
  const document = dom.window.document;
  globalThis.document = dom.window.document;
  const registry = new Registry({
    rootIRI: 'https://example.com',
  });
  const scope = registry.scope('/actions');
  let promises: Array<Promise<Response>> = [];
  const fetcher: StoreArgs['fetcher'] = async (iri, args) => await registry.handleRequest(new Request(iri, args));
  const responseHook: StoreArgs['responseHook'] = (res) => promises.push(res);
  const o = octiron({
    rootIRI: 'https://example.com',
    vocab: 'https://schema.example.com/',
    handlers: [jsonLDHandler],
    fetcher,
    responseHook,
  });

  const scheduler = new Scheduler();
  const { mount, redraw } = mountRedraw(render, scheduler.schedule, console);

  async function redrawAsync(limit: number = -1) {
    redraw();
    await scheduler.handleScheduled();

    while (promises.length === 0 && limit !== 0) {
      await Promise.all(promises);
      promises = [];
      redraw();
      await scheduler.handleScheduled();

      limit--;
    }
  }

  return {
    m,
    o,
    dom,
    window,
    document,
    registry,
    scope,
    promises,
    mount,
    redraw: redrawAsync,
  };
}
