# Lobnos LIMS - AI Coding Agent Instructions

## Architecture Overview

**Stack**: Next.js 14 (App Router) + React 18 + TypeScript + Bootstrap 5  
**Domain**: Clinical laboratory information management system (LIMS)

### Directory Structure
```
app/                          # Next.js App Router pages
├── (auth)/                   # Route group - public pages (no auth)
├── api/auth/                 # Authentication API routes
├── analytics/                # Analytics dashboards (admin only)
├── billing/                  # Billing & financial operations
├── operations/               # Laboratory & imaging workflows
│   ├── laboratory/          # Lab scientist workspace
│   └── imaging/             # Sonographer workspace
├── crm/                     # Customer relationship management
├── compliance/              # Incident reporting & compliance
└── settings/                # System configuration (admin/manager)

components/
├── Auth/                    # **CRITICAL**: API utilities & auth context
│   ├── customFetch.js      # Central API layer (1163 lines)
│   └── useApplicationContext.js  # Global state provider
├── Layout/                  # Navigation & layout components
└── [feature]/              # Feature-organized components

lib/                         # Shared utilities & business logic
styles/                      # Modular CSS (theme, forms, layout)
middleware.ts               # **CRITICAL**: Route protection & RBAC
```

## Authentication & Authorization

### Session Management
**Session flow**: Backend login → JWT stored in httpOnly cookies → Validated via middleware

```typescript
// Login redirects based on role
if (role === "admin" || role === "manager") router.push("/");
else if (role === "sonographer") router.push("/operations/imaging/ultrasound");
else if (role === "scientist") router.push("/operations/laboratory");
```

### Role-Based Access Control (RBAC)
**Roles**: admin, manager, scientist, sonographer, phelobotomist, customer service representative

**Protected by `middleware.ts`**:
```typescript
// Sonographers: Only /operations/imaging/*
// Scientists: Only /operations/laboratory/*
// Admin only: /analytics/*, /settings/*
// Admin/Manager: /billing/settings/*, /billing/billing-sessions/*
```

**Access user context**:
```tsx
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';

const { applicationsettings } = useApplicationSettings();
const { user, company, branchid } = applicationsettings;
const { employeeid, role, username } = user;
```

## Layout Architecture

### Nested Layout Pattern
**Every feature section has**: Feature Layout → PrimeLayout → MAIN_LAYOUT → Root Layout

```tsx
// Feature layout example (app/analytics/layout.tsx)
<ApplicationProvider>
  <MAIN_LAYOUT>  {/* Fetches user context from /api/auth/context-retrieval */}
    <PrimeLayout links={AnalyticsLinks}>  {/* Sidebar navigation */}
      {children}
    </PrimeLayout>
  </MAIN_LAYOUT>
</ApplicationProvider>
```

**MAIN_LAYOUT responsibilities**:
- Fetches authenticated user context on mount
- Caches in localStorage as 'applicationsettings'
- Redirects to login if unauthorized

**PrimeLayout responsibilities**:
- Renders sidebar with feature-specific navigation links
- Role-based "Quick Links" (roleViews)
- Mobile-responsive sidebar

### Navigation Links Structure
```typescript
// components/Layout/links/categories/AnalyticsLinks.tsx
export const AnalyticsLinks: Link[] = [
  { title: "Overview", link: "/analytics", icon: <Icon /> },
  { 
    title: "Sales", 
    icon: <Icon />,
    children: [
      { title: "Daily Trend", link: "/analytics/sales/dailySalesTrend" },
      // ...
    ]
  }
];
```

## API Communication

### Primary Pattern: customFetch/customPost
**Always use** from `components/Auth/customFetch.js`:

```typescript
import { customFetch, customPost } from '../../../components/Auth/customFetch';

// GET - auto-appends tenantId, handles auth, 401 redirects
const data = await customFetch('logins?count=10&page=1');
// → Calls: http://localhost:5000/api/v1/logins?count=10&page=1&tenantId=3

// POST/PUT/DELETE
const response = await customPost('endpoint', 'POST', { key: 'value' });

// Inventory service (separate microservice)
import { InventoryFetch } from '../../../components/Auth/customFetch';
const inventory = await InventoryFetch('items');
// → Calls: http://localhost:9000/api/v1/items
```

**Response handling pattern**:
```typescript
const response = await customFetch(endpoint);
if (response?.status === 'success' && response?.statusCode === 200) {
  setData(response.result);
}
```

### Next.js API Routes
**Used for**: Authentication flows only (`app/api/auth/`)

