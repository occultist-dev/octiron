import { DOMParser, type HTMLDocument } from "@b-fuze/deno-dom";
import { assert, assertEquals } from "@std/assert";
import { assertArrayIncludes } from "@std/assert/array-includes";
import m from "mithril";
import render from "mithril-node-render";
import { rootFactory } from "../../lib/factories/rootFactory.ts";
import { selectionFactory } from "../../lib/factories/selectionFactory.ts";
import type { IRIObject, JSONObject } from "../../lib/types/common.ts";
import type { PresentComponent } from "../../lib/types/octiron.ts";
import { isJSONObject } from "../../lib/utils/isJSONObject.ts";
import * as mocks from "../mocks.ts";
import type { EntityState } from "../../lib/types/store.ts";


function makeScenario() {
  const users = [
    mocks.createUser({ username: 'jane' }),
    mocks.createUser({ username: 'teddy' }),
    mocks.createUser({ username: 'foster' }),
    mocks.createUser({ username: 'geriah' }),
    mocks.createUser({ username: 'sally' }),
    mocks.createUser({ username: 'bob' }),
    mocks.createUser({ username: 'harrold' }),
    mocks.createUser({ username: 'rosey' }),
    mocks.createUser({ username: 'randald' }),
    mocks.createUser({ username: 'harley' }),
  ] as const;
  const todos = [
    mocks.createTodo({
      assignee: users[0]["@id"],
    }),
    mocks.createTodo({
      assignee: users[1]["@id"],
    }),
    mocks.createTodo({
      assignee: users[2]["@id"],
    }),
    mocks.createTodo({
      assignee: users[3]["@id"],
    }),
  ] as const;
  const api = mocks.makeAPI([
    mocks.createAPIRoot(),
    mocks.createUserListing({ users: users as unknown as JSONObject[] }),
    mocks.createTodoListing({ todos: todos as unknown as JSONObject[] }),
    ...users,
    ...todos,
  ] as IRIObject[]);

  let responses: Array<Promise<Response>> = [];
  function responseHook(res: Promise<Response>) {
    responses.push(res);
  }

  const [fetcher, fetcherHook] = mocks.makeFetcherHook({
    api,
  });

  const primary: Record<string, EntityState> = {};
  const store = mocks.makeStore({
    fetcher,
    responseHook,
    primary,
  })
  const root = rootFactory({
    store,
    typeDefs: {},
  })[0];
  const select = selectionFactory({
    store,
    typeDefs: {},
  })[0];

  function reset() {
    for (const key of Object.keys(primary)) {
      delete primary[key];
    }
  }

  type RenderChildArgs = {
    maxRenders?: number;
  };

  // deno-lint-ignore no-explicit-any
  function isRenderChildArgs(value: any): value is m.Children {
    return isJSONObject(value) && Object.hasOwn(value, 'tag');
  }


  async function renderChild(
    children: m.Children,
  ): Promise<{
    html: string;
    dom: HTMLDocument;
  }>;

  async function renderChild(
    args: RenderChildArgs,
    children: m.Children,
  ): Promise<{
    html: string;
    dom: HTMLDocument;
  }>;

  async function renderChild(
    arg1: RenderChildArgs | m.Children,
    arg2?: m.Children,
  ) {
    let maxRenders: number | undefined;
    let children: m.Children;

    if (isRenderChildArgs(arg2)) {
      maxRenders = (arg1 as RenderChildArgs).maxRenders;
      children = arg2;
    } else if (isRenderChildArgs(arg1)) {
      children = arg1;
    }

    let count = 0;
    let renderPasses = 0;
    let currentLength = 0;
    let html: string = '';
    const component: m.ComponentTypes = {
      view: () => {
        return children;
      },
    };

    responses = [];

    do {
      let loopLength = (currentLength = responses.length);

      html = await render(m(component));
      renderPasses++;


      while (loopLength !== responses.length) {
        loopLength = responses.length;

        await Promise.all(responses);
        count++;
      }

      if (maxRenders != null && renderPasses === maxRenders) {
        const dom = new DOMParser().parseFromString(html, "text/html");

        return { html, dom }
      }
    } while (responses.length !== currentLength);

    html = await render(m(component));

    const dom = new DOMParser().parseFromString(html, "text/html");

    return { html, dom };
  }

  return {
    users,
    todos,
    fetcherHook,
    store,
    root,
    select,
    reset,
    renderChild,
  };
}

