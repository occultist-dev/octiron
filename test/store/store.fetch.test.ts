import assert from 'node:assert/strict';
import {describe, it} from "node:test";
import {createTest} from "../utils/dom.ts";
import {contextBuilder, makeTypeDef, makeTypeDefs} from "@occultist/occultist";
import {dedent} from '../utils/dedent.ts';



describe('store.fetch()', () => {
  it('Fetches a remote JSONLD resource', async () => {
    const {store, registry, vocab} = createTest();

    const typeDefs = makeTypeDefs([
      makeTypeDef({ term: 'foo', schema: vocab })
    ]);

    const action = registry.http.get('/foo')
      .public()
      .handle('application/ld+json', ctx => {
        ctx.body = JSON.stringify({
          '@context': contextBuilder({vocab, typeDefs}),
          '@id': ctx.url,
          name: 'Foo',
        });
      });

    const res = await store.fetch(action.url());
    
    assert.equal(res.value?.['@id'], action.url());
    assert.equal(res.value?.['http://schema.example.com/name'], 'Foo');
  });

  it('Fetches a remote Longform resource', async () => {
    const {store, registry} = createTest();

    const action = registry.http.get('/foo')
      .public()
      .handle('text/longform', dedent`
        #foo "
          Bar
      `);

    const res = await store.fetch(action.url(), {
      accept: 'text/longform',
    });

    assert.equal(res.integration?.text?.('foo'), 'Bar');
  });
});
