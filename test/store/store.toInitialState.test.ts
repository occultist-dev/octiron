import assert from 'node:assert/strict';
import {describe, it} from "node:test";
import {createScenarioUtils} from "../utils/dom.ts";
import {contextBuilder, makeTypeDef, makeTypeDefs} from "@occultist/occultist";
import {dedent} from '../utils/dedent.ts';


describe('store.toInitialState()', () => {
  it('Creates a JSON serializable object from the current state', async () => {
    const {store, registry, vocab} = createScenarioUtils();

    const typeDefs = makeTypeDefs([
      makeTypeDef({ term: 'foo', schema: vocab })
    ]);

    const action1 = registry.http.get('/foo')
      .public()
      .handle('application/ld+json', ctx => {
        ctx.body = JSON.stringify({
          '@context': contextBuilder({vocab, typeDefs}),
          '@id': ctx.url,
          name: 'Foo',
        });
      });

    const action2 = registry.http.get('/foo')
      .public()
      .handle('text/longform', dedent`
        #foo "
          Bar
      `);

    const action3 = registry.http.get('/foo')
      .public()
      .handle('text/markdown', dedent`
        # This is my markdown document

        ---
        
        A new paragraph?
      `);

    await Promise.all([
      store.fetch(action1.url(), {
        accept: 'application/ld+json',
      }),
      store.fetch(action2.url(), {
        accept: 'text/longform',
      }),
      store.fetch(action3.url(), {
        accept: 'text/markdown',
      }),
    ]);
  });
});



