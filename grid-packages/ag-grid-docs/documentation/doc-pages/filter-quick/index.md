---
title: "Quick Filter"
---

Quick Filter is a piece of text given to the grid (typically the user will type it in somewhere in your application) that is used to filter rows by comparing against the data in all columns. This can be used in addition to column-specific filtering.

## Setting the Quick Filter

<grid-example title='Quick Filter' name='quick-filter' type='generated'></grid-example>

<framework-specific-section frameworks="react">

You can set the Quick Filter text via the `quickFilterText` grid option.

<snippet>
|const gridOptions = {
|    quickFilterText: 'new filter text'
|}
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="javascript,angular,vue">

You can set the Quick Filter text by calling the `setQuickFilter()` method on the grid API.

<snippet>
api.setQuickFilter('new filter text');
</snippet>

You can also set the initial Quick Filter text via the `quickFilterText` grid option.

</framework-specific-section>

The provided Quick Filter text will be split into words, and each word will be compared against the row. A word matches the row if the string value of any of the columns contains the word (the check is case insensitive). All words must match the row for it to be included. For example, if the text is "Tony Ireland", the Quick Filter will only include rows with both "Tony" AND "Ireland" in them.

## Checking the Quick Filter

Usually the state of the Quick Filter text would be maintained outside of the grid. However, it's possible to check whether the Quick Filter is applied via the API method `isQuickFilterPresent()`, and get the current text via `getQuickFilter()`.

## Overriding the Quick Filter Value

If your data contains complex objects, the Quick Filter will end up comparing against `[object Object]` instead of searchable string values. In this case you will need to implement `getQuickFilterText` to extract a searchable string from your complex object. 

Alternatively, you might want to format string values specifically for searching (e.g. replace accented characters in strings, or remove commas from numbers).

Finally, if you want a column to be ignored by the Quick Filter, have `getQuickFilterText` return an empty string `''`.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'country',
            getQuickFilterText: params => {
                return params.value.name;
            }
        }
    ]
}
</snippet>


<note>
The Quick Filter will work 'out of the box' in most cases, so you should only override the Quick Filter value if you have a particular problem to resolve.
</note>

## Quick Filter Cache

By default, the Quick Filter checks each column's value, including running value getters if present, every time the Quick Filter is executed. If your data set is large, you may wish to enable the Quick Filter cache by setting `cacheQuickFilter = true`.

When the cache is enabled, a 'Quick Filter text' is generated for each node by concatenating all the values for each column. For example, a table with columns of "Employee Name" and "Job" could have a row with Quick Filter text of `'NIALL CROSBY\nCOFFEE MAKER'`. The grid then performs a simple string search, so if you search for `'Niall'`, it will find our example text. Joining all the column values into one string gives a performance boost. The values are joined after the Quick Filter is requested for the first time and stored in the `rowNode` - the original data that you provide is not changed.

### Reset Cache Text

When in use, the Quick Filter cache text can be manually reset in one of the following ways:

- Each Row Node has a `resetQuickFilterAggregateText()` method on it, which can be called to reset the cache text.
- `api.resetQuickFilter()` will reset the cache text on every Row Node.

