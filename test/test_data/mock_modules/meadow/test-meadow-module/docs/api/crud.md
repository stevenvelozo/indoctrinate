# CRUD Operations

Meadow provides standard Create, Read, Update, Delete operations.

## Create

```javascript
meadow.doCreate({ Name: "Alice", Email: "alice@example.com" }, callback);
```

## Read

```javascript
meadow.doRead({ IDUser: 1 }, callback);
```

## Update

```javascript
meadow.doUpdate({ IDUser: 1, Name: "Alice Updated" }, callback);
```

## Delete

```javascript
meadow.doDelete({ IDUser: 1 }, callback);
```
