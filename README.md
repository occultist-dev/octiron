# Octiron


Octiron is a frontend framework that can make selections
from linked-data APIs communicating in JSON-ld. Linked data
is data with hyperlinks pointing to other related API
endpoints, an Octiron selection is a list of types which
Octiron should traverse from one API point to another. If
a selection links to another point in the linked-data API
Octiron will automatically make the nessacary API requests
in order to complete its selection.

```typescript
const vdom = o.select('some api thing', o =>
  m('h1', o.select('name'))
);
```

Once a selection reaches its terminal point a view function
can be provided that has a new Octiron instance passed in
holding the selected value. Further selections can be made
from the point in the API referenced by the Octiron instance
and Mithril vdom can be returned.

In effect Octiron maps API data to HTML, or DOM


```typescript
function recipeSearchForm(o: Octiron) {
  // o.root() starts a selection from the root of the JSON-ld API
  return o.root('actions ListRecipesAction', o =>

    // o.perform() creates an action context. This only works because
    // the ListRecipesAction type is in the shape of a https://schema.org/Action.
    o.perform(o =>
      m(OctironForm, { o },
        m('.search-controls',
          // selecting the custom type of search will render out the globally
          // configured component for editing the search value
          o.select('search', {
            attrs: {
              autofocus: true,
            },
          }),
        ),

        o.initial(m('p', m('strong', 'Search for a recipe'))),

        // When the form is submitted, o.success() maps the response payload
        // against further seletions and mithril vdom.
        o.success(o => [
          o.not(isPopulated('members'),
            m('p', m('strong', 'No results')),
          ),

          o.select('members', o =>
            m('.card',
              m('.card-body.action-row',
                // o.present() presents the value of title using the globally
                // configured component for presenting title.
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
    ),
  );
}
```

