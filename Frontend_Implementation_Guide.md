# Frontend Implementation Guide for Family Management System

## Overview
This document outlines the backend API structure and specific requirements for the frontend implementation of the family management system. It details the endpoints to call, data structures to use, and UI components needed.

## Authentication Flow

### 1. Login Screen
- **API Call**: `POST /api/login`
- **Request Body**: `{ username: string, password: string }`
- **Response**: `{ token: string, user: User }`
- **Action**: Store JWT token in localStorage/sessionStorage and redirect based on user role

### 2. Logout Functionality
- **API Call**: `POST /api/logout`
- **Action**: Remove token and redirect to login page

### 3. Current User Data
- **API Call**: `GET /api/user` (requires Authorization header)
- **Usage**: Get current user information after login

### 4. Password Change
- **API Call**: `POST /api/change-password`
- **Request Body**: `{ currentPassword: string, newPassword: string }`
- **Requires Authorization header**

## Dashboard Views by Role

### Head Role Dashboard
- **Family Information View**: Get family data with `GET /api/family`
- **Member Management**: Create/update/delete members with `/api/members` endpoints
- **Request Submission**: Submit requests with `POST /api/requests`
- **View Requests**: Get own requests with `GET /api/requests`
- **Notifications**: Get relevant notifications with `GET /api/notifications`

### Admin Role Dashboard
- **Family Management**: List all families with `GET /api/admin/families`
- **User Management**: List users with `GET /api/admin/users`
- **Request Approval**: Approve/reject requests with `PUT /api/requests/:id`
- **Voucher Management**: Create and manage vouchers with `/api/support-vouchers` endpoints
- **Notification System**: Create notifications with `POST /api/notifications`

### Root Role Dashboard
- **System Settings**: Full system configuration with `/api/settings` endpoints
- **User Creation**: Create new users with `POST /api/admin/users`
- **Database Operations**: Backup/restore with `/api/admin/backup` and `/api/admin/restore`

## API Data Structures & Endpoints

### 1. Family Data Management

#### Get Current Family
- **API**: `GET /api/family`
- **Response**: `{ ...family, wife, members }`
- **Frontend Use**: Display family dashboard

#### Update Family
- **API**: `PUT /api/family/:id`
- **Request Body**: All fields from `InsertFamily` schema
- **Authorization**: Head role (own family) or Admin

#### Wife Management
- **Get Wife**: `GET /api/family/:familyId/wife`
- **Create Wife**: `POST /api/family/:familyId/wife`
- **Update Wife**: `PUT /api/family/:familyId/wife`
- **Delete Wife**: `DELETE /api/family/:familyId/wife`

### 2. Members Management

#### Get Members
- **API**: `GET /api/family/:familyId/members`
- **Response**: Array of member objects

#### Create Member
- **API**: `POST /api/members`
- **Request Body**: 
  ```javascript
  {
    fullName: string,
    memberID?: string,
    birthDate?: string,
    gender: "male"|"female",
    isDisabled: boolean,
    disabilityType?: string,
    relationship: "son"|"daughter"|"mother"|"other",
    isChild: boolean
  }
  ```

#### Update Member
- **API**: `PUT /api/members/:id`

#### Delete Member
- **API**: `DELETE /api/members/:id`

### 3. Request Management

#### Submit Request
- **API**: `POST /api/requests`
- **Request Body**:
  ```javascript
  {
    type: "financial"|"medical"|"damage", 
    description: string, 
    attachments?: string[]
  }
  ```

#### View Requests
- **API**: `GET /api/requests`
- **Head Role**: Gets only their family's requests
- **Admin Role**: Gets all requests with family information

#### Admin Request Approval
- **API**: `PUT /api/requests/:id`
- **Request Body**: `{ status: "approved"|"rejected", adminComment?: string }`

### 4. Support Vouchers

#### Create Voucher
- **API**: `POST /api/support-vouchers`
- **Request Body**:
  ```javascript
  {
    title: string,
    description?: string,
    supportType: "food_basket"|"cash_support"|"school_kit"|"medical"|"other",
    location?: string
  }
  ```

#### Add Recipients to Voucher
- **API**: `POST /api/support-vouchers/:id/recipients`
- **Request Body**: `{ familyIds: number[] }`

#### Notify Voucher Recipients
- **API**: `POST /api/support-vouchers/:id/notify`
- **Request Body**: `{ recipientIds?: number[] }` (empty for all recipients)

### 5. Settings Management

#### Get Settings
- **API**: `GET /api/settings` (authenticated) or `GET /api/public/settings` (public)
- **Usage**: Apply branding, theming, and system configuration

#### Update Settings (Root Only)
- **API**: `POST /api/settings` or `POST /api/settings/bulk`
- **Request Body**: `{ key: string, value: string, description?: string }`

## UI Components to Implement

### 1. Authentication Components
- Login page with username/password fields
- Protected route wrapper
- Session timeout handling
- Error feedback for authentication failures

### 2. Dashboard Components
- Role-based dashboard components
- Navigation menu with role-appropriate options
- Statistics and summary cards
- Welcome message with user information

### 3. Family Management Components
- Family information card with edit form
- Member listing table with add/edit/delete functionality
- Wife information form
- Family statistics display
- Address and contact information display

### 4. Request Components
- Request submission form with type selector
- Request status tracking table
- Attachment upload functionality
- Request history view

### 5. Notification Components
- Notification center with unread badge
- Notification list with filtering options
- In-app notification display

### 6. Voucher Management Components (Admin)
- Voucher creation form
- Voucher listing with status indicators
- Recipient assignment interface
- Status tracking for voucher distribution

### 7. User Management Components (Admin/Root)
- User listing table with role indicators
- User creation form (root only)
- User editing form with role assignment
- Account lockout management

## Data Validation Requirements

### 1. Form Validation
- Match backend validation rules (use Zod schemas as reference)
- Real-time validation feedback
- Required field indicators
- Format validation (dates, phone numbers, etc.)

### 2. Role-Based Access
- Hide/show UI elements based on user role
- Redirect unauthorized users appropriately
- Disable buttons without permissions

## Error Handling

### 1. API Error Responses
- Handle 401 (unauthorized) by redirecting to login
- Handle 403 (forbidden) with appropriate user feedback
- Handle 404 (not found) with user-friendly messages
- Display validation errors from backend

### 2. Network Error Handling
- Handle API timeouts gracefully
- Show loading states during requests
- Implement retry mechanisms for failed requests

## Security Considerations

### 1. JWT Token Management
- Secure token storage (consider httpOnly cookies)
- Token expiration handling
- Secure token transmission

### 2. Input Sanitization
- Sanitize all user inputs before sending to backend
- Use parameterized queries to prevent injection

### 3. Sensitive Data Protection
- Don't expose sensitive data in client-side code
- Proper access control enforcement

## Internationalization
- The backend uses Arabic in responses, so ensure the frontend supports RTL layout
- Plan for potential translation of UI elements
- Consider date/time formatting for Arabic locale

## Performance Considerations

### 1. Data Loading
- Implement pagination for large datasets (families, users, requests)
- Use lazy loading where appropriate
- Implement caching for static data (settings)

### 2. Optimistic Updates
- Consider optimistic updates for better UX (e.g., marking notifications as read)
- Handle potential conflicts gracefully

This guide provides a comprehensive overview of backend integration requirements for the frontend implementation. Follow these specifications to ensure proper integration with the family management system backend.