# Catalog & Filtering

The Content Catalog is Indoctrinate's central store for all discovered content. It provides storage, indexing, and a flexible filtering system for selecting content by labels, format, or schema.

## Access

```javascript
// The catalog service
fable.IndoctrinateServiceCatalog

// Direct access to the catalog data
fable.AppData.SourceContentCatalog       // Object: hash → ContentDescription
fable.AppData.SourceContentCatalogIndices // Array: hash keys for iteration
```

## Storing Content

Content is cataloged automatically during the scanning phase. Each content description is stored by its hash key:

```javascript
fable.IndoctrinateServiceCatalog.catalogContent(contentDescription);
```

If a hash collision occurs (duplicate file), a warning is logged. The catalog indices array is rebuilt after each addition.

## Querying the Catalog

The primary query method accepts an array of filter definitions:

```javascript
let tmpResults = fable.IndoctrinateServiceCatalog.gatherContentByFilterSet(filterArray);
```

A content description must match **all** filters in the array to be included in results. This AND behavior lets you combine different filter types for precise selection.

## Filter Types

### Format Filter

Select content by file format (MIME subtype):

```javascript
// Single format
{ Type: 'Format', Format: 'markdown' }

// Multiple formats
{ Type: 'Format', Formats: ['markdown', 'json'] }

// Case-sensitive matching
{ Type: 'Format', Format: 'JSON', CaseSensitive: true }
```

Common format values: `markdown`, `json`, `javascript`, `plain`, `html`, `xml`, `csv`

### Schema Filter

Select content by special schema identifier:

```javascript
// Find all package.json files
{ Type: 'Schema', Schema: 'PackageDotJSON' }

// Find Indoctrinate structure definitions
{ Type: 'Schema', Schema: 'Indoctrinate-Structure' }
```

### Label Filter

The most powerful filter type. See [Labels](concepts/labels.md) for full details on matching algorithms.

```javascript
// Match any of these labels
{
    Type: 'Label',
    Labels: ['api', 'docs']
}

// Match all labels, in order, adjacent
{
    Type: 'Label',
    Labels: ['docs', 'api'],
    MatchAll: true,
    Sequential: true,
    Proximal: true
}

// Match at label set boundaries only
{
    Type: 'Label',
    Labels: ['docs', 'api'],
    MatchAll: true,
    Proximal: true,
    Sequential: true,
    OnlySetEnd: true
}
```

### Label Filter Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `Labels` | array | `[]` | Labels to match against |
| `MatchAll` | boolean | `false` | Require all labels (vs. any) |
| `Sequential` | boolean | `false` | Labels must appear in order |
| `Proximal` | boolean | `false` | Labels must be adjacent |
| `OnlySetEnd` | boolean | `false` | Match only at label set boundaries |
| `CaseSensitive` | boolean | `false` | Case-sensitive comparison |

## Combining Filters

Pass multiple filters to narrow results:

```javascript
// Find markdown files in the api docs folder
let tmpApiMarkdown = catalog.gatherContentByFilterSet([
    { Type: 'Format', Format: 'markdown' },
    { Type: 'Label', Labels: ['api'], MatchAll: true }
]);

// Find package.json files that have a "test" label
let tmpTestPackages = catalog.gatherContentByFilterSet([
    { Type: 'Schema', Schema: 'PackageDotJSON' },
    { Type: 'Label', Labels: ['test'] }
]);
```

## Testing Content Against Filters

To check a single content description without iterating the full catalog:

```javascript
let tmpMatches = catalog.matchContentByFilterSet(contentDescription, filterArray);
// Returns: true or false
```

## Label Manager

The Label Manager utility service provides methods for inspecting and manipulating label arrays:

```javascript
let tmpLabelManager = fable.IndoctrinateLabelManager;

// Count labels in a set
tmpLabelManager.countLabelsInSet(labels, '__LABELSET_ADDRESS');

// Find label set boundaries
tmpLabelManager.findLabelSetStart(labels, '__LABELSET_NAME');

// Insert labels at the end of a set
tmpLabelManager.insertLabelsAtEndOfSet(labels, '__LABELSET_NAME', ['extra', 'labels']);
```

## Best Practices

1. **Use Format filters** for broad content type selection
2. **Use Label filters** for location-based content selection
3. **Combine filters** to narrow results precisely
4. **Prefer proximal sequential matching** for folder-based selection
5. **Use OnlySetEnd** when you want direct children only, not recursive
6. **Keep filter sets small** - each filter scans the full catalog
