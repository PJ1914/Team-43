# Role-Based Access Control (RBAC) Guide

## Overview
This application implements comprehensive role-based access control with three distinct roles:
- **Faculty**: Can create and manage reports for their own department only
- **Coordinator**: Can review and manage all department reports
- **Admin**: Full system access including user management and configuration

---

## Role Permissions Matrix

### Faculty Role
**Access Level**: Department-scoped

**Can Do:**
- ✅ View reports from their own department only
- ✅ Create weekly reports for their own department
- ✅ Add, edit, and delete their own entries
- ✅ View all sections in their department's reports
- ✅ Mark sections as complete/incomplete

**Cannot Do:**
- ❌ View reports from other departments
- ❌ Create reports for other departments
- ❌ Access user management
- ❌ Access review reports dashboard
- ❌ Modify system configuration
- ❌ Edit/delete entries created by others

**UI Elements:**
- Dashboard shows only their department's reports
- "Create Weekly Report" button visible
- Department field is locked to their assigned department
- Navigation shows: Dashboard, Create Weekly Report
- User badge displays role and department

---

### Coordinator Role
**Access Level**: System-wide (all departments)

**Can Do:**
- ✅ View all reports from all departments
- ✅ Create weekly reports for any department
- ✅ Add, edit, and delete their own entries
- ✅ Edit and delete entries created by others
- ✅ Review and manage all reports
- ✅ Manage users (view user list)
- ✅ Approve/reject report entries

**Cannot Do:**
- ❌ Change user roles
- ❌ Modify system configuration (sections, departments, schemas)
- ❌ Delete reports (only admin can)

**UI Elements:**
- Dashboard shows all departmental reports
- "Create Weekly Report" button visible
- Free choice of department when creating reports
- Navigation shows: Dashboard, Create Weekly Report, Manage Users, Review Reports
- User badge displays role and department
- Action buttons show "Review" mode

---

### Admin Role
**Access Level**: Full system access

**Can Do:**
- ✅ Everything Coordinator can do
- ✅ Change user roles
- ✅ Delete users
- ✅ Modify system configuration (sections, departments, schemas)
- ✅ Delete reports
- ✅ Full database access

**Cannot Do:**
- Nothing is restricted

**UI Elements:**
- Dashboard shows all reports with admin-level insights
- No "Create Weekly Report" button (admins monitor, coordinators/faculty create)
- Navigation shows: Dashboard, Manage Users, Review Reports
- User badge displays role and department
- Full CRUD operations on all resources

---

## Security Implementation

### Frontend Security
1. **Route Protection**: `RoleProtected` component wraps admin/coordinator routes
2. **UI Filtering**: Navigation links filtered by role
3. **Department Lock**: Faculty users cannot select departments other than their own
4. **Conditional Rendering**: Buttons and actions shown/hidden based on role

### Backend Security
1. **Middleware**: 
   - `authenticate()` - Verifies Firebase token and loads user profile
   - `authorize(roles)` - Restricts endpoint access to specific roles
2. **Department Filtering**: Faculty users' queries automatically filtered by department
3. **Ownership Validation**: Users can only modify their own entries (unless admin/coordinator)

### Firestore Rules
1. **Department-scoped reads**: Faculty can only read reports where `report.department == user.department`
2. **Role-based writes**: Only admin can modify config, coordinators can delete entries
3. **Ownership checks**: Users can update their own entries, coordinators can update any

---

## Test Accounts

### Faculty Account
- **Email**: faculty@bvrit.ac.in
- **Password**: password123
- **Department**: Computer Science Engineering
- **Role**: faculty
- **Can Access**: Only CSE department reports

### Coordinator Account
- **Email**: coordinator@bvrit.ac.in
- **Password**: password123
- **Department**: Computer Science Engineering
- **Role**: coordinator
- **Can Access**: All departments, user management, review reports

### Admin Account
- **Email**: admin@bvrit.ac.in
- **Password**: password123
- **Department**: Administration
- **Role**: admin
- **Can Access**: Everything including config management

---

## Firestore Security Deployment

Before deploying, update Firestore rules:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

The security rules are in `firestore.rules` and handle:
- Department-scoped data access
- Role-based CRUD permissions
- Ownership validation
- Config protection

---

## API Endpoints with Role Restrictions

### Public Endpoints (Authenticated Users Only)
- `GET /api/config/*` - All roles can read configuration

### Faculty + Coordinator Endpoints
- `POST /api/reports/create-week` - Create reports (faculty: own dept only)
- `POST /api/sections/:sectionId/add-entry` - Add entries
- `PUT /api/sections/:sectionId/update-entry/:entryId` - Update entries
- `DELETE /api/sections/:sectionId/delete-entry/:entryId` - Delete entries

### Coordinator + Admin Endpoints
- `GET /api/admin/users` - List all users
- `GET /api/admin/reports` - Review reports dashboard

### Admin-Only Endpoints
- `PUT /api/admin/users/:uid/role` - Change user roles
- `POST /api/config/*` - Modify system configuration

---

## Best Practices

1. **Always verify role on both frontend and backend**
   - Frontend UI filtering is for UX only
   - Backend middleware enforces actual authorization

2. **Department filtering for faculty**
   - Queries automatically scoped to user's department
   - Cannot create reports for other departments

3. **Ownership validation**
   - Users can edit their own entries
   - Coordinators/admins can edit any entry

4. **Error handling**
   - 403 Forbidden for unauthorized access
   - 404 Not Found for resources outside scope

---

## Future Enhancements

- [ ] Add department coordinator role (coordinator per department)
- [ ] Implement entry approval workflow
- [ ] Add audit logging for sensitive operations
- [ ] Email notifications for role changes
- [ ] Multi-factor authentication for admin accounts
