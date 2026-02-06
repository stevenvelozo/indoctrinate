# Special Files

Indoctrinate recognizes several special file types during scanning that modify behavior or provide configuration.

## indoctrinate-extrafolders.json

Adds additional directories to the scan list. The file contains an array of paths:

```json
[
    "../shared-docs",
    "/absolute/path/to/extra/content"
]
```

When discovered during scanning, each path is added to the additional scan folders list. These folders are scanned in a second pass after the primary scan completes.

### Use Cases

- **Monorepo documentation** - Pull docs from multiple packages into a single build
- **Shared content** - Include a common directory used by multiple projects
- **External references** - Incorporate documentation maintained outside the project

### Example

```
my-project/
├── docs/
│   ├── indoctrinate-extrafolders.json
│   └── README.md
├── src/
└── shared/
    └── common-docs/
```

```json
["../shared/common-docs"]
```

## indoctrinate-structure*.json

Defines the structure for output generation. Any JSON file whose name starts with `indoctrinate-structure` is recognized.

```json
{
    "Hash": "my-documentation-structure",
    "Name": "Project Documentation",
    "Sections": [
        {
            "Name": "Introduction",
            "Filters": [
                { "Type": "Label", "Labels": ["intro"], "MatchAll": true }
            ]
        },
        {
            "Name": "API Reference",
            "Filters": [
                { "Type": "Label", "Labels": ["api"], "MatchAll": true }
            ]
        }
    ]
}
```

Structure files are registered with the `IndoctrinateServiceStructure` service and used during the output generation phase to select and organize content.

### Naming Convention

Any of these names work:

- `indoctrinate-structure.json`
- `indoctrinate-structure-book.json`
- `indoctrinate-structure-api-docs.json`

## indoctrinate-target*.json

Defines output targets with format-specific configuration. Any JSON file whose name starts with `indoctrinate-target` is recognized.

```json
{
    "Hash": "html-output",
    "Name": "HTML Documentation",
    "Format": "html",
    "Structure": "my-documentation-structure",
    "OutputPath": "html/"
}
```

Target files are registered with the `IndoctrinateServiceTarget` service and determine which structures are compiled and in what format.

### Naming Convention

- `indoctrinate-target.json`
- `indoctrinate-target-html.json`
- `indoctrinate-target-quick_start_markdown.json`

## package.json

Node.js `package.json` files are automatically recognized and their content parsed as JSON. They receive the `PackageDotJSON` schema identifier, making them easy to filter:

```javascript
let tmpPackages = catalog.gatherContentByFilterSet([
    { Type: 'Schema', Schema: 'PackageDotJSON' }
]);
```

The parsed content is available on the `Content` property of the content description.

## Best Practices

1. **Place `indoctrinate-extrafolders.json`** in the root of your scanned directory
2. **Use relative paths** in extra folders files for portability
3. **Name structures and targets** descriptively for clear build configurations
4. **One structure per output type** - Keep structures focused on a single document layout
