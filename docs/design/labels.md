# Labels

Labels have turned out to be the most interesting design element for the indoctrinate library.  As a concept, labels are a series of textual terms which are gleaned from context and/or ingestion.  At the most basic level, labels are generated based on the file location, name and format.

For instance take the following file:

```filepath
/home/janedoe/Code/megalibrary/doc/api/token_authentication.md
```

This context alone has a number of labels with different set types.  This means location and filename both are broken into individual sets of labels.  It is easiest to think of it as an array of strings:

```json
[
	"__LABELSET_TYPE", "FILE",
	"__LABELSET_ADDRESS", "home","janedoe","Code","megalibrary","doc","api",
	"__LABELSET_NAME", "token","authentication",
	"__LABELSET_EXTENSION", "md",
	"__LABELSET_FILENAME", "token_authentication.md"
]
```

## Matching

The real power of labels comes with matching filters.  To tell indoctrinate we want an API Documentation section, we might tell it to grab all items with a `doc` label immediately followed by `api`.  With our one file this seems silly.  But Jane could fill that folder with api documentation (even subfolders) and the match will work.

If she wanted to have some api documentation in another location, she could make a file called:

```filepath
/home/janedoe/Code/megalibrary/test/Integration_tests_doc_api.md
```

Although the doc->api label set is not in the ADDRESS labels, it *is* in the FILE labels.  This means indoctrinate would match it anyway.

This match type is called a `Forward Proximal Label Set Match`.  The default behavior is to ignore all other context; if the labels exist in the sequence expected, the content is pulled in.  This means that scanning large bodies of content would automatically be recursive.  Often we don't want recursive; we just want a single folder and want to match at the endpoint.  If this were the behavior we wanted instead, we would use a `Forward End Label Set Match` which expects the combination to show up at the end of a label type stanza.

Some of the match types:

### Label Match

Match a single label.  Accepts a single string.

Parameter: `Label`

### Label Set Match

Match multiple labels.  Accepts an array of labels.  Each label must be in the set for a match to happen.  Expects an array.

Parameter: `LabelSet`

### Forward Label Set Match

Match multiple labels in sequence, working forward from the beginning of the label set.  Does not care if they are proximal to each other.

Parameter: `ForwardLabelSet`

### Forward Proximal Label Set Match

Match multiple labels in sequence, working forward from the beginning of the label set.  Expect the labels to be proximal to each other in order.  For instance if you have `["foo","bar"]` as the set, it would match any label series that had `[...,"foo","bar",...]` but skip any that had `["...,"foo","baz","bar",...]`.

Parameter: `ForwardProximalLabelSet`

### Forward Proximal End Label Set Match

Match multiple labels and expect them at the end of a label section.  Label sections are not fancy; they are just denoted by `"__LABELSECTION_SECTIONNAMEHERE"` and indoctrinate treats them specially.  For folder parsers this means if you create a folder `__LABELSECTION_FORCED`, this would be treated as a label section break.  This is silly though; please don't do this.

Parameter: `ForwardProximalEndLabelSet`

## Overriding

If forward matching label sets are the real power, the superpower comes with the blended inverse... matching labels and overriding content moving back on the tree.  We can pass in labels that we want to override content for.  Let's say we have a well defined structure for API documentation, but want to publish a custom version of the book for one of our important customers.  Let's say that customer is IBM.  We might use a label, ibm, to say that we want to override content.

Let's say that from the above documentation build, we want to customize the `token_authentication.md` file so they have examples that are relevant to their usage of our API.

First off, if we had a `Forward Proximal End Label Set Match` filter on `["doc","api"]`, the content set would take every file in this folder.

Then, if we created a `Reverse End Label Set Match` filter on `["customer_specific","ibm"]` in a content set overide we could create the following file:

```filepath
/home/janedoe/Code/megalibrary/doc/api/customer_specific/ibm/token_authentication.md
```

Given this configuration, the content section parser will *override (meaning overwrite)* the `token_authentication.md` file in the earlier folder.

