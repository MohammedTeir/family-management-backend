# Family Management System API Documentation

## Overview
This is a comprehensive backend API for a family management system built with Express.js, using JWT authentication. The system includes role-based access control with three roles: head (family head), admin (system administrator), and root (super administrator).

## Authentication
- **Login**: `POST /api/login`
  - Request: `{ username: string, password: string }`
  - Response: `{ token: string, user: User }`
- **Logout**: `POST /api/logout`
- **Current User**: `GET /api/user` (requires auth header)
- **Change Password**: `POST /api/change-password` (requires auth header)

## Main API Endpoints

### Settings
- **Get Settings**: `GET /api/settings` (requires auth)
- **Set Settings**: `POST /api/settings` (root only)
- **Bulk Settings**: `POST /api/settings/bulk` (root only)
- **Public Settings**: `GET /api/public/settings` (no auth required)
- **Maintenance Mode**: `GET/POST /api/settings/maintenance` (root only)

### Family Management
- **Get Family**: `GET /api/family` (head user gets their family)
- **Create Family**: `POST /api/family` (head user creates their family)
- **Update Family**: `PUT /api/family/:id` (admin or head with ownership)
- **Admin Family Get**: `GET /api/admin/families/:id` (admin only)
- **Admin Family Update**: `PUT /api/admin/families/:id` (admin only)
- **Admin Family Delete**: `DELETE /api/admin/families/:id` (admin only)

### Members Management
- **Get Family Members**: `GET /api/family/:familyId/members` (head or admin)
- **Create Member**: `POST /api/members` (head creates for their family)
- **Update Member**: `PUT /api/members/:id` (head with ownership or admin)
- **Delete Member**: `DELETE /api/members/:id` (head with ownership or admin)
- **Admin Create Member**: `POST /api/admin/families/:id/members` (admin only)

### Wife Management
- **Get Wife**: `GET /api/family/:familyId/wife` (head or admin)
- **Create Wife**: `POST /api/family/:familyId/wife` (head or admin)
- **Update Wife**: `PUT /api/family/:familyId/wife` (head or admin)
- **Delete Wife**: `DELETE /api/family/:familyId/wife` (head or admin)

### Requests Management
- **Get Requests**: `GET /api/requests` (head gets their requests, admin gets all)
- **Create Request**: `POST /api/requests` (head creates for their family)
- **Update Request**: `PUT /api/requests/:id` (admin only)

### Notifications
- **Get Notifications**: `GET /api/notifications` (head gets relevant, admin gets all)
- **Create Notification**: `POST /api/notifications` (admin only)

### Support Vouchers
- **Get All Vouchers**: `GET /api/support-vouchers` (admin only)
- **Get Voucher**: `GET /api/support-vouchers/:id` (admin only)
- **Create Voucher**: `POST /api/support-vouchers` (admin only)
- **Update Voucher**: `PATCH /api/support-vouchers/:id` (admin only)
- **Add Recipients**: `POST /api/support-vouchers/:id/recipients` (admin only)
- **Notify Recipients**: `POST /api/support-vouchers/:id/notify` (admin only)
- **Update Recipient**: `PATCH /api/voucher-recipients/:id` (admin only)

### User Management (Admin Only)
- **Get All Users**: `GET /api/admin/users`
- **Create User**: `POST /api/admin/users` (root only)
- **Update User**: `PUT /api/admin/users/:id` (admin/root)
- **Delete User**: `DELETE /api/admin/users/:id` (admin/root)
- **Reset Lockout**: `POST /api/admin/users/:id/reset-lockout` (admin/root)
- **Restore User**: `POST /api/admin/users/:id/restore` (root only)

### Data Management
- **Import Heads**: `POST /api/admin/import-heads` (admin/root) - Excel bulk import
- **Backup Database**: `GET /api/admin/backup` (root only)
- **Restore Database**: `POST /api/admin/restore` (root only)
- **Merge Database**: `POST /api/admin/merge` (root only)

### Registration
- **Register Family**: `POST /api/register-family` - Self-registration for heads

## Key Features

### 1. Role-based Access Control
- **Head**: Can view and modify their own family data
- **Admin**: Can view and manage all families and users
- **Root**: Full system access including user management and settings

### 2. Family Data Structure
- Families contain husband information, wife (optional), and members
- Each family has statistical information (total members, gender counts)
- Displacement status and war damage tracking

### 3. Request System
- Financial, medical, and damage assistance requests
- Status tracking (pending, approved, rejected)
- Admin comments and notifications

### 4. Support Vouchers
- System to create and distribute support vouchers
- Recipient tracking with status updates
- Notification system

### 5. Notifications
- Role-targeted notifications
- Specific user notifications
- Urgent notifications

### 6. Security Features
- JWT authentication
- Password policies with complexity requirements
- Failed login attempt tracking and account lockout
- Soft deletion for user records

### 7. Data Import/Export
- Excel import for family heads
- JSON backup/restore functionality
- Database merge capabilities

## Frontend Implementation Requirements

### 1. Authentication Flow
- Login page with username/password
- Protected routes with JWT token
- Password change functionality
- Session management

### 2. Dashboard Views
- Head role: Family data view and request submission
- Admin role: Family management, user management, request approval
- Root role: Settings management, system backup/restore

### 3. Form Components
- Family registration form
- Member creation/edit forms
- Request submission forms
- Wife information forms

### 4. Data Display Components
- Family list/table with filtering
- Request status tracking
- Member details and editing
- Notification center

### 5. Specialized Views
- Voucher management for admins
- User management with role controls
- Settings configuration for root users
- Reports and statistics (if needed)

### 6. Security Considerations
- Proper role-based UI rendering
- Input validation matching backend
- Secure handling of JWT tokens
- Error handling for authentication failures

## Data Models

### User
- id, username, role, phone, isProtected, createdAt, failedLoginAttempts, lockoutUntil, deletedAt

### Family
- id, userId, husbandName, husbandID, husbandBirthDate, husbandJob, primaryPhone, secondaryPhone, originalResidence, currentHousing, isDisplaced, displacedLocation, isAbroad, warDamage2024, warDamageDescription, branch, landmarkNear, totalMembers, numMales, numFemales, socialStatus, adminNotes, createdAt

### Member
- id, familyId, fullName, memberID, birthDate, gender, isDisabled, disabilityType, relationship, isChild, createdAt

### Request
- id, familyId, type, description, attachments, status, adminComment, createdAt, updatedAt

### Support Voucher
- id, title, description, supportType, createdBy, createdAt, location, isActive

### Voucher Recipient
- id, voucherId, familyId, status, notified, notifiedAt, updatedBy, updatedAt, notes

## Error Handling
- Standard error responses: `{ message: string }`
- Validation errors: `{ message: string, errors: ZodError[] }`
- 403 for unauthorized access
- 404 for not found resources
- 409 for conflicts (e.g., duplicate user)