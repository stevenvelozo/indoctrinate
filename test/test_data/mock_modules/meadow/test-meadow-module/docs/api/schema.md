# Schema Definition

Schemas define the structure of data models in meadow.

## Defining a Schema

```javascript
let tmpSchema = {
    Title: "User",
    Fields: [
        { Column: "IDUser", Type: "AutoIdentity" },
        { Column: "Name", Type: "String", Size: 255 },
        { Column: "Email", Type: "String", Size: 512 }
    ]
};
```

## Field Types

| Type | Description |
|------|-------------|
| AutoIdentity | Auto-incrementing primary key |
| String | Variable length text |
| Number | Numeric value |
| DateTime | Date and time |
