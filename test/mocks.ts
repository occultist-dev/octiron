import { faker } from '@faker-js/faker';
import type { Children } from "mithril";
import { Store, type StoreArgs } from "../lib/store.ts";
import type { IRIObject, JSONObject } from "../lib/types/common.ts";
import type { Aliases, AlternativesState, EntityState, Fetcher, FetcherArgs, Handler, ResponseHook } from "../lib/types/store.ts";
import { flattenIRIObjects } from "../lib/utils/flattenIRIObjects.ts";
import {makeJSONLDHandler} from '../lib/octiron.ts';

export type TodoStatus =
  | "todo"
  | "in-progress"
  | "done";

export const todosRootIRI = 'https://example.com/api';
export const todosVocab = 'https://todos.example.com/';
export const scmVocab = 'https://schema.org/';

export const TodoTypes = {
  potentialAction: "https://schema.org/potentialAction",
  target: "https://schema.org/target",
  urlTemplate: "https://schema.org/urlTemplate",
  httpMethod: "https://schema.org/httpMethod",
  contentType: "https://schema.org/contentType",
  encodingType: "https://schema.org/encodingType",
  PropertyValueSpecification: "https://schema.org/PropertyValueSpecification",
  readonlyValue: "https://schema.org/readonlyValue",
  valueName: "https://schema.org/valueName",
  valueRequired: "https://schema.org/valueRequired",
  defaultValue: "https://schema.org/defaultValue",
  minValue: "https://schema.org/minValue",
  maxValue: "https://schema.org/maxValue",
  stepValue: "https://schema.org/stepValue",
  valuePattern: "https://schema.org/valuePattern",
  multipleValue: "https://schema.org/multipleValue",
  valueMinLength: "https://schema.org/valueMinLength",
  valueMaxLength: "https://schema.org/valueMaxLength",
  
  Listing: "https://todos.example.com/Listing",
  members: "https://todos.example.com/members",

  APIRoot: "https://todos.example.com/Todo",
  Todo: "https://todos.example.com/Todo",
  TodoListing: "https://todos.example.com/TodoListing",
  todoListing: "https://todos.example.com/todoListing",
  todo: "https://todos.example.com/todo",
  steps: "https://todos.example.com/steps",
  text: "https://todos.example.com/text",
  todos: "https://todos.example.com/todos",
  title: "https://schema.org/name", // correct use of schema.org/name I believe
  description: "https://schema.org/description",
  status: "https://todos.example.com/status",
  assignee: "https://todos.example.com/assignee",
  subtodos: "https://todos.example.com/subtodos",

  CreateTodoAction: 'https://todos.example.com/CreateTodoAction',

  User: "https://todos.example.com/User",
  UserListing: "https://todos.example.com/UserListing",
  userListing: "https://todos.example.com/userListing",
  user: "https://todos.example.com/user",
  users: "https://todos.example.com/users",
  username: "https://todos.example.com/username",
  email: "https://todos.example.com/email",
} as const;

const used: string[] = [];
function makeUniqueId() {
  let uniqueId: string;

  do {
    uniqueId = Math.random().toString(16).split(".")[1];
    used.push(uniqueId);
  } while (!used.includes(uniqueId));

  return uniqueId;
}

function makeIRI(type: string) {
  return `${todosRootIRI}/${type}`;
}

function makeDetailIRI(type: string) {
  return `${makeIRI(type)}/${makeUniqueId()}`;
}

export function createAPIRoot() {
  return {
    "@id": todosRootIRI,
    "@type": TodoTypes.APIRoot,
    [TodoTypes.userListing]: {
      "@id": makeIRI('users'),
      "@type": TodoTypes.UserListing,
    },
    [TodoTypes.todoListing]: {
      "@id": makeIRI('todos'),
      "@type": TodoTypes.TodoListing,
    },
  };
}

export function createUser({
  username = faker.internet.username(),
  email = faker.internet.email(),
}: {
  username?: string;
  email?: string;
} = {}) {
  return {
    "@id": makeDetailIRI("users"),
    "@type": TodoTypes.User,
    [TodoTypes.username]: username,
    [TodoTypes.email]: email,
  } as const;
}

export type MockUser = ReturnType<typeof createUser>;

export function createUserListing<
  const T extends JSONObject,
>({
  users,
}: {
  users: Array<T>;
}) {
  return {
    "@id": makeIRI("users"),
    "@type": [TodoTypes.UserListing, TodoTypes.Listing],
    [TodoTypes.members]: users,
  } as const;
}


export function createEpic<
  const T extends JSONObject,
>({
  title = faker.word.words(3),
  description = faker.lorem.sentences(),
  status = faker.helpers.arrayElement<TodoStatus>(['todo', 'in-progress', 'done']),
  assignee,
  subtodos,
}: {
  title?: string;
  description?: string;
  status?: TodoStatus;
  assignee: string;
  subtodos: T[];
}) {
  return {
    "@id": makeDetailIRI("todos"),
    "@type": TodoTypes.Todo,
    [TodoTypes.title]: title,
    [TodoTypes.description]: description,
    [TodoTypes.status]: status,
    [TodoTypes.assignee]: { "@id": assignee },
    [TodoTypes.subtodos]: subtodos,
  } as const;
}


