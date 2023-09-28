import { BorderValue, borderToCss, parseCssBorder } from './border';
import { BorderStyleValue, parseCssBorderStyle } from './borderStyle';
import { ColorValue, colorToCss, parseCssColor } from './color';
import { DimensionValue, dimensionToCss, parseCssDimension } from './dimension';

export type ValueType = 'color' | 'dimension' | 'border' | 'borderStyle';

export type ValueByType = {
  color: ColorValue;
  dimension: DimensionValue;
  border: BorderValue;
  borderStyle: BorderStyleValue;
};

export type Value = ValueByType[ValueType];

export const parseCssString = (type: ValueType, css: string): Value | null => {
  switch (type) {
    case 'color':
      return parseCssColor(css);
    case 'dimension':
      return parseCssDimension(css);
    case 'border':
      return parseCssBorder(css);
    case 'borderStyle':
      return parseCssBorderStyle(css);
  }
};

export type VariableValues = Record<string, Value | null | undefined>;

export const valueToCss = (value: Value): string => {
  switch (value.type) {
    case 'color':
      return colorToCss(value);
    case 'dimension':
      return dimensionToCss(value);
    case 'border':
      return borderToCss(value);
    case 'borderStyle':
      return String(value);
  }
};
