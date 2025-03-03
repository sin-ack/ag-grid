import { Atom, WritableAtom, createStore } from 'jotai';
import { Feature, getFeatureOrThrow } from 'model/features';
import { Theme, alpineDarkTheme, alpineTheme, getThemeOrThrow } from 'model/themes';
import { logErrorMessage, mapPresentObjectValues } from 'model/utils';
import { VariableValues, parseCssString, valueToCss } from 'model/values';
import { getVariableInfoOrThrow } from 'model/variables';
import { throttle } from 'throttle-debounce';
import { enabledFeaturesAtom } from './enabledFeatures';
import { parentThemeAtom } from './parentTheme';
import { allValueAtoms, valuesAtom } from './values';

export const initStore = () => {
  const defaultTheme =
    typeof window === 'object' &&
    window.document.documentElement.computedStyleMap().get('--color-scheme')?.toString() === 'dark'
      ? alpineDarkTheme
      : alpineTheme;

  const store = createStore();
  restoreValue('parentTheme', deserializeTheme, store, parentThemeAtom, defaultTheme);
  restoreValue('enabledFeatures', deserializeEnabledFeatures, store, enabledFeaturesAtom);
  restoreValue('values', deserializeValues, store, valuesAtom);

  const saveState = throttle(
    100,
    () => {
      persistValue('parentTheme', serializeTheme, store, parentThemeAtom);
      persistValue('enabledFeatures', serializeEnabledFeatures, store, enabledFeaturesAtom);
      persistValue('values', serializeValues, store, valuesAtom);
    },
    { noLeading: true },
  );
  for (const atom of [parentThemeAtom, enabledFeaturesAtom, ...allValueAtoms]) {
    store.sub(atom, saveState);
  }

  return store;
};

type Store = ReturnType<typeof initStore>;

const persistValue = <T>(
  key: string,
  serialize: (value: T) => unknown,
  store: Store,
  atom: Atom<T>,
) => {
  const value = store.get(atom);
  if (value === undefined) {
    localStorage.removeItem(storageKey(key));
    return;
  }
  localStorage.setItem(storageKey(key), JSON.stringify(serialize(value)));
};

const restoreValue = <T>(
  key: string,
  deserialize: (value: unknown) => T,
  store: Store,
  atom: WritableAtom<T, [T], void>,
  defaultValue?: T,
) => {
  const storedString = localStorage.getItem(storageKey(key));
  if (storedString == null) {
    if (defaultValue != null) {
      store.set(atom, defaultValue);
    }
    return;
  }
  let storedValue: unknown;
  try {
    storedValue = JSON.parse(storedString);
  } catch {
    logErrorMessage(`Failed to parse stored JSON for ${key}: ${storedString}`);
    return;
  }
  try {
    store.set(atom, deserialize(storedValue));
  } catch (e) {
    logErrorMessage(`Failed to deserialize value for ${key}: ${storedString}`, e);
    return;
  }
};

const storageKey = (key: string) => `theme-builder.theme-state.${key}`;

const serializeTheme = (theme: Theme) => theme.name;

const deserializeTheme = (themeName: unknown) => {
  if (typeof themeName !== 'string') {
    throw new Error('expected string');
  }
  return getThemeOrThrow(themeName);
};

const serializeEnabledFeatures = (features: Feature[]) => features.map((f) => f.name);

const deserializeEnabledFeatures = (featureNames: unknown): Feature[] => {
  if (!Array.isArray(featureNames)) {
    throw new Error('expected array');
  }
  return featureNames.map(getFeatureOrThrow);
};

const serializeValues = (values: VariableValues) => mapPresentObjectValues(values, valueToCss);

const deserializeValues = (serialized: unknown): VariableValues => {
  if (!serialized || typeof serialized !== 'object' || Array.isArray(serialized)) {
    throw new Error('expected object');
  }
  const result: VariableValues = {};
  for (const [variableName, serializedValue] of Object.entries(
    serialized as Record<string, unknown>,
  )) {
    if (typeof serializedValue !== 'string') {
      throw new Error(`Expected string value for ${variableName} key`);
    }
    const info = getVariableInfoOrThrow(variableName);
    const value = parseCssString(info.type, serializedValue);
    if (value == null)
      throw new Error(`Failed to parse CSS ${info.type} value ${JSON.stringify(serializedValue)}`);
    result[variableName] = value;
  }
  return result;
};
