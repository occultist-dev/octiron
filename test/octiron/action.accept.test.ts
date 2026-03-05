import {contextBuilder, makeTypeDef, makeTypeDefs} from "@occultist/occultist";
import {describe, it} from "node:test";
import {dedent} from "../utils/dedent.ts";
import {domTest} from "../utils/dom.ts";
import assert from 'node:assert/strict';

describe('store.subscribe()', () => {
  it('Calls listener on changes to primary entity changes', async () => {
    const { registry, pretty, document, dom, store, redraw, vocab, mount, o, m } = domTest();

    const typeDefs = makeTypeDefs([
      makeTypeDef('foo', vocab),
      makeTypeDef({ term: 'entity', schema: vocab, isIRI: true }),
      makeTypeDef({ term: 'actions', schema: vocab, isIRI: true }),
      makeTypeDef({ term: 'GetCopyAction', schema: vocab }),
      makeTypeDef({ term: 'copyId', schema: vocab }),
    ]);

    const context = contextBuilder({
      vocab,
      typeDefs,
    });
    
    const rootScope = registry.scope('/actions')
      .public();

    registry.http.get('/')
      .public()
      .handle('application/ld+json', (ctx) => {
        ctx.body = JSON.stringify({
          '@context': context,
          '@id': ctx.url,
          'entity': endpoint.url(),
          'actions': rootScope.url(),
        });
      });

    const endpoint = rootScope.http.get('/test{#id}', { name: 'get-copy' })
      .public()
      .define({
        typeDef: typeDefs.GetCopyAction,
        spec: {
          id: {
            typeDef: typeDefs.copyId,
            dataType: 'string',
            valueName: 'id',
          },
        },
      })
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
          o.select('actions GetCopyAction', o => o.perform({
            submitOnInit: true,
            accept: 'text/longform',
          }, o => [
            m('div#root-parent',
              o.success(),
            ),
          ])),
          o.select('actions GetCopyAction', o => o.perform({
            submitOnInit: true,
            accept: 'text/longform',
            initialValue: {
              copyId: 'foo',
            },
          }, o => [
            m('div#foo-parent', 
              o.success(),
            ),
            m('div#fee-parent',
              store.text('http://example.com/test#fee', { accept: 'text/longform' }),
            ),
          ])),
        ];
      },
    });
    
    await redraw();

    console.log(await pretty());

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

