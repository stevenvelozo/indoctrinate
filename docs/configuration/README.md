# Configuration

Indoctrinate is designed to work with zero configuration for common documentation projects. When customization is needed, configuration can come from CLI options, a settings file, or special directive files in the source tree.

## Configuration File

Place an `.indoctrinate.config.json` file in your project root:

```json
{
    "RootScanFolder": "./src",
    "TargetOutputFolder": "./docs/generated",
    "AdditionalScanFolders": ["./external-docs"],
    "IgnoredFileNames": ["node_modules", ".git", ".DS_Store", ".nyc_output", "temp"]
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `RootScanFolder` | string | CWD | Root directory to scan |
| `TargetOutputFolder` | string | `{root}/dist` | Output destination |
| `AdditionalScanFolders` | array | `[]` | Extra directories to scan |
| `IgnoredFileNames` | array | See below | Files and directories to skip |

### Default Ignored Files

```json
["node_modules", ".git", ".DS_Store", ".nyc_output"]
```

These names are matched against both files and directories. When a directory matches, its entire subtree is skipped.

## Configuration Precedence

Settings are resolved in this order (first match wins):

1. **Existing AppData value** - From a loaded catalog file
2. **CLI parameter** - Command-line flags (`-d`, `-t`, `-s`)
3. **Settings file** - Values from `.indoctrinate.config.json`
4. **Default** - Built-in defaults

## Further Configuration

- [Special Files](configuration/special-files.md) - Directive files that customize behavior
- [Structures & Targets](configuration/structures-targets.md) - Defining output structures
