import {describe, it} from "node:test";
import {domTest} from "../utils/dom.ts";
import {makeTypeDef, makeTypeDefs, contextBuilder} from "@occultist/occultist";
import assert from "node:assert";
import {OctironDebug, type PresentComponent, type AnyComponent} from "../../lib/octiron.ts";


type TodoStatus =
  | 'planned'
  | 'in-progress'
  | 'complete'
;


describe('o.submit()', () => {
  it('Re-orders DOM children on updates to store data ordering', {only: true}, async () => {
    const typeDefs = makeTypeDefs([
      makeTypeDef('ListTodosAction', 'http://schema.example.com/'),
      makeTypeDef('SetTodoStatusAction', 'http://schema.example.com/'),
      makeTypeDef('todoUUID', 'http://schema.example.com/'),
      makeTypeDef('todoStatus', 'http://schema.example.com/'),
    ]);
    const context = contextBuilder({
      vocab: 'http://schema.example.com/',
      typeDefs,
    })
    const { m, o, dom, document, registry, scope, mount, redraw, pretty } = domTest();

    const contextIRI = new URL('./context', o.store.rootIRI).toString();

    registry.http.get('/')
      .public()
      .handle('application/ld+json', ctx => {
        ctx.body = JSON.stringify({
          '@context': contextIRI,
          '@id': ctx.url,
          actions: { '@id': scope.url() },
          todoListing: { '@id': todoListingAction.url() },
        });
      });

    registry.http.get('/context')
      .public()
      .handle('application/ld+json', JSON.stringify({
        '@id': contextIRI,
        '@context': context,
      }));
        

    const todoListingAction = scope.http.get('/todos', { name: 'list-todos' })
      .public()
      .define({
        typeDef: typeDefs.ListTodosAction,
        spec: {},
      })
      .handle('application/ld+json', ctx => {
        ctx.body = JSON.stringify({
          '@context': contextIRI,
          '@id': ctx.url,
          ...jsonld,
        });
      });

    const setTodoStatusAction = scope.http.post('/todos/:todoUUID/status', { name: 'set-todo-status' })
      .public()
      .define({
        typeDef: typeDefs.SetTodoStatusAction,
        spec: {
          todoUUID: {
            typeDef: typeDefs.todoUUID,
            dataType: 'string',
            valueName: 'todoUUID',
          },
          todoStatus: {
            typeDef: typeDefs.todoStatus,
            dataType: 'string',
            options: ['planned', 'in-progress', 'complete'],
          },
        },
      })
      .handle('application/ld+json', ctx => {
        ctx.status = 200;
        ctx.body = JSON.stringify({
          '@context': contextIRI,
          '@id': ctx.url,
          message: 'Success',
        });
      });

    let jsonld = {
      members: [
        {
          position: 1,
          name: 'First',
          todoStatus: 'planned',
          actions: {
            [setTodoStatusAction.type as string]: setTodoStatusAction.jsonldPartial(),
          },
        },
        {
          position: 2,
          name: 'Second',
          todoStatus: 'planned',
          actions: {
            [setTodoStatusAction.type as string]: setTodoStatusAction.jsonldPartial(),
          },
        },
      ],
    };

    const PresentName: PresentComponent<string> = {
      view({ attrs: { value } }) {
        return value;
      },
    };

    const EditTodoStatus: AnyComponent<TodoStatus> = {
      view({ attrs }) {
        if (attrs.renderType === 'present') {
          switch (attrs.value) {
            case 'in-progress': return 'In progress';
            case 'complete': return 'Complete';
          }
          return 'Planned';
        }
    
        return m('select', {
          ...attrs.attrs,
          value: attrs.value,
          'data-value': attrs.value,
          disabled: attrs.spec.readonly,
          multiple: attrs.spec.multiple,
          onchange: (evt: Event) => {
            attrs.onChange((evt.target as HTMLSelectElement).value);
          }
        },
          m('option[value=planned]', 'Planned'),
          m('option[value=in-progress]', 'In progress'),
          m('option[value=complete]', 'Complete'),
        );
      }
    };

    const Debug: AnyComponent = {
      view({ attrs }) {
        return JSON.stringify(attrs.value, null, 2);
      }
    }

    mount(document.body, {
      view() {
        return [
          o.perform('actions ListTodosAction', {
            submitOnInit: true,
          }, x => [
            m('h1', 'Todo listing'),
            m('ul',
              x.success('members', o =>
                m('li', { 'data-position': o.get('position') },
                  o.select('name', o => 
                    m('h2', o.present({ component: PresentName })),
                  ),
                  o.perform('actions SetTodoStatusAction', {
                    submitOnChange: true,
                    onSubmitSuccess: () => {
                      x.submit();        
                    },
                    initialValue: {
                      todoUUID: o.get('uuid'),
                      todoStatus: o.get('todoStatus'),
                    },
                  }, o =>
                    o.select('todoStatus', { component: EditTodoStatus }),
                  ),
                ),
              ),
            ),
          ]),
        ];
      },
    });
    
    await redraw();

    console.log(await pretty());

    let listElements = Array.from(document.querySelectorAll('li[data-position]')) as HTMLLIElement[];

    assert.equal(listElements[0].firstChild?.textContent, 'First');
    assert.equal(listElements[0].dataset.position, 1);
    assert.equal(listElements[1].firstChild?.textContent, 'Second');
    assert.equal(listElements[1].dataset.position, 2);

    let select = Array.from(document.querySelectorAll('select')) as HTMLSelectElement[];

    assert.equal(select[0].value, 'planned');
    assert.equal(select[1].value, 'planned');

    jsonld = {
      members: [
        {
          position: 1,
          name: 'Second',
          todoStatus: 'in-progress',
          actions: {
            [setTodoStatusAction.type as string]: setTodoStatusAction.jsonldPartial(),
          },
        },
        {
          position: 2,
          name: 'First',
          todoStatus: 'planned',
          actions: {
            [setTodoStatusAction.type as string]: setTodoStatusAction.jsonldPartial(),
          },
        },
      ],
    };


    select[1].value = 'in-progress'
    select[1].dispatchEvent(new dom.window.Event('change', { bubbles: true }));

    await redraw();

    console.log(await pretty());

    listElements = Array.from(document.querySelectorAll('li[data-position]')) as HTMLLIElement[]
    
    assert.equal(listElements[0].firstChild?.textContent, 'Second');
    assert.equal(listElements[0].dataset.position, 1);
    assert.equal(listElements[1].firstChild?.textContent, 'First');
    assert.equal(listElements[1].dataset.position, 2);

    select = Array.from(document.querySelectorAll('select')) as HTMLSelectElement[];

    assert.equal(select[0].value, 'in-progress');
    assert.equal(select[1].value, 'planned');
  });

});
