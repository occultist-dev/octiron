# Octiron


Octiron is a frontend framework that can make selections
from linked-data APIs communicating in JSON-ld. Linked data
is data with hyperlinks pointing to other related API
endpoints, an Octiron selection is a list of properties
(or types) which Octiron should traverse, within local data,
or referenced API endpoints. If a selection links to another
point in the linked-data API Octiron will automatically make
the necessary API requests in order to complete its selection.

Once a selection reaches its terminal point a view function
can be provided that has a new Octiron instance passed in
holding the selected value. Further selections can be made
from the point in the API referenced by the Octiron instance
and Mithril vdom can be returned.

```typescript
const o = new Octiron({
  apiRoot: 'https://example.com',
});

const vdom = o.select('some nested api thing', o =>
  m('h1', o.select('name', o => o.value))
);
```

Properties, (called types) of JSON-ld objects can be pre-configured
with global type handlers. If no arguments are provided to the
`o.select()` method after the seletion, the globally configured
type handler will be used to render the value.

```typescript
const PresentMeters = {
  view({ attrs: { value } }) {
    return value + 'm';
  }
};
const o = new Octiron({
  apiRoot: 'https://example.com',
  typeHandlers: {
    height: { present: PresentMeters },
  },
});

const vdom = o.select('empire states building', o =>
  m('dl',
    m('dt', 'Height'),
    // o.select('height') requires no futher arguments.
    m('dd', o.select('height')),
  )
);
```

Octiron can also build requests with parameters mapped to
the URL and body of the request by performing actions.
Supported actions share the shape of
[schema.org actions](https://schema.org/Action).
Octiron will only render a `o.perform()` view if the API
responds with a valid schema.org action object.

The `o.initial()` method renders its children if the action
is in its initial state. The `o.success()` method injects
an Octiron instance holding the response data which can
have further selections performed on it.

The Octiron instance created from `o.perform()` is special.
Any selections made against it render an edit component
selecting from the payload. The `o.select('search')` in this
example would render a search box if such a component had
been configured globally.

```typescript
function recipeSearchForm(o: Octiron) {
  return o.perform('actions ListRecipesAction', o =>
    m(OctironForm, { o },
      m('.search-controls',
        o.select('search'),
      ),

      o.initial(m('p', m('strong', 'Search for a recipe'))),

      o.success(o => [
        o.not(isPopulated('members'),
          m('p', m('strong', 'No results')),
        ),

        o.select('members', o =>
          m('.card',
            m('.card-body.action-row',
              o.select('title', o => m('h3.start', o.present())),
              o.select('url', o => m('.end', o.present({
                attrs: {
                  text: 'View recipe',
                },
              }))),
            ),
          ),
        ),
      ]),
    ),
  );
}
```

