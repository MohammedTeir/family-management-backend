# Wife Management System - Implementation Guide

## Overview
This document provides comprehensive details about the wife management functionality in the family management system, including API endpoints, data structure, and frontend implementation requirements.

## Data Structure

### Wife Schema
The wife data structure is defined in the database schema with the following fields:

```typescript
{
  id: number (auto-generated),           // Primary key
  familyId: number,                     // Foreign key to families table
  wifeName: string (required),          // Full name of the wife
  wifeID?: string,                      // National ID of the wife (optional)
  wifeBirthDate?: string,               // Birth date in format YYYY-MM-DD (optional)
  wifeJob?: string,                     // Occupation of the wife (optional)
  wifePregnant: boolean (default false) // Pregnancy status (default false)
  createdAt: timestamp                  // Creation date (auto-generated)
}
```

## API Endpoints for Wife Management

### 1. Get Wife Information
- **Method**: `GET`
- **Endpoint**: `/api/family/:familyId/wife`
- **Authentication**: Required (JWT token in Authorization header)
- **Authorization**: Head (for own family) or Admin
- **URL Parameters**: `familyId` - the ID of the family to retrieve wife info
- **Response**: 
  - Success: 200 with wife object or null if not exists
  - Error: 403 for unauthorized access, 404 for family not found

### 2. Create Wife Information
- **Method**: `POST`
- **Endpoint**: `/api/family/:familyId/wife`
- **Authentication**: Required (JWT token in Authorization header)
- **Authorization**: Head (for own family) or Admin
- **URL Parameters**: `familyId` - the ID of the family to add wife to
- **Request Body**:
  ```json
  {
    "wifeName": "string (required)",
    "wifeID": "string (optional)",
    "wifeBirthDate": "string (optional, format: YYYY-MM-DD)",
    "wifeJob": "string (optional)",
    "wifePregnant": "boolean (optional, default: false)"
  }
  ```
- **Response**:
  - Success: 201 with created wife object
  - Error: 400 for validation errors, 403 for unauthorized access, 404 for family not found, 409 for existing wife

### 3. Update Wife Information
- **Method**: `PUT`
- **Endpoint**: `/api/family/:familyId/wife`
- **Authentication**: Required (JWT token in Authorization header)
- **Authorization**: Head (for own family) or Admin
- **URL Parameters**: `familyId` - the ID of the family to update wife info
- **Request Body**: (all fields optional)
  ```json
  {
    "wifeName": "string (optional)",
    "wifeID": "string (optional)",
    "wifeBirthDate": "string (optional)",
    "wifeJob": "string (optional)",
    "wifePregnant": "boolean (optional)"
  }
  ```
- **Response**:
  - Success: 200 with updated wife object
  - Error: 400 for validation errors, 403 for unauthorized access, 404 for family or wife not found

### 4. Delete Wife Information
- **Method**: `DELETE`
- **Endpoint**: `/api/family/:familyId/wife`
- **Authentication**: Required (JWT token in Authorization header)
- **Authorization**: Head (for own family) or Admin
- **URL Parameters**: `familyId` - the ID of the family to delete wife from
- **Response**:
  - Success: 204 No Content
  - Error: 403 for unauthorized access, 404 for family or wife not found

## Authorization Rules

### For Head Users:
- Can only access wife information for their own family
- Verified by checking if `family.userId === req.user.id`
- Cannot access other families' wife information

### For Admin Users:
- Can access wife information for any family
- Can create, update, or delete wife information for any family

### For Root Users:
- Full access like admin users
- Additional system-level privileges not specific to wife management

## Frontend Implementation Requirements

### 1. Wife Information Form
Create a form with the following fields:
- **Wife Name**: Required text input
- **Wife ID**: Optional text input for national ID
- **Birth Date**: Optional date picker (YYYY-MM-DD format)
- **Job**: Optional text input for occupation
- **Pregnant**: Optional checkbox for pregnancy status

### 2. Wife Management Components

#### Wife Information Display Component
- Show all wife information if exists
- Display "No wife information" message if not exists
- Include edit button for authorized users
- Show different views based on user role and permissions

#### Wife Creation Form Component
- Same fields as in the update form
- Submit button for creating wife information
- Validation for required fields
- Error display for API errors

#### Wife Update Form Component
- Pre-populated with existing wife information
- Ability to update any combination of fields
- Submit button for updating wife information
- Validation for field formats
- Success/error notifications

### 3. Integration Points

#### Family Dashboard Integration
- Include wife information section in family view
- Add "Add Wife" button if no wife exists
- Add "Edit Wife" button if wife exists
- Ensure proper authorization checks before showing buttons

#### Member Management Correlation
- Consider wife as a special type of family member
- Ensure consistency with member data if needed
- Avoid duplicate information between wife and member records

## Error Handling

### API Error Responses
- `400 Bad Request`: Validation errors - display field-specific error messages
- `403 Forbidden`: Unauthorized access - redirect or show permission error
- `404 Not Found`: Family or wife not found - show appropriate message
- `409 Conflict`: Wife already exists (for create) - inform user
- `500 Internal Server Error`: System error - show generic error message

### Frontend Validation
- Validate required fields before submitting to API
- Validate date format for birth date field
- Show real-time validation feedback
- Implement proper loading states during API calls

## UI/UX Considerations

### 1. Conditional Visibility
- Show "Add Wife" button only when no wife exists
- Show "Edit Wife" button only when wife exists
- Respect role-based permissions in UI

### 2. Loading States
- Show loading spinner during API calls
- Disable form buttons during submission
- Provide feedback on save operations

### 3. Confirmation Dialogs
- Show confirmation dialog for delete operations
- Confirm before overwriting existing wife information
- Inform about data implications

## Sample API Requests

### Create Wife
```javascript
// POST /api/family/123/wife
{
  "wifeName": "Fatima Ali",
  "wifeID": "123456789",
  "wifeBirthDate": "1990-05-15",
  "wifeJob": "Teacher",
  "wifePregnant": true
}
```

### Update Wife
```javascript
// PUT /api/family/123/wife
{
  "wifeName": "Fatima Ahmed",
  "wifeJob": "Doctor",
  "wifePregnant": false
}
```

## Database Relations
- The wife table has a foreign key relationship with the families table via `familyId`
- Each family can have at most one wife record
- Deleting a family will cascade delete the associated wife record (based on foreign key constraints)

## Security Considerations
- All API endpoints require authentication via JWT token
- Access is limited based on user role and family ownership
- Sensitive personal information should be protected in transmission
- Proper authorization checks prevent unauthorized data access or modification