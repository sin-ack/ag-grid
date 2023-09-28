export type DimensionValue = {
  type: 'dimension';
  number: number;
  units: string;
};

export const dimension = (value: number, units: string): DimensionValue => {
  return { type: 'dimension', number: value, units };
};

const numberWithUnits = /^([\d.]+)(\w+)$/;
const calcExpression = /^calc\(((?:[\d.]+\w+|[\s\d+\-*/)()])+)\)$/i;

export const parseCssDimension = (css: string): DimensionValue | null => {
  const numberMatch = css.match(numberWithUnits);
  if (numberMatch) {
    const number = parseFloat(numberMatch[1]);
    if (isNaN(number)) return null;
    return dimension(number, numberMatch[2]);
  }
  const calcMatch = css.match(calcExpression);
  if (calcMatch) {
    const expression = calcMatch[1];
    const unitsRegex = /[a-z]+/gi;
    const units = [...expression.matchAll(unitsRegex)].map((item) => item[0]);
    const unit = units[0];
    if (!unit) return null;
    if (units.find((otherUnit) => otherUnit !== unit)) return null;
    let result: unknown;
    try {
      result = eval(expression.replace(unitsRegex, '')) as unknown;
    } catch {
      return null;
    }
    if (typeof result !== 'number') return null;
    return dimension(result, unit);
  }
  return null;
};

export const dimensionToCss = ({ number, units }: DimensionValue): string => number + (units || '');
