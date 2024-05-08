# Vocabulary

## Content

Content is any single piece or body of material.  These can be textual, referencial, data or media.

Examples of content:

* Markdown
* Photographs
* Diagrams
* Source Code
* Tabular Lists of Names
* JSON Records and Comprehensions

## Dictionary

A series of terms with specific meanings for a specific Content Output Structure.  Sometimes "class" means a group of students ready to learn from a teacher, and sometimes "class" means you are declaring the shape of an object in object-oriented programming.

Indoctrinate aims to be aware of Vocabulary and use it as a first class citizen in as many ways possible.

## Term

A Term is a single word in the content-specific Dictionary.

## Source Material

Any of the source file(s), data responses from API endpoints and other Content that is used to generate different outputs.

## Structure

The definition of Section shape and Source Material for how a particular Output should be Compiled.

### Example: The Structure of a typical Book

* front matter
* table of contents
* foreward
* parts/chapters
* index
* glossary

### Example: The structure of interactive documentation for a software code repository
 
* navigation (table of contents)
* quick start
* tutorials
* data model design documentation
* software architectural design documentation
* api reference
* examples
* a searchable index

### Example: The structure of a typical solution plan

* navigation (table of contents)
* executive summary
* solution contacts
* project work summary
* business problem description
* technical architecture
* technical glossary
* change log

### Example: The structure of a typical zine

* title page
* table of contents
* letter from editor
* short article
* graphic insert
* long article
* short article
* advertisements

## Format

There may be multiple Formats we want for an Output.  And there are many formats we can input.

For writing out, we may want all three of HTML, LaTeX and raw text output for the same structure of our book.  Or maybe we have an open source C++ library that needs interactive documentation as well as a PDF output.  Formats are these different target types.

## Output Material

Our source material is passed through a structure, then generated as output material.