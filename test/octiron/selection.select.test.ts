import assert from 'node:assert';
import {describe, it} from "node:test";
import {domTest} from '../utils/dom.ts';
import { Debug } from '../../lib/octiron.ts';


describe('o.select()', () => {
  it('Re-orders DOM children on updates to store data ordering', { only: true }, async () => {
    const { m, o, document, registry, mount, pretty, redraw, vocab } = domTest();

    let jsonld = {
      '@context': { '@vocab': vocab },
      members: [
        {
          '@id': 'http://example.com/todos/1',
          position: 1,
          name: 'First',
        },
        {
          '@id': 'http://example.com/todos/2',
          position: 2,
          name: 'Second',
        },
      ],
    };

    registry.http.get('/')
      .public()
      .handle('application/ld+json', ctx => {
        ctx.body = JSON.stringify({
          '@context': { '@vocab': vocab },
          '@id': ctx.url,
          'todoListing': { '@id': todoListing.url() },
        });
      });

    const todoListing = registry.http.get('/todos')
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
        return [
          o.root('todoListing', o =>
            m('ul',
              o.select('members', o =>
                m('li', {
                    'data-position': o.get('position'),
                    'data-id': o.id,
                   }, o.select('name', { component: PresentName }),
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
      '@context': { '@vocab': vocab },
      members: [
        {
          '@id': 'http://example.com/todos/2',
          position: 1,
          name: 'Second',
        },
        {
          '@id': 'http://example.com/todos/1',
          position: 2,
          name: 'First'
        },
      ],
    };

    await o.store.fetch('http://example.com/todos');
    await redraw();

    listElements = Array.from(document.querySelectorAll('li[data-position]')) as HTMLLIElement[]
    
    assert.equal(listElements[0].textContent, 'Second');
    assert.equal(listElements[0].dataset.position, 1);
    assert.equal(listElements[1].textContent, 'First');
    assert.equal(listElements[1].dataset.position, 2);
  });
});
