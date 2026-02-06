# Processing Tasks

The processing stage runs extensible tasks on each cataloged content description, enriching it with additional metadata.

## How Processing Works

The `IndoctrinateServiceProcessor` iterates through every content description in the catalog and passes it through each registered processing task:

```javascript
// For each content description
for (let task of processingTasks)
{
    task.processContentFile(callback, contentDescription);
}
```

Processing tasks run sequentially per file, and files are processed in catalog index order.

## Built-in Task: Understand File

The default processing task uses the `magic-bytes.js` library to detect the true file type from the first 100 bytes of each file, regardless of file extension.

```javascript
// ExtendedContent after processing
{
    MB_EXT: ['png'],           // Detected extension from magic bytes
    MB_MIME: ['image/png']     // Detected MIME type from magic bytes
}
```

This is useful for detecting misnamed files or files without extensions.

## Creating Custom Processing Tasks

Extend the `ProcessingTask` base class to add your own analysis:

```javascript
const libProcessingTask = require('indoctrinate/source/services/processor/Indoctrinate-Service-ProcessingTask');

class WordCountTask extends libProcessingTask
{
    constructor(pFable, pOptions, pServiceHash)
    {
        super(pFable, pOptions, pServiceHash);
        this.serviceType = 'WordCountTask';
    }

    processContentFile(fCallback, pContentDescription)
    {
        // Only process markdown files with loaded content
        if (pContentDescription.Format !== 'markdown' || !pContentDescription.Content)
        {
            return fCallback();
        }

        // Ensure ExtendedContent exists
        this.prepareDescriptionForExtendedContent(pContentDescription);

        // Count words
        let tmpWordCount = pContentDescription.Content.split(/\s+/).length;

        // Store in ExtendedContent
        this.addContentToExtendedCatalogData(
            pContentDescription,
            { WordCount: tmpWordCount },
            'WordAnalysis'
        );

        return fCallback();
    }
}
```

## Base Class Utilities

The `ProcessingTask` base class provides helper methods:

### prepareDescriptionForExtendedContent

Ensures the `ExtendedContent` object exists on the content description:

```javascript
this.prepareDescriptionForExtendedContent(pContentDescription);
// pContentDescription.ExtendedContent is now guaranteed to exist
```

### addContentToExtendedCatalogData

Stores data in the ExtendedContent under a named key:

```javascript
this.addContentToExtendedCatalogData(pContentDescription, dataObject, 'MyTaskName');
// pContentDescription.ExtendedContent.MyTaskName = dataObject
```

### readBytesSync

Read raw bytes from a file for analysis:

```javascript
let tmpBytes = this.readBytesSync(pContentDescription, 0, 100);
// Returns Buffer of first 100 bytes
```

### constructFileName

Build the full file path from a content description:

```javascript
let tmpFilePath = this.constructFileName(pContentDescription);
// Returns: '/absolute/path/to/file.md'
```

## Progress Tracking

The processor provides progress feedback during execution, logging the total count and current position as it works through the catalog. For large catalogs, this helps monitor compilation progress.

## Best Practices

1. **Check file type early** - Return immediately from `processContentFile` if the content description is not relevant to your task
2. **Use `prepareDescriptionForExtendedContent`** before writing to ExtendedContent
3. **Name your data keys** clearly when using `addContentToExtendedCatalogData`
4. **Always call `fCallback()`** - Even when skipping a file, the callback must be invoked
5. **Keep tasks focused** - One task per analysis concern
