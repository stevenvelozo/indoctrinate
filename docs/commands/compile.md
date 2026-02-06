# compile

The `compile` command runs the full content compilation pipeline: scanning source directories, cataloging files with labels, processing content, and generating output.

## Usage

```bash
npx indoctrinate compile [options]
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --directory_root [path]` | Root directory for source content | Current working directory |
| `-t, --target_output_folder [path]` | Output destination folder | `{root}/dist` |
| `-s, --staging_folder [path]` | Staging folder for intermediate files | `{output}/indoctrinate_content_staging` |
| `-c, --catalog_file` | Write the catalog AppData file to staging | Enabled |
| `-i, --ignore_unknown` | Skip files with unrecognized MIME types | Disabled |

## Examples

### Compile Current Directory

```bash
npx indoctrinate compile
```

Scans the current directory recursively, catalogs all files, processes them, and writes output to `./dist/`.

### Compile a Specific Project

```bash
npx indoctrinate compile -d ./my-project -t ./output
```

### Compile with Catalog Export

```bash
npx indoctrinate compile -d ./my-project -c
```

Produces `Indoctrinate-Catalog-AppData.json` in the staging folder. This file can be reloaded later with the `extended_process` command.

### Ignore Unknown File Types

```bash
npx indoctrinate compile -d ./my-project -i
```

Files with unrecognized MIME types are skipped during cataloging rather than being cataloged as `UNKNOWN`.

## Compilation Flow

```
Phase 0: Prepare environment (resolve paths, create folders)
Phase 1: Scan and catalog files (recursive directory walk, label generation)
Phase 2: Process content (magic byte detection, extended content)
Phase 3: Generate output (apply structures, format output)
Phase 4: Copy to destination
Phase 5: Cleanup staging
```

## Output

The compile command produces:

- **Generated files** in the target output folder
- **Staging artifacts** including the optional `Indoctrinate-Catalog-AppData.json`
- **Console output** with progress information for each phase
