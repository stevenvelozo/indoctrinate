# Input & Scanning

The input stage discovers files, creates content descriptions, and populates the catalog with labeled entries.

## File Scanner

The `IndoctrinateFileScanner` service performs recursive directory traversal.

### Ignored Files

The scanner skips files and directories matching the ignored list. Defaults:

```json
["node_modules", ".git", ".DS_Store", ".nyc_output"]
```

When an ignored directory is encountered, the entire subtree is skipped.

### File Stats

For each discovered file, the scanner collects:

| Property | Description |
|----------|-------------|
| `Size` | File size in bytes |
| `Created` | Creation timestamp |
| `Modified` | Last modification timestamp |
| `Accessed` | Last access timestamp |
| `Mode` | File permission mode |

### Scanning Order

Files are processed sequentially (concurrency limit of 1) to ensure deterministic catalog ordering. Directories are processed before their children.

## Ingestor

The `IndoctrinateIngestor` service transforms file paths into content descriptions.

### Content Description Creation

```javascript
// Internal flow for each discovered file
let tmpDescription = ingestor.createContentDescriptionFromFile('/absolute/path/to/file.md');
// → Creates a full ContentDescription with UUID, hash, labels, and optionally loaded content
```

### MIME Type Detection

The MIME type is determined from the file extension using the `mime` library:

```javascript
// file.md → text/markdown
// file.json → application/json
// file.js → application/javascript
// file.png → image/png
```

The MIME type is split into:
- **Nature** - The general type (e.g., `text`, `application`, `image`)
- **Format** - The specific format (e.g., `markdown`, `json`, `javascript`)

### Special File Handling

Certain files receive special treatment during ingestion:

| File | Behavior |
|------|----------|
| `*.md` | Content loaded into memory as string |
| `package.json` | Content parsed as JSON, Schema set to `PackageDotJSON` |
| `indoctrinate-extrafolders.json` | Paths added to additional scan folders |
| `indoctrinate-structure*.json` | Structure definition registered |
| `indoctrinate-target*.json` | Target definition registered |

### Label Generation

After creating the content description, the ingestor populates labels from the file's path and name. See [Labels](concepts/labels.md) for full details on how labels are generated and the label set structure.

### Root Folder Handling

The root scan folder path is excluded from address labels so that labels remain portable across different machines. If scanning `/Users/alice/Code/myproject/`, a file at `/Users/alice/Code/myproject/docs/api/auth.md` gets address labels `["docs", "api"]`, not `["Users", "alice", "Code", "myproject", "docs", "api"]`.

## Two-Pass Scanning

The input stage runs in two passes:

1. **Root folder scan** - Recursively scans the primary source directory
2. **Extra folders scan** - Scans any additional folders discovered from `indoctrinate-extrafolders.json` files during the first pass

This allows projects to define supplementary documentation directories that are automatically included in the build.

## Best Practices

1. **Organize by topic** - Directory names become labels, so meaningful names improve filtering
2. **Use `indoctrinate-extrafolders.json`** for documentation spread across multiple directories
3. **Keep the root folder focused** - Scanning large directories with many non-documentation files is slower
4. **Use `-i` flag** to skip unknown file types in repos with many binary assets
