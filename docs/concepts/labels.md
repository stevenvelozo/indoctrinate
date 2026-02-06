# Labels

Labels are the most powerful design element of Indoctrinate. They are a series of textual terms automatically generated from context during content ingestion. At the most basic level, labels come from file location, name, and format.

## How Labels Are Generated

Given a file at:

```
/home/janedoe/Code/megalibrary/doc/api/token_authentication.md
```

Indoctrinate produces a label array organized into typed sets:

```json
[
    "__LABELSET_TYPE", "FILE",
    "__LABELSET_ADDRESS", "home", "janedoe", "Code", "megalibrary", "doc", "api",
    "__LABELSET_NAME", "token", "authentication",
    "__LABELSET_EXTENSION", ".md",
    "__LABELSET_FILENAME", "token_authentication.md",
    "__LABELSET_FULLPATH", "FILE://home/janedoe/Code/megalibrary/doc/api/token_authentication.md",
    "__LABELSET_FORMAT", "markdown", "Default"
]
```

### Label Sets

Labels are grouped into sets, each beginning with a `__LABELSET_*` marker:

| Set | Source | Description |
|-----|--------|-------------|
| `__LABELSET_TYPE` | Address type | Always `FILE` for filesystem content |
| `__LABELSET_ADDRESS` | Directory path | Each path segment becomes a label (root folder excluded) |
| `__LABELSET_NAME` | Filename | Split on `.`, `-`, and `_` (extension excluded) |
| `__LABELSET_EXTENSION` | File extension | The file extension including dot |
| `__LABELSET_FILENAME` | Complete filename | The full filename as a single label |
| `__LABELSET_FULLPATH` | Full path | The complete `FILE://` path |
| `__LABELSET_FORMAT` | MIME subtype | File format and schema type |

### Root Folder Exclusion

The root scan folder is automatically excluded from address labels. If you scan `/home/janedoe/Code/megalibrary/`, the address labels start after that prefix. This means labels remain consistent regardless of where the project is checked out.

### Name Splitting

Filenames are split into individual labels on `.`, `-`, and `_` boundaries. The file extension is excluded from name labels and placed in its own set. This means `token_authentication.md` produces name labels `["token", "authentication"]`.

## Matching

The real power of labels comes with matching filters. Label filters let you query the catalog for content matching specific label patterns.

### Match Any

The simplest filter: does the content have any of the specified labels?

```javascript
{
    Type: 'Label',
    Labels: ['api', 'documentation'],
    MatchAll: false    // default
}
```

### Match All

All specified labels must be present (in any order):

```javascript
{
    Type: 'Label',
    Labels: ['doc', 'api'],
    MatchAll: true
}
```

### Sequential Matching

Labels must appear in the specified order:

```javascript
{
    Type: 'Label',
    Labels: ['doc', 'api'],
    MatchAll: true,
    Sequential: true
}
```

This matches `[..., "doc", ..., "api", ...]` but not `[..., "api", ..., "doc", ...]`.

### Proximal Matching

Labels must appear adjacent to each other:

```javascript
{
    Type: 'Label',
    Labels: ['doc', 'api'],
    MatchAll: true,
    Sequential: true,
    Proximal: true
}
```

This matches `[..., "doc", "api", ...]` but not `[..., "doc", "src", "api", ...]`.

### Set End Matching

Labels must appear at the end of a label set boundary:

```javascript
{
    Type: 'Label',
    Labels: ['doc', 'api'],
    MatchAll: true,
    Proximal: true,
    Sequential: true,
    OnlySetEnd: true
}
```

This restricts matches to the end of a label set (just before a `__LABELSET_*` marker), which is useful for matching only files directly in a folder rather than recursively.

### Case Sensitivity

All matching is case-insensitive by default:

```javascript
{
    Type: 'Label',
    Labels: ['API'],
    CaseSensitive: false   // default
}
```

## Practical Examples

### Match All API Documentation

To grab all files in a `doc/api/` folder and its subfolders:

```javascript
catalog.gatherContentByFilterSet([
    {
        Type: 'Label',
        Labels: ['doc', 'api'],
        MatchAll: true,
        Sequential: true,
        Proximal: true
    }
]);
```

### Match Only Direct Children

To match files directly in `doc/api/` but not in subfolders:

```javascript
catalog.gatherContentByFilterSet([
    {
        Type: 'Label',
        Labels: ['doc', 'api'],
        MatchAll: true,
        Sequential: true,
        Proximal: true,
        OnlySetEnd: true
    }
]);
```

### Cross-Location Matching

A file named `Integration_tests_doc_api.md` in a `test/` folder would also match a proximal label search for `["doc", "api"]` because those labels appear in the `__LABELSET_NAME` set. This automatic cross-location matching is a key feature of the label system.

## Overriding Content

Labels also enable content overriding. You can create customer-specific or environment-specific versions of content by placing overrides in labeled subdirectories.

For example, to customize `token_authentication.md` for a specific customer:

```
doc/api/token_authentication.md                              ← default
doc/api/customer_specific/ibm/token_authentication.md        ← IBM override
```

Using a reverse label set match on `["customer_specific", "ibm"]`, the override file replaces the default in the generated output.

## A Worked Example

Labels are best understood through a concrete scenario. Imagine Jane is building API documentation for a project called `megalibrary`:

```
/home/janedoe/Code/megalibrary/doc/api/token_authentication.md
```

To pull in all API documentation, Jane sets up a proximal sequential match on `["doc", "api"]`. Every file in the `doc/api/` folder (and subfolders) matches automatically. She can add more files to that directory and they flow in without any configuration change.

Now suppose Jane also has integration tests that document API behavior:

```
/home/janedoe/Code/megalibrary/test/Integration_tests_doc_api.md
```

The `doc` → `api` sequence does not appear in the ADDRESS labels (the file is in `test/`), but it *does* appear in the NAME labels (the filename splits to `["Integration", "tests", "doc", "api"]`). A proximal label search matches this file too. This cross-location matching is a key feature — content is matched by meaning, not just by folder.

If Jane wants *only* files directly in the `doc/api/` folder and not the integration test file, she uses a **set end match** (`OnlySetEnd: true`), which constrains the match to the end of a label set boundary.

### Customer-Specific Overrides

Now suppose Jane needs to customize `token_authentication.md` for a specific customer. She creates an override:

```
doc/api/token_authentication.md                              ← default version
doc/api/customer_specific/ibm/token_authentication.md        ← IBM-specific version
```

By adding a reverse label set match on `["customer_specific", "ibm"]` as a content override, Indoctrinate replaces the default file with the IBM-specific version in the generated output. The same structure definition works for any customer — just add a new subfolder.

This blend of automatic label generation, flexible matching, and content overriding means that a well-organized directory structure *is* the configuration. Indoctrinate infers the intent from the layout.

## Best Practices

1. **Use meaningful directory names** — They become your primary labels automatically
2. **Be consistent with naming** — `api-reference.md` and `api_reference.md` both produce `["api", "reference"]` labels
3. **Leverage nesting** — Subdirectories create natural label hierarchies
4. **Prefer proximal sequential matches** — They are the most precise filter for folder-based content
5. **Use set end matching** — When you need non-recursive folder matching
6. **Think in labels, not paths** — A file named `doc_api_reference.md` anywhere in the tree matches the same labels as one in `doc/api/`
