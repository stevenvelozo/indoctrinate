# Processing Pipeline

Indoctrinate processes content through a multi-stage pipeline. Each stage is handled by a dedicated Fable service, and the stages execute sequentially through the Anticipate async pattern.

## Pipeline Stages

```mermaid
graph TD
    SRC["Source Files"] --> P1A["Input & Scanning (Phase 1)<br/><i>FileScanner walks directories<br/>Ingestor creates ContentDescriptions</i>"]
    P1A --> P1B["Cataloging (Phase 1)<br/><i>Content stored by hash<br/>Labels auto-generated</i>"]
    P1B --> P2["Processing (Phase 2)<br/><i>ProcessingTasks run on each item<br/>Magic bytes, extended content</i>"]
    P2 --> P3["Output Generation (Phase 3)<br/><i>Structures applied<br/>Formatters produce files</i>"]
    P3 --> OUT["Output Files"]
```

## Services

| Service | Role | Phase |
|---------|------|-------|
| `IndoctrinateServiceInput` | Coordinates scanning and ingestion | 1 |
| `IndoctrinateFileScanner` | Recursive directory traversal | 1 |
| `IndoctrinateIngestor` | Creates content descriptions | 1 |
| `IndoctrinateServiceCatalog` | Stores and filters content | 1 |
| `IndoctrinateServiceProcessor` | Runs processing tasks | 2 |
| `IndoctrinateServiceOutput` | Generates formatted output | 3 |

## Detailed Stage Documentation

- [Input & Scanning](pipeline/input.md) - File discovery, content description creation, and label generation
- [Processing Tasks](pipeline/processing.md) - Content analysis and enrichment
- [Output & Formatting](pipeline/output.md) - Structure-driven output generation
