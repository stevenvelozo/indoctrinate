# CLI Commands

Indoctrinate provides four commands for different workflows. All commands are run through the `indoctrinate` CLI.

## Available Commands

| Command | Description |
|---------|-------------|
| [`compile`](commands/compile.md) | Full content compilation from source directories |
| [`extended_process`](commands/extended-process.md) | Re-process content from a saved catalog |
| [`generate_catalog`](commands/generate-catalog.md) | Build a Retold documentation catalog |
| [`generate_keyword_index`](commands/generate-keyword-index.md) | Build a keyword search index |

## Usage

```bash
# Show help
npx indoctrinate --help

# Show help for a specific command
npx indoctrinate compile --help

# Run a command
npx indoctrinate compile -d ./my-project
```

## Global Behavior

All commands share these behaviors:

- **Path Resolution** - Relative paths are resolved to absolute paths from CWD
- **Service Initialization** - Fable services are bootstrapped before execution
- **Configuration File** - Settings can be placed in `.indoctrinate.config.json`
- **Ignored Files** - `node_modules`, `.git`, `.DS_Store`, and `.nyc_output` are always skipped during scanning