```typescript
// app/api/auth/login/route.ts - Sets JWT cookies
// app/api/auth/context-retrieval/route.ts - Validates session
// app/api/auth/logout/route.ts - Clears session
```

## Component Patterns

### Standard Page Structure
```tsx
'use client';
import { useState, useEffect } from 'react';
import { customFetch } from '../../../components/Auth/customFetch';
import Loader from '../../../components/isLoading';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';

export default function PageName() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { applicationsettings } = useApplicationSettings();
  const { user } = applicationsettings;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await customFetch('endpoint?params');
        setData(response);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  if (!data) return <div>No data available</div>;

  return (
    <div className="container-fluid px-4 py-3">
      {/* Content */}
    </div>
  );
}
```

### Analytics Pages
**Follow** `app/analytics/leads/page.tsx`:
- TypeScript interfaces for API responses
- Recharts for visualizations
- Metric cards: `<div className="border rounded p-3">` (NOT Bootstrap Cards)
- Date range filters with dayjs
- Spacing: `mb-4` between sections, `p-3` for padding

### Role-Based Conditional Rendering
```tsx
const { user } = useApplicationSettings().applicationsettings;
const isAdmin = user.role === "admin";

if (!isAdmin) return <UnauthorizedAccess />;
```

## Styling Conventions

```tsx
// ✅ Use border/rounded divs instead of Card components
<div className="border rounded h-100">
  <div className="p-3">
    <h6 className="mb-3 fw-bold">Title</h6>
    {/* Content */}
  </div>
</div>

// ❌ Avoid Bootstrap Card components
<Card><Card.Body>...</Card.Body></Card>

// Container structure
<div className="container-fluid px-4 py-3">
  <div className="row g-3 mb-4">
    <div className="col-md-3">
      {/* Metric card */}
    </div>
  </div>
</div>
```

## Development Workflow

```bash
npm run next    # Dev server with HTTPS on port 2377
npm run build   # Production build
npm run start   # Production server
```

**Environment vars** (`.env` or `next.config.js`):
- `BASEURL` - Backend API (http://localhost:5000/api/v1/)
- `TENANTID` - Multi-tenant identifier (default: "3")
- `NEXT_PUBLIC_ACCESS_TOKEN` - Backend service JWT
- `PSL_INVEN_ROUTE` - Inventory microservice (http://localhost:9000/api/v1)
- `JWT_SECRET_KEY` - Session token signing key

## Critical Utilities

**From `components/Auth/customFetch.js`**:
- `customFetch(endpoint)` - GET requests
- `customPost(endpoint, method, data)` - POST/PUT/DELETE
- `InventoryFetch(endpoint)` - Inventory service
- `handleLogout()` - Logout with redirect
- `currencyFormatter` - GHS currency (new Intl.NumberFormat)
- `getApplicationSettings()` - Fetch app configuration

**From `components/Auth/useApplicationContext.js`**:
- `useApplicationSettings()` - Access global state
- `ApplicationProvider` - Context provider wrapper

## Common Patterns

**Error handling**:
```typescript
try {
  const response = await customFetch(endpoint);
  if (response?.status === 'success' && response?.statusCode === 200) {
    setData(response.result);
  }
} catch (error) {
  setData([]);
}
```

**Loading states**: Always use `<Loader />` from `components/isLoading.js`

**Date formatting**: Use `dayjs` (imported globally)

**Form validation**: React Hook Form + Yup resolver

**Unauthorized access**: `<UnauthorizedAccess />` from `app/operations/laboratory/unauthorized/page`

## Laboratory-Specific Concepts

**Sample lifecycle**: Registration → Phelobotomy → Validation → Processing → Completed → Validation → Validated → Result Entry

**Key operations**:
- Sample validation: Verify container, labeling, volume
- Result entry: Multi-step form with test panels
- Critical values: Alerts for urgent results
- Turn-around time (TAT): Performance metrics

**Routes**:
- `/operations/laboratory/sample/validation` - Accept/reject samples
- `/operations/laboratory/processing` - Active tests
- `/operations/laboratory/validation` - QC review
- `/operations/laboratory/validated` - Final results

## Key Reference Files

- `middleware.ts` - Route protection & RBAC rules
- `components/Auth/customFetch.js` - API layer (1163 lines)
- `components/Layout/PrimeLayout.tsx` - Sidebar navigation
- `components/Auth/useApplicationContext.js` - Global state
- `app/analytics/leads/page.tsx` - Complete analytics example
- `lib/store.js` - Default state structure
- `features.md` - Feature documentation
- `backend-implementation-guide.md` - API contracts
