import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Value, parseCssString } from 'model/values';
import { border } from 'model/values/border';
import { borderStyle } from 'model/values/borderStyle';
import { color } from 'model/values/color';
import { dimension } from 'model/values/dimension';
import { getVariableInfoOrThrow } from 'model/variableInfo';
import { useCallback } from 'react';

const computedValueGetterAtom = atom<ComputedValueGetter | null>(null);

export const useGetVariableDefault = () => {
  const valueGetter = useAtomValue(computedValueGetterAtom);

  return useCallback(
    (variableName: string) => {
      if (!valueGetter) {
        throw new Error(
          `${useGetVariableDefault.name} used before ${useSetVariableDefaultsElement.name}`,
        );
      }

      return (
        valueGetter.getComputedValue(variableName) ||
        defaultValueIfNoneSpecifiedInTheme(variableName)
      );
    },
    [valueGetter],
  );
};

export const useSetVariableDefaultsElement = () => {
  const set = useSetAtom(computedValueGetterAtom);
  return useCallback(
    (element: HTMLElement) => {
      set(new ComputedValueGetter(element));
    },
    [set],
  );
};

const defaultValueIfNoneSpecifiedInTheme = (variableName: string): Value => {
  const info = getVariableInfoOrThrow(variableName);
  switch (info.type) {
    case 'color':
      return color('#999');
    case 'dimension':
      return dimension(1, 'px');
    case 'border':
      return border('solid', dimension(1, 'px'), color('#999'));
    case 'borderStyle':
      return borderStyle('solid');
  }
};

class ComputedValueGetter {
  private cache: Record<string, Value | null | undefined> = {};
  private styleMap: StylePropertyMapReadOnly;
  constructor(element: HTMLElement) {
    this.styleMap = element.computedStyleMap();
  }

  getComputedValue(variableName: string): Value | null {
    const cachedValue = this.cache[variableName];
    if (cachedValue) return cachedValue;

    const info = getVariableInfoOrThrow(variableName);
    const cssValue = this.styleMap.get(variableName);
    if (!cssValue) return null;
    return (this.cache[variableName] = parseCssString(info.type, String(cssValue)));
  }
}
