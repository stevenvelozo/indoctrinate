# generate_catalog

The `generate_catalog` command scans a directory of modules, discovers their documentation, parses sidebar navigation files, and produces a unified catalog JSON file. This powers the Retold Docsify documentation hub.

## Usage

```bash
npx indoctrinate generate_catalog [options]
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --directory_root [path]` | Root directory of the modules folder | Current working directory |
| `-o, --output_file [path]` | Output path for the catalog JSON | `./retold-catalog.json` |
| `-b, --branch [branch]` | Default git branch for GitHub raw URLs | `master` |
| `-g, --github_org [org]` | GitHub organization or user for raw URLs | `stevenvelozo` |
| `-c, --catalog_file` | Also write the full AppData catalog file | Disabled |

## Examples

### Generate from Retold Modules

```bash
npx indoctrinate generate_catalog -d /path/to/retold/modules -o ./docs/retold-catalog.json
```

### Specify a Different GitHub Organization

```bash
npx indoctrinate generate_catalog -d ./modules -g myorg -b main
```

## What It Does

1. **Scans** the directory tree recursively, cataloging all files
2. **Discovers modules** by analyzing `__LABELSET_ADDRESS` labels to find group/module structure
3. **Finds documentation** by looking for `docs/` folders within each module
4. **Parses `_sidebar.md`** files into structured navigation trees
5. **Detects cover pages** by looking for `cover.md` files
6. **Assembles** the unified catalog organized by module group

## Output Format

```json
{
    "Generated": "2025-02-06T10:30:00.000Z",
    "GitHubOrg": "stevenvelozo",
    "DefaultBranch": "master",
    "Groups": [
        {
            "Name": "Fable",
            "Key": "fable",
            "Description": "Core framework: DI, config, logging, UUID, expressions",
            "Modules": [
                {
                    "Name": "fable-log",
                    "Repo": "fable-log",
                    "Group": "fable",
                    "Branch": "master",
                    "HasDocs": true,
                    "HasCover": true,
                    "Sidebar": [
                        {
                            "Title": "Getting Started",
                            "Children": [
                                { "Title": "Introduction", "Path": "README.md" },
                                { "Title": "Quick Start", "Path": "getting-started.md" }
                            ]
                        }
                    ],
                    "DocFiles": ["README.md", "getting-started.md", "_sidebar.md", "cover.md"]
                }
            ]
        }
    ]
}
```

## Expected Directory Structure

The command expects modules organized as:

```
modules/
├── fable/
│   ├── fable/docs/...
│   ├── fable-log/docs/...
│   └── fable-uuid/docs/...
├── meadow/
│   ├── meadow/docs/...
│   └── foxhound/docs/...
└── pict/
    └── pict/docs/...
```

The first directory level is the group name, the second is the module name.

## Sidebar Parsing

The `_sidebar.md` format used by Docsify is parsed into a tree:

```markdown
- Section Title
  - [Link Text](path.md)
  - [Another Link](other.md)
```

Becomes:

```json
{
    "Title": "Section Title",
    "Children": [
        { "Title": "Link Text", "Path": "path.md" },
        { "Title": "Another Link", "Path": "other.md" }
    ]
}
```

Root paths (`/`) are normalized to `README.md`. Directory paths (`api/`) get `README.md` appended.

## How the Docsify Hub Uses This

The Retold Docsify hub loads `retold-catalog.json` at browse-time and uses it to:

1. Build route aliases mapping `/group/module/path` to raw GitHub URLs
2. Generate dynamic sidebar navigation
3. Show which modules have documentation and which do not

See [Hub Overview](retold/README.md) for the full Retold hub documentation.