Deno.test("o.root()", async (t) => {
  await t.step("It fetches the root entity from a root instance", async () => {
    const {
      fetcherHook,
      root,
      renderChild,
    } = makeScenario();

    const fetchedIRIs: string[] = [];
    fetcherHook((iri) => fetchedIRIs.push(iri));

    await renderChild(root.root());

    assertArrayIncludes(fetchedIRIs, [mocks.todosRootIRI]);
    assert(fetchedIRIs.length === 1);
  });

  await t.step(
    "It fetches the root entity from a select instance",
    async () => {
      const {
        fetcherHook,
        select,
        renderChild,
      } = makeScenario();

      const fetchedIRIs: string[] = [];
      fetcherHook((iri) => fetchedIRIs.push(iri));

      await renderChild(select.root());

      assertArrayIncludes(fetchedIRIs, [mocks.todosRootIRI]);
      assert(fetchedIRIs.length === 1);
    },
  );
});

Deno.test("o.root(selector)", async (t) => {
  for (
    const octironType of [
      'root',
      'select',
    ] as const
  ) {
    const {
      users,
      fetcherHook,
      reset,
      renderChild,
      ...scenario
    } = await makeScenario();

    const o = scenario[octironType];

    await t.step(
      `It can perform deep selections from a "${o.octironType}" instance`,
      async () => {
        const fetchedIRIs: string[] = [];
        fetcherHook((iri: string) => fetchedIRIs.push(iri));

        const component: PresentComponent<string> = () => ({
          view({ attrs: { value } }) {
            return value;
          },
        });

        const { html } = await renderChild(
          o.root("userListing members username", {
            component,
            sep: ',',
          }),
        );

        const usernames = html.split(',');
        assertEquals(usernames[0], users[0]['https://todos.example.com/username']);
        assertEquals(usernames[1], users[1]['https://todos.example.com/username']);
        assertEquals(usernames[2], users[2]['https://todos.example.com/username']);
        assertEquals(usernames[3], users[3]['https://todos.example.com/username']);
        assertArrayIncludes(fetchedIRIs, [mocks.todosRootIRI]);
        assert(fetchedIRIs.length === 2);
        reset();
      },
    );
  }
});

Deno.test("o.root({ pre })", async (t) => {
  for (
    const octironType of [
      'root',
      'select',
    ] as const
  ) {
    const {
      users,
      reset,
      renderChild,
      ...scenario
    } = await makeScenario();
    const o = scenario[octironType];

    await t.step(
      `Prefixes a selection list using a  "${o.octironType}" instance`,
      async () => {
        const component: PresentComponent<string> = () => ({
          view({ attrs: { value } }) {
            return value;
          },
        });

        const { html } = await renderChild(
          o.root("userListing members username", {
            component,
            pre: 'Usernames: ',
          }),
        );

        const [prefix, usernames] = html.split(': ');

        assertEquals(prefix, 'Usernames');
        assertEquals(
          usernames,
          users
            .map(user => user['https://todos.example.com/username'])
            .join('')
        );
        reset();
      },
    );
  }
});

Deno.test("o.root({ sep })", async (t) => {
  const {
    users,
    root,
    select,
    reset,
    renderChild,
  } = await makeScenario();

  for (
    const o of [
      root,
      select,
    ]
  ) {
    await t.step(
      `Joins a selection list using a  "${o.octironType}" instance`,
      async () => {
        const component: PresentComponent<string> = () => ({
          view({ attrs: { value } }) {
            return value;
          },
        });

        const { html } = await renderChild(
          o.root("userListing members username", {
            component,
            sep: ', ',
          }),
        );

        const usernames = html.split(', ');

        assertEquals(usernames, users.map(user => user['https://todos.example.com/username']));
        reset();
      },
    );
  }
});

Deno.test("o.root({ post })", async (t) => {
  const {
    users,
    root,
    select,
    reset,
    renderChild,
  } = await makeScenario();

  for (
    const o of [
      root,
      select,
    ]
  ) {
    await t.step(
      `Suffixes a selection list using a "${o.octironType}" instance`,
      async () => {
        const component: PresentComponent<string> = () => ({
          view({ attrs: { value } }) {
            return value;
          },
        });

        const { html } = await renderChild(
          o.root("userListing members username", {
            component,
            post: '.',
          }),
        );

        assertEquals(html,
            users[0]['https://todos.example.com/username']
          + users[1]['https://todos.example.com/username']
          + users[2]['https://todos.example.com/username']
          + users[3]['https://todos.example.com/username']
          + users[4]['https://todos.example.com/username']
          + users[5]['https://todos.example.com/username']
          + users[6]['https://todos.example.com/username']
          + users[7]['https://todos.example.com/username']
          + users[8]['https://todos.example.com/username']
          + users[9]['https://todos.example.com/username']
          + '.'
        );
        reset();
      },
    );
  }
});

