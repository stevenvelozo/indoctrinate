# generate_keyword_index

The `generate_keyword_index` command scans module documentation, strips markdown formatting from content, and builds a lunr-based keyword search index. This enables cross-module search in the Retold Docsify documentation hub.

## Usage

```bash
npx indoctrinate generate_keyword_index [options]
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --directory_root [path]` | Root directory of the modules folder | Current working directory |
| `-o, --output_file [path]` | Output path for the keyword index JSON | `./retold-keyword-index.json` |
| `-a, --appdata_file [path]` | Load a previously saved AppData instead of re-scanning | None |
| `-c, --catalog_file` | Also write the full AppData catalog file | Disabled |

## Examples

### Generate from a Fresh Scan

```bash
npx indoctrinate generate_keyword_index -d /path/to/retold/modules -o ./docs/retold-keyword-index.json
```

### Generate from a Previously Saved Catalog

```bash
npx indoctrinate generate_keyword_index -a ./staging/Indoctrinate-Catalog-AppData.json -o ./docs/retold-keyword-index.json
```

The `-a` option skips the scanning phase and builds the index directly from the saved catalog data.

## What It Does

1. **Scans** the directory tree (or loads a saved catalog)
2. **Filters** for markdown files that have content loaded and are in a `docs/` folder
3. **Skips** `_sidebar.md` and `cover.md` files (navigation, not content)
4. **Strips markdown formatting** - removes headers, links, code blocks, emphasis, HTML tags, list markers
5. **Extracts titles** from the first `#` heading in each file
6. **Builds a lunr index** with weighted fields: title (10x), module (5x), group (3x), body (1x)
7. **Produces** a document reference map alongside the serialized index

## Output Format

```json
{
    "Generated": "2025-02-06T10:30:00.000Z",
    "DocumentCount": 368,
    "LunrIndex": { /* serialized lunr index */ },
    "Documents": {
        "fable/fable-log/README.md": {
            "Title": "fable-log",
            "Module": "fable-log",
            "Group": "fable",
            "DocPath": "README.md"
        },
        "meadow/meadow/schema/README.md": {
            "Title": "Schema Definition",
            "Module": "meadow",
            "Group": "meadow",
            "DocPath": "schema/README.md"
        }
    }
}
```

## Search Weights

The lunr index boosts certain fields to improve result relevance:

| Field | Boost | Description |
|-------|-------|-------------|
| `title` | 10x | The first heading or filename |
| `module` | 5x | The module name |
| `group` | 3x | The module group name |
| `body` | 1x | The plain text content |

This means searching for "fable" returns the Fable README first, not just any page that mentions the word.

## Markdown Stripping

Before indexing, markdown formatting is stripped to produce clean plain text:

- Fenced code blocks are removed entirely
- Inline code backticks are removed
- Image references are removed
- Link text is preserved, URLs are removed
- HTML tags are removed
- Header markers (`#`) are removed
- Emphasis markers (`*`, `_`) are removed
- List markers and blockquote markers are removed

## Staleness

The keyword index is a point-in-time snapshot. When module documentation changes, the index does not automatically update. Re-run the command to rebuild:

```bash
npx indoctrinate generate_keyword_index -d ./modules -o ./docs/retold-keyword-index.json
```

This is by design. The index and the catalog can be committed to the repository and only regenerated when structural or content changes warrant it.

## How the Docsify Hub Uses This

The Retold hub loads `retold-keyword-index.json` at browse-time and uses lunr client-side to provide cross-module search. Search results include the module name, group, and a link to the matching document.
