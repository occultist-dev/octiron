import assert from 'node:assert';
import {describe, it} from "node:test";
import {domTest} from '../utils/dom.ts';
import { Debug } from '../../lib/octiron.ts';


describe('o.select()', () => {
  it('Re-orders DOM children on updates to store data ordering', { only: true }, async () => {
    const { m, o, document, registry, mount, pretty, redraw } = domTest();

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
          '@context': { '@vocab': 'https://schema.example.com/' },
          '@id': ctx.url,
          'todoListing': { '@id': 'https://example.com/todos' },
        });
      });

    registry.http.get('/todos')
      .public()
      .handle('application/ld+json', ctx => {
        ctx.body = JSON.stringify({
          '@id': ctx.url,
          ...jsonld,
        })
      });

    const PresentName = {
      view({ attrs: { value } }) {
        return value;
      },
    };

    mount(document.body, {
      view() {
        return o.root({ component: Debug });
        
        return [
          o.root('todoListing', o =>
            m('ul',
              o.select('members', o =>
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
    console.log(await pretty())

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

    await o.store.fetch('https://example.com/todos');
    await redraw();

    listElements = Array.from(document.querySelectorAll('li[data-position]')) as HTMLLIElement[]
    
    assert.equal(listElements[0].textContent, 'Second');
    assert.equal(listElements[0].dataset.position, 1);
    assert.equal(listElements[1].textContent, 'First');
    assert.equal(listElements[1].dataset.position, 2);
  });
});
