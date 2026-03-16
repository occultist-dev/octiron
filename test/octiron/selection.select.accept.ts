import {contextBuilder, makeTypeDef, makeTypeDefs} from "@occultist/occultist";
import {describe, it} from "node:test";
import {dedent} from "../utils/dedent.ts";
import {createScenarioUtils} from "../utils/dom.ts";
import assert from 'node:assert/strict';

describe('store.subscribe()', () => {
  it('Calls listener on changes to primary entity changes', async () => {
    const { registry, pretty, document, dom, store, redraw, vocab, mount, o, m } = createScenarioUtils();

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
        div::
          h1:: Root
        #foo
        div::
          Bar
        #fee "
          Fee
      `);

    mount(document.body, {
      view() {
        return [
          o.root(o => [
            m('div#root-parent',
              o.select('entity', { accept: 'text/longform' }),
            ),
            m('div#foo-parent', 
              o.select('entity', { accept: 'text/longform', fragment: 'foo' }),
            ),
            m('div#fee-parent',
              store.text('http://example.com/test#fee', { accept: 'text/longform' }),
            ),
          ]),
        ];
      },
    });
    
    await redraw();

    assert.equal(
      document.body.querySelector('#root-parent h1')?.textContent,
      'Root',
    );
    assert.equal(
      document.body.querySelector('#foo-parent div')?.textContent,
      'Bar',
    );
    assert.equal(
      document.body.querySelector('#fee-parent')?.textContent,
      'Fee',
    );
  });
});