Deno.test("o.root({ start })", async (t) => {
  const {
    users,
    root,
    select,
    reset,
    renderChild,
  } = await makeScenario();

  for (
    const o of [
      root,
      select,
    ]
  ) {
    await t.step(
      `Slices the start of a selection list using a "${o.octironType}" instance`,
      async () => {
        const component: PresentComponent<string> = () => ({
          view({ attrs: { value } }) {
            return value;
          },
        });

        const { html } = await renderChild(
          o.root("userListing members username", {
            component,
            start: 4
          }),
        );

        assertEquals(html,
            users[4]['https://todos.example.com/username']
          + users[5]['https://todos.example.com/username']
          + users[6]['https://todos.example.com/username']
          + users[7]['https://todos.example.com/username']
          + users[8]['https://todos.example.com/username']
          + users[9]['https://todos.example.com/username']
        );
        reset();
      },
    );
  }
});

Deno.test("o.root({ end })", async (t) => {
  const {
    users,
    root,
    select,
    reset,
    renderChild,
  } = await makeScenario();

  for (
    const o of [
      root,
      select,
    ]
  ) {
    await t.step(
      `Slices the end of a selection list using a "${o.octironType}" instance`,
      async () => {
        const component: PresentComponent<string> = () => ({
          view({ attrs: { value } }) {
            return value;
          },
        });

        const { html } = await renderChild(
          o.root("userListing members username", {
            component,
            end: 4,
          }),
        );

        assertEquals(html,
            users[0]['https://todos.example.com/username']
          + users[1]['https://todos.example.com/username']
          + users[2]['https://todos.example.com/username']
          + users[3]['https://todos.example.com/username']
        );
        reset();
      },
    );
  }
});

Deno.test("o.root({ predicate })", async (t) => {
  const {
    users,
    root,
    select,
    reset,
    renderChild,
  } = await makeScenario();

  for (
    const o of [
      root,
      select,
    ]
  ) {
    await t.step(
      `Filters a selection list using a "${o.octironType}" instance`,
      async () => {
        const component: PresentComponent<string> = () => ({
          view({ attrs: { value } }) {
            return value;
          },
        });

        const { html } = await renderChild(
          o.root("userListing members username", {
            component,
            predicate: (o) => {
              return o.value === users[1]['https://todos.example.com/username']
                || o.value === users[3]['https://todos.example.com/username']
              ;
            },
          }),
        );

        assertEquals(html,
            users[1]['https://todos.example.com/username']
          + users[3]['https://todos.example.com/username']
        );
        reset();
      },
    );
  }
});

Deno.test("o.root({ pre, sep, post, start, end, predicate })", async (t) => {
  const {
    users,
    root,
    select,
    reset,
    renderChild,
  } = await makeScenario();

  for (
    const o of [
      root,
      select,
    ]
  ) {
    await t.step(
      `Work in conjunction using a "${o.octironType}" instance`,
      async () => {
        const component: PresentComponent<string> = () => ({
          view({ attrs: { value } }) {
            return value;
          },
        });

        const { html } = await renderChild(
          o.root("userListing members username", {
            component,
            pre: 'Users: ',
            sep: ', ',
            post: '.',
            start: 2,
            end: 9,
            predicate: (o) => [
              users[1]['https://todos.example.com/username'],
              users[3]['https://todos.example.com/username'],
              users[5]['https://todos.example.com/username'],
              users[7]['https://todos.example.com/username'],
              users[9]['https://todos.example.com/username'],
            ].includes(o.value as string)
          }),
        );

        assertEquals(html, 'Users: '
          + users[3]['https://todos.example.com/username'] + ', '
          + users[5]['https://todos.example.com/username'] + ', '
          + users[7]['https://todos.example.com/username']
          + '.'
        );
        reset();
      },
    );
  }
});

Deno.test("o.root({ loading })", async (t) => {
  const {
    root,
    select,
    reset,
    renderChild,
  } = makeScenario();

  for (
    const o of [
      root,
      select,
    ]
  ) {
    await t.step(
      `Filters a selection list using a "${o.octironType}" instance`,
      async () => {
        const component: PresentComponent<string> = ({ attrs: o }) => ({
          view({ attrs: { o }}) {
            return 'RENDERED';
          },
        });

        const { html } = await renderChild(
          { maxRenders: 1 },
          o.root("userListing members username", {
            component,
            loading: 'LOADING',
          }),
        );

        assertEquals(html, 'LOADING');
        reset();
      },
    );
  }
});

Deno.test("o.root({ fallback })", async (t) => {
  const {
    root,
    select,
    reset,
    renderChild,
  } = makeScenario();

  for (
    const o of [
      root,
      select,
    ]
  ) {
    await t.step(
      `Filters a selection list using a "${o.octironType}" instance`,
      async () => {
        const component: PresentComponent<string> = () => ({
          view() {
            return 'RENDERED';
          },
        });

        const { html } = await renderChild(
          o.root('does not exits', {
            component,
            fallback: 'FALLBACK',
          }),
        );

        assertEquals(html, 'FALLBACK');
        reset();
      },
    );
  }
});