export function createTodo({
  title = faker.word.words(3),
  description = faker.lorem.sentences(),
  status = faker.helpers.arrayElement<TodoStatus>(['todo', 'in-progress', 'done']),
  assignee,
}: {
  title?: string;
  description?: string;
  status?: TodoStatus;
  assignee: string;
}) {
  return {
    "@id": makeDetailIRI("todos"),
    "@type": TodoTypes.Todo,
    [TodoTypes.title]: title,
    [TodoTypes.description]: description,
    [TodoTypes.status]: status,
    [TodoTypes.assignee]: { "@id": assignee },
  } as const;
}

export type MockTodo = ReturnType<typeof createTodo>;

export function createTodoAction() {
  return {
    '@id': `${todosRootIRI}/create-todo`,
    '@type': TodoTypes.CreateTodoAction,
    [TodoTypes.target]: [
      {
        [TodoTypes.urlTemplate]: makeIRI('todos'),
        [TodoTypes.httpMethod]: 'POST',
        [TodoTypes.contentType]: 'multipart/form-data',
      },
      {
        [TodoTypes.urlTemplate]: makeIRI('todos'),
        [TodoTypes.httpMethod]: 'POST',
        [TodoTypes.contentType]: 'application/ld+json',
      },
    ],
    [TodoTypes.steps]: {
      [`${TodoTypes.text}-input`]: {
        '@type': TodoTypes.PropertyValueSpecification,
        [TodoTypes.valueRequired]: true,
        [TodoTypes.valueMinLength]: 10,
      }
    },
    [`${TodoTypes.steps}-input`]: {
      '@type': TodoTypes.PropertyValueSpecification,
      [TodoTypes.valueRequired]: true,
      [TodoTypes.multipleValue]: true,
      [TodoTypes.valueMinLength]: 1,
    },
  };
}

export function createTodoListing<
  const T,
>({
  todos,
}: {
  todos: Array<T>;
}) {
  return {
    "@id": makeIRI("todos"),
    "@type": [TodoTypes.TodoListing, TodoTypes.Listing],
    [TodoTypes.members]: todos,
    [TodoTypes.potentialAction]: {
      '@id': `${todosRootIRI}/create-todo`,
      '@type': TodoTypes.CreateTodoAction,
    },
  } as const;
}

/**
 * Transforms one or many entities into entity state
 * objects. The given entities should be in their
 * expanded form. The first argument provides JSON-LD
 * context values if required.
 *
 * @param args.vocab - The JSON-LD `@vocab` value
 * @param args.aliases - Object of alias: vocab mappings for the
 *                       JSON-LD context
 * @param {...*} entities - Entities to transform into entity state.
 */
export function toEntityState({
  vocab,
  aliases = {},
}: {
  vocab?: string;
  aliases?: Aliases;
}, ...entities: JSONObject[]): NonNullable<StoreArgs['primary']> {
  const ctx: JSONObject = aliases;

  if (vocab != null) {
    ctx['@vocab'] = vocab;
  }

  const result: StoreArgs['primary'] = {};

  for (const entity of flattenIRIObjects(entities)) {
    result[entity["@id"]] = {
      iri: entity["@id"],
      ok: true,
      loading: false,
      value: entity,
    };
  }

  return result;
}

export function createEntityState(url: string, value: IRIObject): StoreArgs['primary'] {
  return {
    [url]: {
      iri: value['@id'],
      ok: true,
      loading: false,
      value,
    },
  };
}

export type MockAPI = Record<string, IRIObject>

export function makeAPI(responses: IRIObject[]): MockAPI {
  return responses.reduce((acc, entity) => {
    return {
      ...acc,
      [entity['@id']]: entity,
    };
  }, {});
}

export type Listener = (
  iri: string,
  args: FetcherArgs,
) => void;
export type ListenHook = (listener: Listener) => void;

export function makeFetcherHook({
  api,
}: {
  api?: MockAPI
} = {}): [Fetcher, ListenHook] {
  let runner: Listener | undefined;

  const fetcher: Fetcher = (iri: string, args: FetcherArgs) => {
    if (typeof runner === 'function') {
      runner(iri, args);
    }

    if (api != null) {
      const result = api[iri];

      if (result != null) {
        const res = new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            'content-type': 'application/ld+json',
          },
        });

        return Promise.resolve(res);
      }
    }

    return fetch(iri, args);
  }

  const fetcherHook: ListenHook = (listener) => {
    runner = listener;
  }

  return [fetcher, fetcherHook];
}

export function makeDom() {
  const dom = new DOMParser().parseFromString(`<div id="app"></div>`, "text/html");

  return dom.getElementById('app');
}

export function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function component(children: Children) {
  return {
    view: () => {
      return children;
    },
  };
}

export function makeStore({
  rootIRI = todosRootIRI,
  vocab = todosVocab,
  aliases = {
    scm: scmVocab,
  },
  primary,
  headers,
  origins,
  alternatives,
  fetcher,
  responseHook,
  handlers = [
    makeJSONLDHandler(),
  ],
}: {
  rootIRI?: string;
  vocab?: string;
  aliases?: Record<string, string>;
  primary?: Record<string, EntityState>;
  headers?: Record<string, string>;
  origins?: Record<string, Record<string, string>>;
  alternatives?: AlternativesState;
  fetcher?: Fetcher;
  responseHook?: ResponseHook;
  handlers?: Handler[],
}) {
  return new Store({
    rootIRI,
    vocab,
    aliases, 
    headers,
    origins,
    primary,
    alternatives,
    responseHook,
    handlers,
    fetcher,
  });
}
