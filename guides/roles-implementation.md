# User Roles Implementation

## Overview

Roles have been introduced into the data model using a **TypeScript union type with string storage**. This approach provides minimal upfront effort while maintaining maximum extensibility for future enhancements.

## Implementation Details

### 1. Type Definition (`libs/common-models/src/lib/mvp-schema.ts`)

```typescript
export type UserRole = 'guest' | 'user' | 'manager' | 'admin';
```

- **Type-safe**: TypeScript enforces valid role values at compile time
- **Simple**: No additional database tables or complex relationships
- **Extensible**: Easy to add new roles by updating the union type

### 2. Database Storage (`apps/api/src/users/entities/user.entity.ts`)

```typescript
@Column({ nullable: true, default: 'user' })
role?: string; // 'guest' | 'user' | 'manager' | 'admin'
```

- **Storage**: SQLite stores as `TEXT` (string)
- **Default**: New users default to `'user'` role
- **Nullable**: Optional field for backward compatibility
- **No migration needed**: Existing string column works as-is

### 3. API Validation (`apps/api/src/users/dto/create-user.dto.ts`)

```typescript
@IsEnum(['guest', 'user', 'manager', 'admin'])
@IsOptional()
role?: string;
```

- **Runtime validation**: `class-validator` ensures only valid roles are accepted
- **API documentation**: Swagger shows enum values
- **Type safety**: Matches TypeScript union type

### 4. Frontend Form (`libs/core-data/src/lib/forms/field-definitions.ts`)

```typescript
{
  name: 'role',
  label: 'Role',
  type: 'select',
  required: false,
  options: [
    { value: 'guest', label: 'Guest' },
    { value: 'user', label: 'User' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
  ],
}
```

- **User-friendly**: Dropdown with human-readable labels
- **Validation**: Only valid roles can be selected
- **Consistent**: Same enum values across frontend and backend

## Current Roles

| Role | Description | Use Case |
|------|-------------|----------|
| `guest` | Limited access, read-only | Unauthenticated or trial users |
| `user` | Standard user access | Regular authenticated users |
| `manager` | Elevated permissions | Content managers, team leads |
| `admin` | Full system access | System administrators |

## Benefits of This Approach

### ✅ Minimal Effort
- No database migrations required
- No new tables or relationships
- Simple string column (already exists)
- TypeScript types provide compile-time safety

### ✅ Maximum Extensibility

#### Easy to Add New Roles
1. Update `UserRole` type: `'guest' | 'user' | 'manager' | 'admin' | 'moderator'`
2. Update DTO validation: Add to `@IsEnum()` array
3. Update form options: Add to select dropdown
4. Done! No database changes needed.

#### Future Migration Paths

**Option 1: Keep String Storage (Recommended for < 10 roles)**
- Continue using string column
- Add role hierarchy/permissions logic in application code
- Simple and performant

**Option 2: Roles Table (For complex RBAC)**
```sql
-- Future migration if needed
CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  permissions JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key
ALTER TABLE users ADD COLUMN role_id TEXT REFERENCES roles(id);
```
- Migrate existing string values to role IDs
- Add permissions/permissions table
- Implement role-based access control (RBAC)

**Option 3: JSON Permissions (For fine-grained control)**
```typescript
// Future enhancement
@Column('simple-json', { nullable: true })
permissions?: {
  canEditContent: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  // ... etc
}
```
- Keep role for display/grouping
- Add permissions object for fine-grained control
- Best of both worlds

## Usage Examples

### Backend: Query by Role
```typescript
// TypeORM query
const admins = await userRepository.find({
  where: { role: 'admin' }
});
```

### Frontend: Check Role
```typescript
import { UserRole } from '@kasita/common-models';

if (user.role === 'admin') {
  // Show admin features
}
```

### Type Safety
```typescript
// ✅ Valid
const role: UserRole = 'admin';

// ❌ TypeScript error
const role: UserRole = 'superadmin'; // Error: not in union type
```

## Next Steps (When Ready)

1. **Role-Based Access Control (RBAC)**
   - Create guards/decorators: `@RequireRole('admin')`
   - Add permission checks in services
   - Implement route guards in Angular

2. **Role Hierarchy**
   - Define role precedence: `admin > manager > user > guest`
   - Add helper functions: `hasMinimumRole(user, 'manager')`

3. **Permission System**
   - Create permissions enum: `'read:users' | 'write:users' | ...`
   - Map roles to permissions
   - Check permissions instead of roles

4. **UI Visibility**
   - Hide/show features based on role
   - Conditional rendering: `*ngIf="user.role === 'admin'"`

## Migration Notes

- **Existing users**: Will have `null` or existing string values
- **Default value**: New users default to `'user'`
- **Backward compatible**: Optional field, no breaking changes
- **Data migration**: If needed, can run SQL to update existing roles:
  ```sql
  UPDATE users SET role = 'user' WHERE role IS NULL;
  ```

## Summary

This implementation provides:
- ✅ **Type safety** at compile time
- ✅ **Runtime validation** via DTOs
- ✅ **User-friendly** form interface
- ✅ **Easy extensibility** for new roles
- ✅ **Future-proof** migration paths
- ✅ **Minimal complexity** - no over-engineering

Perfect for MVP while maintaining flexibility for future RBAC implementation.
