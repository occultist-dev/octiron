// import { DOMParser, type HTMLDocument } from "@b-fuze/deno-dom";
// import { assert, assertEquals } from "@std/assert";
// import { assertArrayIncludes } from "@std/assert/array-includes";
// import m from "mithril";
// import render from "mithril-node-render";
// import { rootFactory } from "../../lib/factories/rootFactory.ts";
// import { selectionFactory } from "../../lib/factories/selectionFactory.ts";
// import type { IRIObject, JSONObject } from "../../lib/types/common.ts";
// import type { PresentComponent } from "../../lib/types/octiron.ts";
// import { isJSONObject } from "../../lib/utils/isJSONObject.ts";
// import * as mocks from "../mocks.ts";
// import type { EntityState } from "../../lib/types/store.ts";


// function makeScenario() {
//   const users = [
//     mocks.createUser({ username: 'jane' }),
//     mocks.createUser({ username: 'teddy' }),
//     mocks.createUser({ username: 'foster' }),
//     mocks.createUser({ username: 'geriah' }),
//     mocks.createUser({ username: 'sally' }),
//     mocks.createUser({ username: 'bob' }),
//     mocks.createUser({ username: 'harrold' }),
//     mocks.createUser({ username: 'rosey' }),
//     mocks.createUser({ username: 'randald' }),
//     mocks.createUser({ username: 'harley' }),
//   ] as const;
//   const todos = [
//     mocks.createTodo({
//       assignee: users[0]["@id"],
//     }),
//     mocks.createTodo({
//       assignee: users[1]["@id"],
//     }),
//     mocks.createTodo({
//       assignee: users[2]["@id"],
//     }),
//     mocks.createTodo({
//       assignee: users[3]["@id"],
//     }),
//   ] as const;
//   const api = mocks.makeAPI([
//     mocks.createAPIRoot(),
//     mocks.createUserListing({ users: users as unknown as JSONObject[] }),
//     mocks.createTodoListing({ todos: todos as unknown as JSONObject[] }),
//     ...users,
//     ...todos,
//   ] as IRIObject[]);

//   let responses: Array<Promise<Response>> = [];
//   function responseHook(res: Promise<Response>) {
//     responses.push(res);
//   }

//   const [fetcher, fetcherHook] = mocks.makeFetcherHook({
//     api,
//   });

//   const primary: Record<string, EntityState> = {};
//   const store = mocks.makeStore({
//     fetcher,
//     responseHook,
//     primary,
//   })
//   const root = rootFactory({
//     store,
//     typeDefs: {},
//   });
//   const select = selectionFactory({
//     store,
//     typeDefs: {},
//   });

//   function reset() {
//     for (const key of Object.keys(primary)) {
//       delete primary[key];
//     }
//   }

//   type RenderChildArgs = {
//     maxRenders?: number;
//   };

//   // deno-lint-ignore no-explicit-any
//   function isRenderChildArgs(value: any): value is m.Children {
//     return isJSONObject(value) && Object.hasOwn(value, 'tag');
//   }


//   async function renderChild(
//     children: m.Children,
//   ): Promise<{
//     html: string;
//     dom: HTMLDocument;
//   }>;

//   async function renderChild(
//     args: RenderChildArgs,
//     children: m.Children,
//   ): Promise<{
//     html: string;
//     dom: HTMLDocument;
//   }>;

//   async function renderChild(
//     arg1: RenderChildArgs | m.Children,
//     arg2?: m.Children,
//   ) {
//     let maxRenders: number | undefined;
//     let children: m.Children;

//     if (isRenderChildArgs(arg2)) {
//       maxRenders = (arg1 as RenderChildArgs).maxRenders;
//       children = arg2;
//     } else if (isRenderChildArgs(arg1)) {
//       children = arg1;
//     }

//     let count = 0;
//     let renderPasses = 0;
//     let currentLength = 0;
//     let html: string = '';
//     const component: m.ComponentTypes = {
//       view: () => {
//         return children;
//       },
//     };

//     responses = [];

//     do {
//       let loopLength = (currentLength = responses.length);

//       html = await render(m(component));
//       renderPasses++;


//       while (loopLength !== responses.length) {
//         loopLength = responses.length;

//         await Promise.all(responses);
//         count++;
//       }

//       if (maxRenders != null && renderPasses === maxRenders) {
//         const dom = new DOMParser().parseFromString(html, "text/html");

//         return { html, dom }
//       }
//     } while (responses.length !== currentLength);

//     html = await render(m(component));

//     const dom = new DOMParser().parseFromString(html, "text/html");

//     return { html, dom };
//   }

//   return {
//     users,
//     todos,
//     fetcherHook,
//     store,
//     root,
//     select,
//     reset,
//     renderChild,
//   };
// }



// Deno.test('ActionSelectable.select()', async (t) => {

// })
