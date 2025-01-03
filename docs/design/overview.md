# Architectural Overview

Indoctrinate is built to catalog and addressible set of content, building metadata (e.g. name, tag, ingest date/time, source) based on content material and location.

Because we are scanning a known location (or locations), very few of the complex descriptors need to be passed at runtime.  They can be addressed using well-formed content tag filter sets.

## What this means in plain English

You can auto generate documentation for a repository without writing any configuration.  If your repository has a README.md, and a few other files (potentially with special names), a nicely bundled static documentation site can be generated.

## Compilation