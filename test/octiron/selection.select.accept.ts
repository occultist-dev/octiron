import {contextBuilder, makeTypeDef, makeTypeDefs} from "@occultist/occultist";
import {describe, it} from "node:test";
import {dedent} from "../utils/dedent.ts";
import {domTest} from "../utils/dom.ts";


describe('store.subscribe()', () => {
  it('Calls listener on changes to primary entity changes', async () => {
    const { registry, document, dom, store, redraw, vocab, mount, o, m } = domTest();

    const typeDefs = makeTypeDefs([
      makeTypeDef('foo', vocab),
      makeTypeDef({ term: 'entity', schema: vocab, isIRI: true }),
    ]);

    const context = contextBuilder({
      vocab,
      typeDefs,
    });

    registry.http.get('/')
      .public()
      .handle('application/ld+json', (ctx) => {
        ctx.body = JSON.stringify({
          '@context': context,
          '@id': ctx.url,
          'entity': endpoint.url(),
        });
      });

    const endpoint = registry.http.get('/test')
      .public()
      .handle('text/longform', dedent`
        #foo
        div::
          Bar
        #fee "
          Fi
      `);

    mount(document.body, {
      view() {
        return [
          o.root(o => [
            m('div', 
              o.select('entity', { accept: 'text/longform', fragment: 'foo' }),
            ),
            m('div',
              //store.text('http://example.com/test', { accept: 'text/longform' }),
            ),
          ]),
        ];
      },
    });
    
    await redraw();

    console.log(dom.serialize());
  });
});

