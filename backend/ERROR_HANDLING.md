# Error Handling & Column Ordering

## Overview

This document explains the improved error handling system and how to resolve column ordering conflicts in the Choreograph Collab backend.

## Column Ordering Conflicts

### Problem
The application uses a unique constraint on the combination of `project` and `order` fields in the columns collection. This ensures that each column within a project has a unique order number. However, this can cause conflicts when:

1. Creating columns with duplicate order numbers
2. Updating columns to use an order that already exists
3. Database inconsistencies from previous operations

### Error Messages

When a duplicate key error occurs, you'll now receive clear, actionable error messages:

```json
{
  "message": "Column with order 2 already exists in this project. Please choose a different order or let the system assign one automatically.",
  "conflictingOrder": 2,
  "suggestedOrder": 3,
  "error": "ORDER_CONFLICT"
}
```

### Solutions

#### 1. Automatic Order Assignment
When creating a column without specifying an order, the system automatically assigns the next available order number:

```json
POST /api/projects/:projectId/columns
{
  "name": "New Column"
  // order will be auto-assigned
}
```

#### 2. Manual Order with Conflict Check
The system now checks for conflicts before creating/updating columns:

```json
POST /api/projects/:projectId/columns
{
  "name": "New Column",
  "order": 5  // Will fail if order 5 already exists
}
```

#### 3. Fix Existing Conflicts
Use the new endpoint to automatically fix column ordering conflicts:

```bash
POST /api/projects/:projectId/columns/fix-order
```

This endpoint will:
- Reorder all columns sequentially (0, 1, 2, 3...)
- Resolve any duplicate order conflicts
- Return the updated column list

#### 4. Database Migration Script
For existing databases with conflicts, run the migration script:

```bash
npm run fix-columns
```

This script will:
- Connect to the database
- Find all projects with column ordering conflicts
- Automatically fix the ordering
- Provide detailed logging of changes

## Error Types

### ORDER_CONFLICT (409)
- **Cause**: Attempting to create/update a column with an order that already exists
- **Solution**: Choose a different order or let the system auto-assign

### DUPLICATE_KEY (409)
- **Cause**: MongoDB duplicate key constraint violation
- **Solution**: Check for conflicting data and resolve

### VALIDATION_ERROR (400)
- **Cause**: Invalid input data
- **Solution**: Check the request body and fix validation issues

### INVALID_ID (400)
- **Cause**: Invalid ObjectId format
- **Solution**: Provide a valid 24-character hexadecimal ID

### NOT_FOUND (404)
- **Cause**: Resource doesn't exist
- **Solution**: Check if the resource ID is correct

## Best Practices

1. **Always handle errors gracefully** in your frontend
2. **Use auto-assignment** for column orders unless specific ordering is required
3. **Run the fix-order endpoint** if you encounter ordering conflicts
4. **Check error types** to provide appropriate user feedback
5. **Log errors** for debugging purposes

## Example Frontend Error Handling

```typescript
try {
  const response = await createColumn(projectId, { name: "New Column", order: 2 });
  // Handle success
} catch (error: any) {
  if (error.response?.status === 409) {
    const errorData = error.response.data;
    
    if (errorData.error === 'ORDER_CONFLICT') {
      // Suggest using the suggested order or auto-assignment
      console.log(`Order ${errorData.conflictingOrder} is taken. Try ${errorData.suggestedOrder}`);
    }
  }
}
```

## Monitoring

The system now provides:
- Detailed error logging
- Conflict detection before database operations
- Automatic conflict resolution tools
- Clear error messages with suggestions

This makes debugging and resolving issues much easier for both developers and end users.
