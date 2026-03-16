import {describe, it} from "node:test";
import {createTestScenario} from "../utils/dom.ts";
import {contextBuilder, makeTypeDef, makeTypeDefs} from "@occultist/occultist";
import {dedent} from "../utils/dedent.ts";
import assert from 'node:assert/strict';

const todos = [
  { name: 'Foo bar fee' },
  { name: 'Bar foo baz' },
  { name: 'Baz foo bar' },
];

function createScenario() {
  const {registry, vocab, ...scenario} = createTestScenario();

  const typeDefs = makeTypeDefs([
    makeTypeDef({ term: 'foo-bar', schema: vocab, isIRI: true }),
    makeTypeDef({ term: 'todoListing', schema: vocab, isIRI: true }),
    makeTypeDef({ term: 'ListTodosAction', schema: vocab, isIRI: true }),
    makeTypeDef({ term: 'actions', schema: vocab, isIRI: true }),
    makeTypeDef({ term: 'fragment_id', schema: vocab }),
  ]);

  const scope = registry.scope('/context');

  const action1 = registry.http.get('/')
    .public()
    .handle('application/ld+json', ctx => {
      ctx.body = JSON.stringify({
        '@context': contextBuilder({vocab, typeDefs}),
        '@id': ctx.url,
        name: 'Foo',
        actions: scope.url(),
        'foo-bar': action2.url(),
      });
    });

  const action2 = registry.http.get('/foo-bar')
    .public()
    .handle('text/longform', dedent`
      #head [
        title:: Foo bar
        meta::
          [name=description]
          [content=Foo bar fee ]
          [content=fi foe fum]

      main::
        header::
          h1:: This is the root element.

      ##cancel-button
      button.cancel[type=button]::
        Cancel

      #ok-copy "
        Ok
    `);

  const action3 = scope.http.get('/todos{#fragment-id}', { name: 'list-todos' })
    .public()
    .define({
      typeDef: typeDefs.ListTodosAction,
      spec: {
        fragmentId: {
          dataType: 'string',
          typeDef: typeDefs['fragment_id'],
          valueName: 'fragment-id',
        },
      },
    })
    .handle('text/longform', ctx => {
      ctx.body = 'ul::\n';

      for (let i = 0, l = todos.length; i < l; i++) {
        ctx.body += `  li:: ${todos[i].name}\n`;
      }

      ctx.body += '\n#reversed\nul::\n';

      for (let i = todos.length - 1, l = 0; i >= l; i--) {
        ctx.body += `  li:: ${todos[i].name}\n`;
      }
    });

  return {
    ...scenario,
    registry,
    action1,
    action2,
    action3,
  };
}


describe('fragments', () => {
  it('Renders root fragments', async () => {
    const {o, document, mount, redraw} = createScenario();

    mount(document.body, {
      view() {
        return o.root(o => o.select('foo-bar', { accept: 'text/longform' }));
      },
    });

    await redraw();

    const el = document.querySelector('body > main > header > h1');

    assert.equal(el?.textContent, 'This is the root element.');
  });
   
  it('Renders bare fragments', async () => {
    const {o, document, mount, redraw} = createScenario();

    mount(document.body, {
      view() {
        return o.root(o => o.select('foo-bar', { fragment: 'cancel-button', accept: 'text/longform' }));
      },
    });

    await redraw();

    const el1 = document.querySelector('body > button[type=button].cancel');

    assert.equal(el1?.textContent, 'Cancel');
  });

  it('Renders range fragments', async () => {
    const {o, document, mount, redraw} = createScenario();

    mount(document.head, {
      view() {
        return o.root(o => o.select('foo-bar', { fragment: 'head', accept: 'text/longform' }));
      },
    });

    await redraw();

    const el1 = document.querySelector('head title');
    const el2 = document.querySelector('head meta');

    assert.equal(el1?.textContent, 'Foo bar');
    assert.equal(el2?.getAttribute('name'), 'description');
    assert.equal(el2?.getAttribute('content'), 'Foo bar fee fi foe fum');
  });
  
  it('Renders text fragments', async () => {
    const {o, document, mount, redraw} = createScenario();

    mount(document.body, {
      view() {
        return o.root(o => o.select('foo-bar', { fragment: 'ok-copy', accept: 'text/longform' }));
      },
    });

    await redraw();

    assert.equal(document.body.textContent, 'Ok');
  }); 

  it('Render longform root fragment as action result', async () => {
    const {o, document, mount, redraw} = createScenario();

    mount(document.body, {
      view() {
        return o.perform('actions ListTodosAction', {
          accept: 'text/longform, application/ld+json',
          submitOnInit: true,
        }, o => [
          o.success(),
        ])
      },
    });

    await redraw();

    const els = document.querySelectorAll('body > ul > li');

    assert.equal(els[0].textContent, 'Foo bar fee');
    assert.equal(els[1].textContent, 'Bar foo baz');
    assert.equal(els[2].textContent, 'Baz foo bar');
  });

  it('Render longform identified fragment as action result', {only:true}, async () => {
    const {o, document, mount, redraw} = createScenario();

    mount(document.body, {
      view() {
        return o.perform('actions ListTodosAction', {
          accept: 'text/longform, application/ld+json',
          initialValue: {
            'fragment_id': 'reversed',
          },
          submitOnInit: true,
        }, o => [
          o.success(),
          o.url?.toString(),
        ])
      },
    });

    await redraw();

    const els = document.querySelectorAll('body > ul > li');

    assert.equal(els[0].textContent, 'Baz foo bar');
    assert.equal(els[1].textContent, 'Bar foo baz');
    assert.equal(els[2].textContent, 'Foo bar fee');
  });

});
