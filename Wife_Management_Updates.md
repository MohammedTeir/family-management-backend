i want you to change the family system from wives to wife here is the changes i do in backend btw we update some in frontend but my laptop shutdown suddenly beacuse of that check everyting again:

# Wife Management System Update Documentation

## Overview
This document details the significant changes made to the family management system to update the wife management functionality. The system was modified from supporting multiple wives per family to supporting a single wife per family.

## Changes Summary
The update involves three main files with comprehensive changes to support a one-to-one relationship between families and wives:

1. **schema.ts**: Database schema changes
2. **storage.ts**: Storage layer updates
3. **routes.ts**: API endpoint modifications

## Detailed Changes

### 1. schema.ts Changes

#### Table Name and Structure
- **Before**: Table named `wives` (plural) supporting multiple wives per family
- **After**: Table named `wife` (singular) supporting one wife per family

#### Index Updates
- **Before**: `wives_family_id_idx` index
- **After**: `wife_family_id_idx` index

#### Relations Updates
- **Before**: `wives: many(wives)` relation allowing multiple wives
- **After**: `wife: one(wife)` relation allowing only one wife per family

#### Relations Definition Changes
- **Before**: `wivesRelations` relations definition
- **After**: `wifeRelations` relations definition

#### Schema Reference Updates
- **Before**: References to `wives` schema
- **After**: Updated references to `wife` schema

### 2. storage.ts Changes

#### Import Updates
- **Before**: `import { wives } from "./schema.js"`
- **After**: `import { wife } from "./schema.js"`

#### Method Name Changes
- **Before**: `getWivesByFamilyId(familyId)` method
- **After**: `getWifeByFamilyId(familyId)` method

#### Implementation Updates
- **Before**: `getWivesByFamilyId` implementation returning multiple wives
- **After**: `getWifeByFamilyId` implementation returning a single wife

#### Database Query Changes
- **Before**: All database queries referencing `wives` table
- **After**: All database queries referencing `wife` table

#### Delete Family Method Update
- **Before**: Delete operation removing multiple wives for a family
- **After**: Delete operation removing only one wife for a family

#### Additional Method
- **Added**: `clearWives` method (kept the name for consistency with the table name)

### 3. routes.ts Changes

#### API Endpoint Changes

##### GET Endpoint
- **Before**: `GET /api/family/:familyId/wives` (returns array of wives)
- **After**: `GET /api/family/:familyId/wife` (returns single wife or null)

##### POST Endpoint
- **Before**: `POST /api/wives` (creates a wife with familyId in request body)
- **After**: `POST /api/family/:familyId/wife` (creates a wife for specific family)

##### PUT Endpoint
- **Before**: `PUT /api/wives/:id` (updates specific wife by ID)
- **After**: `PUT /api/family/:familyId/wife` (updates wife for specific family)

##### DELETE Endpoint
- **Before**: `DELETE /api/wives/:id` (deletes specific wife by ID)
- **After**: `DELETE /api/family/:familyId/wife` (deletes wife for specific family)

#### Logic Updates
- **Before**: Logic supporting multiple wives per family
- **After**: Logic supporting single wife per family with proper validation

#### Validation Additions
- **Added**: Validation to prevent creating multiple wives for the same family
- **Before**: No validation against multiple wives per family
- **After**: System ensures only one wife per family can exist

## Database Schema Impact

### Table Structure
The `wife` table maintains the same structure as before but now enforces a one-to-one relationship with families:

```sql
-- wife table structure (unchanged fields, but now one-to-one with families)
id (primary key)
familyId (foreign key to families table, one-to-one)
wifeName (text, required)
wifeID (varchar, optional)
wifeBirthDate (varchar, optional)
wifeJob (text, optional)
wifePregnant (boolean, default false)
createdAt (timestamp, default now)
```

### Relationship Enforcement
- The database schema now enforces that each family can have at most one wife
- Multiple attempts to create a wife for a family that already has a wife will be prevented

## API Behavior Changes

### GET /api/family/:familyId/wife
- **Before**: Returns an array of wives (could be empty or have multiple)
- **After**: Returns a single wife object or null if none exists

### POST /api/family/:familyId/wife
- **Before**: Could create additional wives for the same family
- **After**: Will check if a wife already exists for the family and return an error if so

### PUT /api/family/:familyId/wife
- **Before**: Required wife ID in the URL path
- **After**: Uses family ID in the path, operates on the single wife associated with that family

### DELETE /api/family/:familyId/wife
- **Before**: Required wife ID in the URL path
- **After**: Uses family ID in the path, deletes the single wife associated with that family

## Migration Considerations

### Data Migration
- Existing systems with multiple wives per family will need to be migrated
- Strategy: Keep the first/primary wife and remove others, or select the most recently added wife
- The system will now enforce the single wife constraint going forward

### Frontend Updates Required
- Update API calls to match new endpoint patterns
- Update UI to handle single wife instead of array of wives
- Update form submissions to use new endpoint patterns
- Update validation logic to match new system constraints

## Security and Access Control
- All existing authorization and authentication remains unchanged
- Head users can only access/modify the wife for their own family
- Admin users can access/modify wives for any family
- No changes to permission structure, only to the data structure and endpoints

## Error Handling Changes
- New validation prevents multiple wives per family creation
- Updated error responses to reflect single wife constraints
- Consistent error handling across all wife-related endpoints

## Summary
This update transforms the wife management system from a one-to-many relationship (one family to many wives) to a one-to-one relationship (one family to one wife). The changes are comprehensive across the database schema, storage layer, and API endpoints to ensure data consistency and proper business logic enforcement.