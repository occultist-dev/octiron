import {makeTypeHandler, makeTypeHandlers} from "../../lib/octiron.ts";
import type { AnyComponent, EditComponent, PresentComponent } from "../../lib/types/octiron.ts";
import {getComponent} from "../../lib/utils/getComponent.ts";
import assert from 'node:assert/strict';
import {describe, it} from "node:test";


describe('getComponent()', async (t) => {
  const PresentFoo: PresentComponent<string> = () => {
    return {
      view() { return null },
    };
  };
  const PresentBar: PresentComponent<string> = () => {
    return {
      view() { return null },
    };
  };
  const PresentBaz: AnyComponent<string> = () => {
    return {
      view() { return null },
    };
  };
  const PresentFee: PresentComponent<string> = () => {
    return {
      view() { return null },
    };
  };
  const PresentFoe: PresentComponent<string> = () => {
    return {
      view() { return null },
    };
  };
  const EditFoe: EditComponent<string> = () => {
    return {
      view() { return null },
    };
  };
  const PresentFum: PresentComponent<string> = () => {
    return {
      view() { return null },
    };
  };
  const EditFum: EditComponent<string> = () => {
    return {
      view() { return null },
    };
  };

  assert.equal(PresentFoo, PresentFoo);
  assert.notEqual(PresentFoo, PresentBar);
  assert.notEqual(PresentBar, PresentBaz);

  const typeHandlers = makeTypeHandlers(
    {
      type: 'https://schema.example.com/fee',
      present: PresentFee,
    },
    {
      type: 'https://schema.example.com/foe',
      present: PresentFoe,
      edit: EditFoe,
    },
    {
      type: 'https://schema.example.com/fum',
      present: PresentFum,
      edit: EditFum,
    },
  );

  it('It returns the first pick component if provided', () => {
    const component = getComponent({
      style: 'present',
      type: ['https://schema.example.com/foe', 'https://schema.example.com/fum'],
      typeHandlers,
      propType: 'https://schema.example.com/fee',
      firstPickComponent: PresentBar,
      fallbackComponent: PresentBaz,
    });

    assert.equal(component, PresentBar);
  });

  it('It returns the propType on match when no first pick', () => {
    const component = getComponent({
      style: 'present',
      type: ['https://schema.example.com/fee', 'https://schema.example.com/fum'],
      typeHandlers,
      propType: 'https://schema.example.com/foe',
      fallbackComponent: PresentBaz,
    });

    assert.equal(component, PresentFoe);
  });

  it('It returns the edit component for the propType on match when no first pick', () => {
    const component = getComponent({
      style: 'edit',
      type: ['https://schema.example.com/fee', 'https://schema.example.com/fum'],
      typeHandlers,
      propType: 'https://schema.example.com/foe',
      fallbackComponent: PresentBaz,
    });

    assert.equal(component, EditFoe);
  });

  it('It returns the first type on match when no better match', () => {
    const component = getComponent({
      style: 'present',
      type: ['https://schema.example.com/fee', 'https://schema.example.com/fum'],
      typeHandlers,
      propType: 'https://schema.example.com/bar',
      fallbackComponent: PresentBaz,
    });

    assert.equal(component, PresentFee);
  });

  it('It returns the second type on match when no better match', () => {
    const component = getComponent({
      style: 'present',
      type: ['https://schema.example.com/baz', 'https://schema.example.com/fum'],
      typeHandlers,
      propType: 'https://schema.example.com/bar',
      fallbackComponent: PresentBaz,
    });

    assert.equal(component, PresentFum);
  });

  it('It returns the second type on match when no better match', () => {
    const component = getComponent({
      style: 'present',
      type: ['https://schema.example.com/baz', 'https://schema.example.com/fum'],
      typeHandlers,
      propType: 'https://schema.example.com/bar',
      fallbackComponent: PresentBaz,
    });

    assert.equal(component, PresentFum);
  });

  it('It returns the edit component for the second type on match when no better match', () => {
    const component = getComponent({
      style: 'edit',
      type: ['https://schema.example.com/baz', 'https://schema.example.com/fum'],
      typeHandlers,
      propType: 'https://schema.example.com/bar',
      fallbackComponent: PresentBaz,
    });

    assert.equal(component, EditFum);
  });

  it('It returns the fallback pick component when no other match', () => {
    const component = getComponent({
      style: 'present',
      type: 'https://schema.example.com/baz',
      typeHandlers,
      propType: 'https://schema.example.com/bar',
      fallbackComponent: PresentBaz,
    });

    assert.equal(component, PresentBaz);
  });

    it('It returns undefined when no fallback or other match', () => {
      const component = getComponent({
        style: 'present',
        type: 'https://schema.example.com/baz',
        typeHandlers,
        propType: 'https://schema.example.com/bar',
      });

      assert.equal(component, undefined);
    });
});
