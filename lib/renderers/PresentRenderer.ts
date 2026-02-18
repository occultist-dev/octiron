import m from 'mithril';
import type { Octiron, OctironPresentArgs, CommonParentArgs, CommonRendererArgs } from '../types/octiron.ts';
import { selectComponentFromArgs } from '../utils/selectComponentFromArgs.ts';


export type PresentRendererAttrs = {
  o: Octiron;
  args: OctironPresentArgs;
  factoryArgs: OctironPresentArgs;
  parentArgs: CommonParentArgs;
  rendererArgs: CommonRendererArgs;
};

export const PresentRenderer: m.ComponentTypes<PresentRendererAttrs> = ({
  attrs: {
    args,
    factoryArgs,
    parentArgs,
    rendererArgs,
  },
}) => {
  let [attrs, component] = selectComponentFromArgs(
    'present',
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
        renderType: "present",
        value: rendererArgs.value,
        attrs,
      }, children);
    },
  };
};
