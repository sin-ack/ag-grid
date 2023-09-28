import { BorderValue } from 'model/values/border';
import { color } from 'model/values/color';
import { dimension } from 'model/values/dimension';
import { ColorVariableInfo, DimensionVariableInfo } from 'model/variableInfo';
import { useRef } from 'react';
import { ColorInput } from './ColorInput';
import { DimensionInput } from './DimensionInput';
import { Input } from './Input';

const borderColorInfo: ColorVariableInfo = { type: 'color' };
const defaultBorderColor = color('#999');
const borderWidthInfo: DimensionVariableInfo = { type: 'dimension', min: 0, max: 50, step: 1 };
const defaultBorderWidth = dimension(1, 'px');

export const BorderInput: Input<'border'> = (props) => {
  const propsRef = useRef(props);
  propsRef.current = props;

  const onChange = (change: Partial<BorderValue>) => {
    props.onValueChange({ ...props.value, ...change });
  };

  return (
    <>
      {/* {props.info.style && (
        <ColorInput
          info={borderColorInfo}
          value={props.value.color || defaultColor}
          onValueChange={(color) => onChange({ color })}
          error={null}
          onErrorChange={props.onErrorChange}
        />
      )} */}
      {props.info.width && (
        <DimensionInput
          info={borderWidthInfo}
          value={props.value.width || defaultBorderWidth}
          onValueChange={(width) => onChange({ width })}
          error={null}
          onErrorChange={props.onErrorChange}
        />
      )}
      {props.info.color && (
        <ColorInput
          info={borderColorInfo}
          value={props.value.color || defaultBorderColor}
          onValueChange={(color) => onChange({ color })}
          error={null}
          onErrorChange={props.onErrorChange}
        />
      )}
    </>
  );
};
