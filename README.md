# Indoctrinate

A simple documentation scaffolding (sub)system.

## Vocabulary

1. Output Structure
1. Part
1. Address
1. Location
1. Name
1. Label

## Concepts

### Hash

Each piece of content has a unique hash.  Generated content has a prefix and a GUID designated.  Incoming content has an `address` (which includes both a `location` and a `name`).

### Labels

Each piece of content coming in or generated has a set of labels.  These are used as forward looking matches for inclusion or exclusion based on filters.
