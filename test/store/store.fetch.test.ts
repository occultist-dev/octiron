import assert from 'node:assert/strict';
import {describe, it} from "node:test";
import {createTest} from "../utils/dom.ts";
import {contextBuilder, makeTypeDef, makeTypeDefs} from "@occultist/occultist";



describe('store.fetch()', () => {

  it('Fetches a remote resource', async () => {
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

});
