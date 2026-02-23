import {describe, it} from "node:test";
import {domTest} from "../utils/dom.ts";
import {makeTypeDef, makeTypeDefs, contextBuilder} from "@occultist/occultist";
import assert from "node:assert";



describe('o.submit()', () => {
  it('Re-orders DOM children on updates to store data ordering', async () => {
    const typeDefs = makeTypeDefs([
      makeTypeDef('ListTodosAction', 'https://schema.example.com/'),
    ]);
    const context = contextBuilder({
      vocab: 'https://schema.example.com',
      typeDefs,
    })
    const { m, o, dom, document, registry, scope, mount, redraw } = domTest();

    let jsonld = {
      '@context': { '@vocab': 'https://schema.example.com/' },
      members: [
        { position: 1, name: 'First' },
        { position: 2, name: 'Second' },
      ],
    };

    registry.http.get('/')
      .public()
      .handle('application/ld+json', ctx => {
        ctx.body = JSON.stringify({
          '@context': {
            '@vocab': 'https://schema.example.com/'
          },
          '@id': ctx.url,
          actions: { '@id': scope.url() },
        });
      });

    scope.http.get('/todos', { name: 'list-todos' })
      .public()
      .define({
        typeDef: makeTypeDef('ListValuesAction', 'https://schema.example.com/'),
        spec: {},
      })
      .handle('application/ld+json', ctx => {
        ctx.body = JSON.stringify({
          '@id': ctx.url,
          ...jsonld,
        });
      });

    const res = await registry.handleRequest(new Request('https://example.com/actions'));

    const PresentName = {
      view({ attrs: { value } }) {
        return value;
      },
    };

    mount(document.body, {
      view() {
        return [
          o.perform('actions ListValuesAction', {
            submitOnInit: true,
          }, o =>
            m('ul',
              o.success('members', o =>
                m('li', { 'data-position': o.get('position') },
                  o.select('name', { component: PresentName }),
                ),
              ),
            ),
          ),
        ];
      },
    });
    
    await redraw();

    let listElements = Array.from(document.querySelectorAll('li[data-position]')) as HTMLLIElement[]

    assert.equal(listElements[0].textContent, 'First');
    assert.equal(listElements[0].dataset.position, 1);
    assert.equal(listElements[1].textContent, 'Second');
    assert.equal(listElements[1].dataset.position, 2);

    jsonld = {
      '@context': { '@vocab': 'https://schema.example.com/' },
      members: [
        { position: 1, name: 'Second' },
        { position: 2, name: 'First' },
      ],
    };

    await o.store.submit('https://example.com/todos');
    await redraw();

    listElements = Array.from(document.querySelectorAll('li[data-position]')) as HTMLLIElement[]
    
    assert.equal(listElements[0].textContent, 'Second');
    assert.equal(listElements[0].dataset.position, 1);
    assert.equal(listElements[1].textContent, 'First');
    assert.equal(listElements[1].dataset.position, 2);
  });

});
