import * as AriaUtils from './aria';
import * as ArrayUtils from './array';
import * as BrowserUtils from './browser';
import * as DateUtils from './date';
import * as DomUtils from './dom';
import * as EventUtils from './event';
import * as FunctionUtils from './function';
import * as FuzzyMatchUtils from './fuzzyMatch';
import * as GenericUtils from './generic';
import * as IconUtils from './icon';
import * as KeyboardUtils from './keyboard';
import * as MapUtils from './map';
import * as MouseUtils from './mouse';
import * as NumberUtils from './number';
import * as ObjectUtils from './object';
import * as RowNodeUtils from './rowNode';
import * as SetUtils from './set';
import * as StringUtils from './string';
import { _ } from './utils';

it('exports all util methods', () => {
    const combinedMethodCount = NumberUtils.sum([
        AriaUtils,
        ArrayUtils,
        BrowserUtils,
        DateUtils,
        DomUtils,
        EventUtils,
        FunctionUtils,
        FuzzyMatchUtils,
        GenericUtils,
        IconUtils,
        KeyboardUtils,
        MapUtils,
        MouseUtils,
        NumberUtils,
        ObjectUtils,
        RowNodeUtils,
        SetUtils,
        StringUtils,
    ].map(x => Object.keys(x).length));

    const exportedMethodCount = Object.keys(_).length;

    expect(exportedMethodCount).toBe(combinedMethodCount);
});

it('areEqual', () => {
    expect(_.isOnlySimpleTypesAndDeeplyEqual(null, null)).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual(undefined, undefined)).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual(null, undefined)).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual(undefined, null)).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual(1, 1)).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual(1, 2)).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual('a', 'a')).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual('a', 'b')).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual(true, true)).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual(true, false)).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual(false, false)).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual(false, true)).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual([1, 2], [1, 2])).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual([1, 2], [2, 1])).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1 }, { b: 1 })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1 }, { b: 2 })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: true }, { a: 1, b: true })).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: true }, { a: 1, b: 1 })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: 2 }, { a: 1, c: 3 })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: 2 }, { a: 1, b: 2, c: 3 })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3 })).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 4 })).toBe(false);

    // Don't compare functions alwasy return false
    const callback = () => { };
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: callback }, { a: 1, b: callback })).toBe(false);

    // Test nested objects
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3 } })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { d: 2 } })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { d: 3 } })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2, d: 3 } })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: { c: 2, d: 3 } }, { a: 1, b: { c: 2 } })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: { c: 2, d: 3 } }, { a: 1, b: { c: 2, d: 3 } })).toBe(true);

    // Test nested arrays
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: [1, 2, 3] }, { a: 1, b: [1, 2, 3] })).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: [1, 2, 3] }, { a: 1, b: [1, 2, 4] })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: [1, 2, 3] }, { a: 1, b: [1, 2] })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: [1, 2] }, { a: 1, b: [1, 2, 3] })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: [1, 2, 3] }, { a: 1, b: [1, 2, 3, 4] })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: [1, 2, 3, 4] }, { a: 1, b: [1, 2, 3] })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: [1, 2, 3, 4] }, { a: 1, b: [1, 2, 3, 4] })).toBe(true);

    // Test nested arrays and objects
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: [1, 2, { c: 3 }] }, { a: 1, b: [1, 2, { c: 3 }] })).toBe(true);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: [1, 2, { c: 3, d: callback }] }, { a: 1, b: [1, 2, { c: 3, d: callback }] })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: [1, 2, { c: 3 }] }, { a: 1, b: [1, 2, { c: 4 }] })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: [1, 2, { c: 3 }] }, { a: 1, b: [1, 2, { d: 3 }] })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: [1, 2, { c: 3 }] }, { a: 1, b: [1, 2, { d: 4 }] })).toBe(false);
    expect(_.isOnlySimpleTypesAndDeeplyEqual({ a: 1, b: [1, 2, { c: 3 }] }, { a: 1, b: [1, 2, { c: 3, d: 4 }] })).toBe(false);


})