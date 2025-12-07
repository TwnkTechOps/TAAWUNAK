# Access Control & Role-Based Permissions Plan

## Role Definitions

### 1. ADMIN (System Administrator)
**Full system access**
- ✅ All user management (create, edit, suspend, delete)
- ✅ All institution management (create, verify, manage)
- ✅ Credential verification
- ✅ Audit log access
- ✅ Policy matrix management
- ✅ Compliance dashboard
- ✅ All research content (projects, proposals, papers, funding)

### 2. INSTITUTION_ADMIN (Institution Administrator)
**Institution-scoped access**
- ✅ Manage own institution (settings, members, units)
- ✅ Invite/manage institution members
- ✅ View institution audit logs
- ✅ Create projects for institution
- ✅ Submit proposals on behalf of institution
- ✅ View own institution's research content
- ❌ Cannot manage other institutions
- ❌ Cannot verify credentials (admin only)
- ❌ Cannot access system-wide audit logs

### 3. RESEARCHER
**Research-focused access**
- ✅ Create and manage own projects
- ✅ Submit proposals
- ✅ Submit papers
- ✅ Browse funding opportunities
- ✅ Manage own profile and credentials
- ✅ View own reputation index
- ❌ Cannot manage institutions
- ❌ Cannot access admin features

### 4. REVIEWER
**Review-focused access**
- ✅ Review proposals
- ✅ Review papers
- ✅ View assigned review tasks
- ✅ Submit reviews and recommendations
- ❌ Cannot create projects
- ❌ Cannot manage users/institutions

### 5. COMPANY_USER
**Company partner access**
- ✅ View relevant funding opportunities
- ✅ Submit partnership proposals
- ✅ View company projects
- ❌ Limited research content access

### 6. STUDENT
**Student access**
- ✅ View public research content
- ✅ Apply to projects (if allowed)
- ✅ View own profile
- ❌ Cannot create projects
- ❌ Cannot submit proposals/papers

## Page Access Matrix

| Page | ADMIN | INSTITUTION_ADMIN | RESEARCHER | REVIEWER | COMPANY_USER | STUDENT |
|------|-------|-------------------|------------|----------|--------------|---------|
| `/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/projects` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ (view only) |
| `/funding` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/proposals` | ✅ | ✅ | ✅ | ✅ (review) | ✅ | ❌ |
| `/papers` | ✅ | ✅ | ✅ | ✅ (review) | ✅ | ✅ (view only) |
| `/admin/users` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/admin/institutions` | ✅ | ✅ (own only) | ❌ | ❌ | ❌ | ❌ |
| `/admin/credentials` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/admin/audit` | ✅ | ✅ (own inst) | ❌ | ❌ | ❌ | ❌ |
| `/admin/compliance` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/admin/policy` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/profile` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/settings/security` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Navigation Rules

1. **Top Navigation Bar**: Shows different items based on role
   - All authenticated users: Dashboard, Home
   - Researchers/Admins: Projects, Funding, Proposals, Papers
   - Admins: Additional "Admin" link
   - Unauthenticated: Login, Register

2. **Admin Sidebar**: Only visible on `/admin/*` pages for ADMIN and INSTITUTION_ADMIN roles

3. **User Menu**: Shows in topbar when authenticated
   - Profile link (all)
   - Security settings (all)
   - Admin Panel link (ADMIN only)
   - Institution Management (INSTITUTION_ADMIN only)
   - Logout (all)

## Implementation Status

- ✅ User authentication hook (`useAuth`)
- ✅ Role-based navigation in Topbar
- ✅ User menu with role-based links
- ✅ Admin sidebar component
- ✅ Role-based dashboard content
- ⏳ Page-level access guards (to be implemented)
- ⏳ API-level role checks (already implemented)

