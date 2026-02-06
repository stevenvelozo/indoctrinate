# extended_process

The `extended_process` command re-processes content from a previously saved AppData catalog file. This allows you to skip the expensive file scanning phase and run additional processing on already-cataloged content.

## Usage

```bash
npx indoctrinate extended_process <appdata_file>
```

## Arguments

| Argument | Description |
|----------|-------------|
| `<appdata_file>` | Path to a previously saved `Indoctrinate-Catalog-AppData.json` file |

## Examples

### Re-process a Saved Catalog

```bash
# First, compile and save the catalog
npx indoctrinate compile -d ./my-project -c

# Later, re-process without re-scanning
npx indoctrinate extended_process ./dist/indoctrinate_content_staging/Indoctrinate-Catalog-AppData.json
```

## Processing Flow

```
Phase 0: Prepare environment (load AppData, initialize services)
Phase 1: Prepare catalog for processing (rebuild indices)
Phase 2: Execute processing tasks on cataloged content
```

Note that Phases 3-5 (output generation, copying, cleanup) are not executed. The `extended_process` command is designed for running additional analysis or processing tasks, not for generating output.

## Use Cases

- **Iterating on processing tasks** - Test new processors without re-scanning a large directory tree
- **Two-machine workflows** - Scan on one machine, process on another
- **Batch processing** - Compile once, run multiple extended processes with different configurations
