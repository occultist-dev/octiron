import {describe, it} from "node:test";
import {contextBuilder, makeTypeDef, makeTypeDefs} from "@occultist/occultist";
import {domTest} from "../utils/dom.ts";
import type {SelectionDetails} from "../../lib/octiron.ts";
import assert from "node:assert";
import {en} from "@faker-js/faker";
import {encodePointer} from "json-ptr";



describe('store.subscribe()', () => {
  it('Calls listener on changes to primary entity changes', async () => {
    const { registry, store, vocab } = domTest();

    const typeDefs = makeTypeDefs([
      makeTypeDef('foo', vocab),
      makeTypeDef({ term: 'entity', schema: vocab, isIRI: true }),
    ]);

    const context = contextBuilder({
      vocab,
      typeDefs,
    });

    const root = registry.http.get('/')
      .public()
      .handle('application/ld+json', (ctx) => {
        ctx.body = JSON.stringify({
          '@context': context,
          '@id': ctx.url,
          'entity': new URL('./test', ctx.url).toString(),
        });
      });

    let data = {
      foo: 'Bar',
    };

    const endpoint = registry.http.get('/test')
      .public()
      .handle('application/ld+json', (ctx) => {
        ctx.body = JSON.stringify({
          '@context': root.url(),
          '@id': ctx.url,
          ...data,
        });
      });

    const key = Symbol('Test');
    let callCount: number = 0;
    let selectionDetails!: SelectionDetails;

    const listener = (value: SelectionDetails) => {
      callCount++;
      selectionDetails = value;
    }

    store.subscribe({
      key,
      listener,
      selector: endpoint.url(),
    });

    await store.fetch(endpoint.url());

    assert.equal(callCount, 1);
    assert.deepEqual(selectionDetails.required, []);
    assert.deepEqual(selectionDetails.result[0], {
      "key": "/http:~1~1example.com~1test",
      "pointer": "/http:~1~1example.com~1test",
      "type": "entity",
      "iri": "http://example.com/test",
      "ok": true,
      "value": {
        "@id": "http://example.com/test",
        "http://schema.example.com/foo": "Bar"
      },
      "contentType": "application/ld+json"
    });

    data.foo = "Foo";
    await store.fetch(endpoint.url());

    assert.equal(callCount, 2);
    assert.deepEqual(selectionDetails.required, []);
    assert.deepEqual(selectionDetails.result[0], {
      "key": "/http:~1~1example.com~1test",
      "pointer": "/http:~1~1example.com~1test",
      "type": "entity",
      "iri": "http://example.com/test",
      "ok": true,
      "value": {
        "@id": "http://example.com/test",
        "http://schema.example.com/foo": "Foo"
      },
      "contentType": "application/ld+json"
    });

    await store.fetch(endpoint.url());

    store.subscribe({
      key,
      listener,
      selector: endpoint.url(),
      accept: 'application/ld+json',
    });

    await store.fetch(endpoint.url());

    assert.equal(callCount, 3);
    assert.deepEqual(selectionDetails.required, []);
    assert.deepEqual(selectionDetails.result[0], {
      "key": "/http:~1~1example.com~1test",
      "pointer": "/http:~1~1example.com~1test",
      "type": "entity",
      "iri": "http://example.com/test",
      "ok": true,
      "value": {
        "@id": "http://example.com/test",
        "http://schema.example.com/foo": "Foo"
      },
      "contentType": "application/ld+json"
    });

    store.unsubscribe(key);
    await store.fetch(endpoint.url());

    assert.equal(callCount, 3);
  });

  it('Calls listener on changes to alternative entity changes', {only: true}, async () => {
    const { registry, store, vocab } = domTest();

    const typeDefs = makeTypeDefs([
      makeTypeDef('foo', vocab),
      makeTypeDef({ term: 'entity', schema: vocab, isIRI: true }),
    ]);

    const context = contextBuilder({
      vocab,
      typeDefs,
    });

    const root = registry.http.get('/')
      .public()
      .handle('application/ld+json', (ctx) => {
        ctx.body = JSON.stringify({
          '@context': context,
          '@id': ctx.url,
          'entity': new URL('./test', ctx.url).toString(),
        });
      });


    let data = '';
    data += 'header::';
    data += '  h1:: My website';

    const endpoint = registry.http.get('/test')
      .public()
      .handle('text/longform', (ctx) => {
        ctx.body = data;
      });

    const key = Symbol('Test');

    let callCount: number = 0;
    let selectionDetails!: SelectionDetails;

    const listener = (value: SelectionDetails) => {
      callCount++;
      selectionDetails = value;
    }

    const accept = 'application/problem+json, text/longform';
    store.subscribe({
      key,
      listener,
      accept,
      selector: endpoint.url(),
    });

    await store.fetch(endpoint.url(), { accept });

    assert.equal(selectionDetails.result[0].iri, endpoint.url());
    assert.equal(selectionDetails.result[0].accept, accept);
    assert.equal(selectionDetails.result[0].contentType, 'text/longform');
  });
});

