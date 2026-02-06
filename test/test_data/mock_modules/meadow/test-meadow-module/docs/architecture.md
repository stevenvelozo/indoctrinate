# Architecture

The meadow architecture follows a provider pattern for database access.

## Providers

Each database type has a dedicated provider that implements the standard CRUD interface.

## Query DSL

FoxHound provides the query building domain specific language used by meadow.
