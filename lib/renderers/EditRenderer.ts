import m from 'mithril';
import type { Spec, OctironActionSelection, OctironEditArgs, ActionSelectionParentArgs, ActionSelectionRendererArgs } from '../types/octiron.js';
import { selectComponentFromArgs } from '../utils/selectComponentFromArgs.js';


export type EditRendererAttrs = {
  o: OctironActionSelection;
  args: OctironEditArgs;
  factoryArgs: OctironEditArgs;
  parentArgs: ActionSelectionParentArgs;
  rendererArgs: ActionSelectionRendererArgs;
};

export const EditRenderer: m.ComponentTypes<EditRendererAttrs> = ({
  attrs: {
    args,
    factoryArgs,
    parentArgs,
    rendererArgs,
  },
}) => {
  const [attrs, component] = selectComponentFromArgs(
    'edit',
    parentArgs,
    rendererArgs,
    args,
    factoryArgs,
  );

  return {
    //onbeforeupdate({ attrs: { args, factoryArgs, parentArgs, rendererArgs }}) {
      // [attrs, component] = selectComponentFromArgs(
      //   'present',
      //   parentArgs,
      //   rendererArgs,
      //   args,
      //   factoryArgs,
      // );
    //},
    view({ attrs: { o, rendererArgs }, children }) {
      if (component == null) {
        return null;
      }

      // deno-lint-ignore no-explicit-any
      return m(component as any, {
        o,
        attrs,
        renderType: "edit",
        name: o.inputName,
        value: rendererArgs.value,
        spec: rendererArgs.spec as Spec,
        onchange: rendererArgs.update,
        onChange: rendererArgs.update,
      }, children);
    },
  };
};