[Updating Data](/data-update/), [Cell Editing](/cell-editing/), [Excluding/Including Hidden Columns](#include-hidden-columns) from the Quick Filter, and [Updating Column Definitions](/column-updating-definitions/) will automatically reset the cache text on any affected Row Nodes.

## Include Hidden Columns

By default the Quick Filter will only check visible column values. If you want to check hidden column values, then you can set the grid option `includeHiddenColumnsInQuickFilter = true`. Note that if you have a large number of hidden columns then this can have a performance impact.

This can also be set via the API method `setIncludeHiddenColumnsInQuickFilter`.

## Quick Filter Parser

By default the Quick Filter splits the text into a list of words which are then compared against each row. You may want to override this behaviour, for example to allow using quotes to search for exact string values. This is possible by providing a `quickFilterParser`. Note that the value passed to the parser will have already been converted to upper case.

<snippet>
const gridOptions = {
    // split words by comma instead of space
    quickFilterParser: (quickFilter) => quickFilter.split(','),
}
</snippet>

## Quick Filter Matcher

The default behaviour of the Quick Filter is to check whether every search term in the parsed Quick Filter text appears in the [Quick Filter Value](#overriding-the-quick-filter-value) for any column. The matching logic can be overridden by providing a `quickFilterMatcher`, e.g. to perform searches via regular expressions.

The `rowQuickFilterAggregateText` parameter passed to the matcher function is a concatenation of all the Quick Filter Values (using the [Quick Filter Cache](#quick-filter-cache) if enabled). Note that this value will be upper case.

<snippet>
const gridOptions = {
    // perform a regular expression search
    quickFilterMatcher: (quickFilterParts, rowQuickFilterAggregateText) => {
        return quickFilterParts.every(part => rowQuickFilterAggregateText.match(part));
    },
}
</snippet>

## Example: Quick Filter Configuration

The example below shows the Quick Filter working on different data types. Each column demonstrates something different as follows:

- `Name` - Simple column, nothing complex.
- `Age` - Complex object with 'dot' in field, Quick Filter works fine.
- `Country` - Complex object and value getter used, again Quick Filter works fine.
- `Results` - Complex object, Quick Filter would call `toString` on the complex object, so `getQuickFilterText` is provided.
- `Hidden` - A hidden column with all values being the string 'hidden'. Enter `hidden` into the filter and no rows will be matched. Click the `Include Hidden Columns` button to set `includeHiddenColumnsInQuickFilter = true`, and all rows will be matched. Note the Quick Filter cache will be cleared automatically when the option is changed.

A `quickFilterParser` is defined to allow exact searches using quotes, e.g. `"gold: 1"` will only match `Results` with that value. A `quickFilterMatcher` is also defined to allow regular expressions to be entered, e.g. `2[012]` will match `Age` 20, 21 and 22.

The example also demonstrates having the Quick Filter cache turned on. The grid works very fast even when the cache is turned off, so you probably don't need it for small data sets. For large data sets (e.g. over 10,000 rows), turning the cache on will improve Quick Filter speed. Tweaking the `cacheQuickFilter` option in the example allows both modes to be experimented with:

- **Cache Quick Filter (example default):** The cache is used. Value getters are executed the first time the Quick Filter is run. Hitting 'Print Quick Filter Cache Texts' will return back the Quick Filter text for each row which will initially be `undefined` and then return the Quick Filter text after the Quick Filter is executed for the first time.
- **Normal Quick Filter:** The cache is not used. Value getters are executed on every node each time the filter is executed. Hitting 'Print Quick Filter Cache Texts' will always return `undefined` for every row because the cache is not used.

<grid-example title='Quick Filter Configuration' name='quick-filter-configuration' type='generated'></grid-example>

## Server Side Data

Quick Filters only make sense with client-side data (i.e. when using the [Client-Side Row Model](/client-side-model/)). For the other row models you would need to implement your own server-side filtering to replicate Quick Filter functionality.

## API Reference

### Grid Options

<api-documentation source='grid-options/properties.json' section='filter' names='["quickFilterText", "cacheQuickFilter", "includeHiddenColumnsInQuickFilter", "quickFilterParser", "quickFilterMatcher"]'></api-documentation>

### Column Properties

<api-documentation source='column-properties/properties.json' section='filtering' names='["getQuickFilterText"]'></api-documentation>

### Grid API Methods

<api-documentation source='grid-api/api.json' section='filter' names='["isQuickFilterPresent", "getQuickFilter", "setQuickFilter", "setIncludeHiddenColumnsInQuickFilter", "setQuickFilterParser", "setQuickFilterMatcher"]'></api-documentation>
