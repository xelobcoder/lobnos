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

**Roles**: admin, manager, scientist, sonographer, phelobotomist, storekeeper, customer service representative

**Protected by `middleware.ts`**:

```typescript
// Sonographers: Only /operations/imaging/*
// Scientists: Only /operations/laboratory/*
// Admin only: /analytics/*, /settings/*
// Admin/Manager: /billing/settings/*, /billing/billing-sessions/*
```

**Access user context**:

```tsx
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";

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
  <MAIN_LAYOUT>
    {" "}
    {/* Fetches user context from /api/auth/context-retrieval */}
    <PrimeLayout links={AnalyticsLinks}>
      {" "}
      {/* Sidebar navigation */}
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
    ],
  },
];
```

## API Communication

### Primary Pattern: customFetch/customPost

**Always use** from `components/Auth/customFetch.js`:

```typescript
import { customFetch, customPost } from "../../../components/Auth/customFetch";

// GET - auto-appends tenantId, handles auth, 401 redirects
const data = await customFetch("logins?count=10&page=1");
// → Calls: http://localhost:5000/api/v1/logins?count=10&page=1&tenantId=3

// POST/PUT/DELETE
const response = await customPost("endpoint", "POST", { key: "value" });

// Inventory service (separate microservice)
import { InventoryFetch } from "../../../components/Auth/customFetch";
const inventory = await InventoryFetch("items");
// → Calls: http://localhost:9000/api/v1/items
```

**Response handling pattern**:

```typescript
const response = await customFetch(endpoint);
if (response?.status === "success" && response?.statusCode === 200) {
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

### Physical Sample Workflow

- Use `components/phelobotomy/CollectionSampleModal.tsx` for grouped physical-container collection and `components/accessories/SampleAssessmentModal/SampleAssessmentModal.tsx` for container-level sample validation.
- Collection, reception, and validation are separate workflows. Do not add new calls to legacy per-ascension collection or sample-validation endpoints.
- The laboratory visit route is `/operations/laboratory/main/dailyRequest/visit`; it must reuse the physical-container components used by phlebotomy.
- Collection surfaces must expose a printable label for each created physical-sample barcode. Validation surfaces must support scanner input or typed barcode/sample ID through the authenticated physical-sample lookup endpoint.
- Phlebotomy reporting pages live under `/operations/phelobotomy/{sample-summary,review-requests,rejection-communications}` and use `/api/v1/physical-samples/worklists/*`.
- Use `DateFilterReusable` for sample report date ranges and match the gradient metric-card structure in `components/Billing/BillingSumamry/BilledSummary.tsx`.
- Every new list page must use backend pagination with `page` and `count`. Keep the selected count stable between pages and return `{ result, error }` from PrimeTable server handlers without state side effects.

### Standard Page Structure

```tsx
"use client";
import { useState, useEffect } from "react";
import { customFetch } from "../../../components/Auth/customFetch";
import Loader from "../../../components/isLoading";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";

export default function PageName() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { applicationsettings } = useApplicationSettings();
  const { user } = applicationsettings;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await customFetch("endpoint?params");
        setData(response);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  if (!data) return <div>No data available</div>;

  return <div className="container-fluid px-4 py-3">{/* Content */}</div>;
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
  if (response?.status === "success" && response?.statusCode === 200) {
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

# Lobnos LIMS - Standard Chart UI Format

## Overview

This document describes the standard UI format for charts in the Lobnos LIMS analytics module. This format ensures consistency across all chart implementations while allowing for varying data structures. The daily sales trend chart serves as the reference implementation.

## General Structure

### Container Layout

All charts use a Bootstrap card structure:

```tsx
<div
  className="card"
  style={{ borderRadius: "0.75rem", borderColor: COLOR_BORDER }}
>
  <div className="card-header">...</div>
  <div className="card-body">...</div>
  <div className="card-footer">...</div>
</div>
```

### Color Scheme

Use consistent color variables:

```tsx
const COLOR_ACCENT = "oklch(0.646 0.222 41.116)"; // Primary chart color
const COLOR_TEXT_MUTED = "var(--bs-secondary-color)";
const COLOR_BORDER = "var(--bs-border-color)";
const COLOR_TOOLTIP_BG = "var(--bs-body-bg)";
const COLOR_TOOLTIP_FG = "var(--bs-body-color)";
const COLOR_GREEN_TEXT = "var(--bs-success)";
const COLOR_RED_TEXT = "var(--bs-danger)";
const COLOR_SECONDARY = "#2563eb"; // Blue
const COLOR_TERTIARY = "#ea580c"; // Orange
const COLOR_EXPENSES = "#dc2626"; // Red
```

## Chart Header Structure

### Layout

```tsx
<div
  className="card-header py-3 px-4"
  style={{
    backgroundColor: "var(--bs-tertiary-bg)",
    borderColor: COLOR_BORDER,
  }}
>
  <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
    <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
      <Icon
        size={22}
        style={{ color: COLOR_ACCENT }}
        className="me-2 flex-shrink-0"
      />
      Chart Title
    </h2>
    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
      {/* Controls */}
    </div>
  </div>
</div>
```

### Chart Type Toggle Buttons

```tsx
<div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
  {viewButtons.map((btn) => (
    <button
      key={btn.type}
      type="button"
      className={`btn ${
        view === btn.type ? "btn-primary active" : "btn-outline-secondary"
      }`}
      onClick={() => handleViewToggle(btn.type)}
      style={
        view === btn.type
          ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }
          : {}
      }
    >
      <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
    </button>
  ))}
</div>
```

### Date Filters

```tsx
<div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
  <div
    className="input-group input-group-sm"
    style={{ flexBasis: "160px", minWidth: "150px" }}
  >
    <span
      className="input-group-text bg-transparent border-end-0"
      style={{ borderColor: COLOR_BORDER }}
    >
      <RiCalendarEventLine size={16} className="text-muted" />
    </span>
    <input
      type="date"
      className="form-control shadow-none border-start-0"
      value={startDate}
      onChange={handleStartDateChange}
    />
  </div>
  <div
    className="input-group input-group-sm"
    style={{ flexBasis: "160px", minWidth: "150px" }}
  >
    <span
      className="input-group-text bg-transparent border-end-0"
      style={{ borderColor: COLOR_BORDER }}
    >
      <RiCalendarEventLine size={16} className="text-muted" />
    </span>
    <input
      type="date"
      className="form-control shadow-none border-start-0"
      value={endDate}
      onChange={handleEndDateChange}
      min={startDate}
    />
  </div>
  <button
    onClick={handleResetFilters}
    className="btn btn-sm btn-outline-secondary d-flex align-items-center"
  >
    <RiRefreshLine size={16} className="me-1" /> Reset
  </button>
</div>
```

## Chart Body Structure

### Loading State

```tsx
<div
  className="d-flex flex-column justify-content-center align-items-center"
  style={{ minHeight: "350px" }}
>
  <RiLoader4Line
    size={48}
    className="animate-spin mb-3"
    style={{ color: COLOR_ACCENT }}
  />
  <p className="text-muted">Loading...</p>
</div>
```

### Error State

```tsx
<div
  className="d-flex flex-column justify-content-center align-items-center text-center"
  style={{ minHeight: "350px" }}
>
  <RiErrorWarningLine size={48} className="mb-3 text-danger" />
  <h5 className="fw-medium mb-1">Error Loading Data</h5>
  <p className="text-muted px-3">{error}</p>
</div>
```

### Empty State

```tsx
<div
  className="d-flex flex-column justify-content-center align-items-center text-center"
  style={{ minHeight: "350px" }}
>
  <RiInbox2Line size={48} className="mb-3 text-muted" />
  <h5 className="fw-medium mb-1">No Data Available</h5>
  <p className="text-muted px-3">No data for the selected period.</p>
</div>
```

### Chart Container

```tsx
<div style={{ width: "100%", height: 350 }}>
  <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
</div>
```

## Chart Implementation (Recharts)

### Common Props

```tsx
const commonProps = {
  data: data,
  margin: { top: 5, right: 5, left: 20, bottom: 45 },
};

const xAxisProps = {
  dataKey: "date",
  tickFormatter: formatDateForDisplay,
  angle: -45,
  textAnchor: "end",
  height: 60,
  interval: "preserveStartEnd",
  tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
  axisLine: { stroke: COLOR_BORDER },
  tickLine: { stroke: COLOR_BORDER },
};

const yAxisProps = {
  tickFormatter: (value: number) => currencyFormatter.format(value),
  tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
  axisLine: false,
  tickLine: false,
  width: 95,
};

const legendProps = {
  verticalAlign: "top",
  align: "right",
  iconType: "circle",
  iconSize: 8,
  wrapperStyle: {
    fontSize: "13px",
    color: "var(--bs-body-color)",
    paddingBottom: "15px",
  },
};
```

### Chart Type Selection Guide

**When to Use Each Chart Type:**

- **Bar Chart**: Best for comparing discrete categories or showing values at specific time points. Use for expense categories, monthly totals, or count-based metrics.

- **Line Chart**: Ideal for showing trends over time, continuous data, or relationships between variables. Perfect for time-series data like daily/hourly trends, growth patterns, or performance metrics over periods.

- **Area Chart**: Excellent for showing cumulative totals, part-to-whole relationships, or emphasizing magnitude of change over time. Great for stacked data or when you want to highlight volume/fill area.

**Analytics-Specific Usage:**

- **Expense Analytics**: Use Line charts for time-based expense trends, Area charts for cumulative spending, Bar charts for category comparisons
- **Sales Analytics**: Line charts for revenue trends, Area charts for market share, Bar charts for product/category performance
- **Operational Analytics**: Line charts for performance metrics over time, Area charts for capacity utilization, Bar charts for comparative analysis

### Line Chart Implementation

```tsx
<LineChart {...commonProps}>
  <CartesianGrid
    strokeDasharray="3 3"
    stroke="var(--bs-border-color-translucent)"
    vertical={false}
  />
  <XAxis {...xAxisProps} />
  <YAxis {...yAxisProps} />
  <Tooltip
    content={<CustomTooltip />}
    cursor={{ fill: "var(--bs-tertiary-bg)" }}
  />
  <Legend {...legendProps} />
  <Line
    type="monotone"
    dataKey="key"
    name="Label"
    stroke={COLOR}
    strokeWidth={2}
    dot={{ r: 3, strokeWidth: 1, fill: COLOR }}
    activeDot={{
      r: 6,
      strokeWidth: 1.5,
      fill: COLOR,
      stroke: COLOR_TOOLTIP_BG,
    }}
  />
</LineChart>
```

**Line Chart Best Practices:**

- Use for time-series data and trend analysis
- Keep lines clean with appropriate stroke width (2px recommended)
- Use dots sparingly - only for important data points
- Consider multiple lines for comparative analysis
- Ensure proper axis scaling for readability

### Bar Chart Implementation

```tsx
<BarChart {...commonProps}>
  <CartesianGrid
    strokeDasharray="3 3"
    stroke="var(--bs-border-color-translucent)"
    vertical={false}
  />
  <XAxis {...xAxisProps} />
  <YAxis {...yAxisProps} />
  <Tooltip
    content={<CustomTooltip />}
    cursor={{ fill: "var(--bs-tertiary-bg)" }}
  />
  <Legend {...legendProps} />
  <Bar
    dataKey="key"
    name="Label"
    fill={COLOR}
    radius={[4, 4, 0, 0]}
    maxBarSize={30}
  />
</BarChart>
```

**Bar Chart Best Practices:**

- Use for categorical comparisons and discrete data
- Limit to 7-10 categories for optimal readability
- Use consistent colors across similar charts
- Consider horizontal bars for long category names
- Set maxBarSize to prevent overly wide bars

### Area Chart Implementation

```tsx
<AreaChart {...commonProps}>
  <defs>
    <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={COLOR} stopOpacity={0.5} />
      <stop offset="95%" stopColor={COLOR} stopOpacity={0.05} />
    </linearGradient>
  </defs>
  <CartesianGrid
    strokeDasharray="3 3"
    stroke="var(--bs-border-color-translucent)"
    vertical={false}
  />
  <XAxis {...xAxisProps} />
  <YAxis {...yAxisProps} />
  <Tooltip
    content={<CustomTooltip />}
    cursor={{ fill: "var(--bs-tertiary-bg)" }}
  />
  <Legend {...legendProps} />
  <Area
    type="monotone"
    dataKey="key"
    name="Label"
    stroke={COLOR}
    fill="url(#colorFill)"
    strokeWidth={2}
    dot={{ r: 3, strokeWidth: 1, fill: COLOR }}
    activeDot={{
      r: 6,
      strokeWidth: 1.5,
      fill: COLOR,
      stroke: COLOR_TOOLTIP_BG,
    }}
  />
</AreaChart>
```

**Area Chart Best Practices:**

- Use for cumulative data and volume visualization
- Perfect for showing trends with emphasis on magnitude
- Use gradient fills to avoid visual clutter
- Consider stacking for part-to-whole relationships
- Ensure adequate opacity to prevent overlap issues
- Great for financial data like revenue accumulation

### Multi-Series Charts

**Multiple Lines/Areas:**

```tsx
<LineChart {...commonProps}>
  <CartesianGrid
    strokeDasharray="3 3"
    stroke="var(--bs-border-color-translucent)"
    vertical={false}
  />
  <XAxis {...xAxisProps} />
  <YAxis {...yAxisProps} />
  <Tooltip content={<CustomTooltip />} />
  <Legend {...legendProps} />
  <Line
    dataKey="series1"
    name="Series 1"
    stroke={COLOR_ACCENT}
    strokeWidth={2}
  />
  <Line
    dataKey="series2"
    name="Series 2"
    stroke={COLOR_SECONDARY}
    strokeWidth={2}
  />
  <Line
    dataKey="series3"
    name="Series 3"
    stroke={COLOR_TERTIARY}
    strokeWidth={2}
  />
</LineChart>
```

**Stacked Areas:**

```tsx
<AreaChart {...commonProps}>
  <CartesianGrid
    strokeDasharray="3 3"
    stroke="var(--bs-border-color-translucent)"
    vertical={false}
  />
  <XAxis {...xAxisProps} />
  <YAxis {...yAxisProps} />
  <Tooltip content={<CustomTooltip />} />
  <Legend {...legendProps} />
  <Area
    type="monotone"
    dataKey="series1"
    stackId="1"
    name="Series 1"
    stroke={COLOR_ACCENT}
    fill={COLOR_ACCENT}
  />
  <Area
    type="monotone"
    dataKey="series2"
    stackId="1"
    name="Series 2"
    stroke={COLOR_SECONDARY}
    fill={COLOR_SECONDARY}
  />
  <Area
    type="monotone"
    dataKey="series3"
    stackId="1"
    name="Series 3"
    stroke={COLOR_TERTIARY}
    fill={COLOR_TERTIARY}
  />
</AreaChart>
```

### Chart Type Toggle Implementation

**Standard Toggle Pattern:**

```tsx
const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");

const viewButtons = [
  { type: "bar" as const, label: "Bar", icon: RiBarChartBoxLine },
  { type: "line" as const, label: "Line", icon: RiLineChartLine },
  { type: "area" as const, label: "Area", icon: RiBubbleChartLine },
];

const renderChart = () => {
  const commonProps = {
    data: chartData,
    margin: { top: 5, right: 5, left: 20, bottom: 45 },
  };
  // ... axis props ...

  if (chartType === "bar") {
    return (
      <BarChart {...commonProps}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--bs-border-color-translucent)"
          vertical={false}
        />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<CustomTooltip />} />
        <Legend {...legendProps} />
        <Bar
          dataKey="value"
          name="Value"
          fill={COLOR_ACCENT}
          radius={[4, 4, 0, 0]}
          maxBarSize={30}
        />
      </BarChart>
    );
  }
  if (chartType === "line") {
    return (
      <LineChart {...commonProps}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--bs-border-color-translucent)"
          vertical={false}
        />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<CustomTooltip />} />
        <Legend {...legendProps} />
        <Line
          type="monotone"
          dataKey="value"
          name="Value"
          stroke={COLOR_ACCENT}
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
          activeDot={{
            r: 6,
            strokeWidth: 1.5,
            fill: COLOR_ACCENT,
            stroke: COLOR_TOOLTIP_BG,
          }}
        />
      </LineChart>
    );
  }
  if (chartType === "area") {
    return (
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
            <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--bs-border-color-translucent)"
          vertical={false}
        />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<CustomTooltip />} />
        <Legend {...legendProps} />
        <Area
          type="monotone"
          dataKey="value"
          name="Value"
          stroke={COLOR_ACCENT}
          fill="url(#colorFill)"
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
          activeDot={{
            r: 6,
            strokeWidth: 1.5,
            fill: COLOR_ACCENT,
            stroke: COLOR_TOOLTIP_BG,
          }}
        />
      </AreaChart>
    );
  }
};
```

## Custom Tooltip

```tsx
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg border p-2 shadow-sm"
        style={{
          backgroundColor: COLOR_TOOLTIP_BG,
          borderColor: COLOR_BORDER,
          minWidth: "220px",
          fontSize: "0.8rem",
        }}
      >
        <div className="mb-2">
          <span
            className="text-xs uppercase fw-medium"
            style={{ color: COLOR_TEXT_MUTED }}
          >
            Date
          </span>
          <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>
            {formatDateForTable(label)}
          </span>
        </div>
        {payload.map((item: any, index: number) => (
          <div key={index} className="mb-1">
            <span
              className="text-xs uppercase fw-medium"
              style={{ color: COLOR_TEXT_MUTED }}
            >
              {item.name}
            </span>
            <span className="fw-bold d-block" style={{ color: item.color }}>
              {currencyFormatter.format(item.value)}
            </span>
          </div>
        ))}
        {/* Additional metrics like change from previous */}
      </div>
    );
  }
  return null;
};
```

## Data Table Structure

### Container

```tsx
<div
  className="card-footer bg-body-tertiary p-3 p-md-4"
  style={{ borderTop: `1px solid ${COLOR_BORDER}` }}
>
  <div className="print-date-range" style={{ display: "none" }}>
    Report Period: {startDate} - {endDate}
  </div>
  <div className="d-flex justify-content-between mb-2">
    <h4 className="fs-6 fw-medium mb-3">Data Table Title</h4>
    <button
      className="btn btn-sm btn-outline-primary"
      onClick={() => window.print()}
    >
      Print
    </button>
  </div>
  <div className="table-responsive">{/* Table */}</div>
</div>
```

### Table Structure

```tsx
<table className="table table-sm table-hover table-striped small printable-table-with-borders">
  <thead className="sticky-top bg-body-tertiary">
    <tr>{/* Column headers */}</tr>
  </thead>
  <tbody>
    {data.map((entry) => (
      <tr key={entry.key}>{/* Data cells */}</tr>
    ))}
    {/* Total row */}
    <tr className="fw-bold border-top">
      <td>Total</td>
      {/* Summed values */}
    </tr>
  </tbody>
</table>
```

### Table Cell Formatting

- Currency values: `{currencyFormatter.format(value)}`
- Date values: `{formatDateForTable(date)}`
- Change indicators: Use arrows and color classes
- Percentage columns: `{percentage.toFixed(1)}%`

## Print Functionality

### Print Button

```tsx
<button
  className="btn btn-sm btn-outline-primary"
  onClick={() => window.print()}
>
  Print
</button>
```

### Print Styles

```css
@media print {
  .printable-table-with-borders tbody tr {
    border: none !important;
    border-bottom: 2px solid #000 !important;
  }
  .printable-table-with-borders tbody tr:nth-child(odd) {
    background-color: #f8f9fa !important;
  }
  .printable-table-with-borders th:nth-child(n),
  .printable-table-with-borders td:nth-child(n) {
    display: none !important; /* Hide specific columns */
  }
  .printable-table-with-borders th,
  .printable-table-with-borders td {
    padding: 0.25rem 0.5rem !important;
  }
}
```

### Hidden Print Elements

```tsx
<div className="print-date-range" style={{ display: "none" }}>
  Report Period: {formattedDateRange}
</div>
```

## Data Processing Patterns

### Date Formatting

```tsx
const formatDateForDisplay = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const formatDateForTable = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};
```

### Change Calculation

```tsx
for (let i = 1; i < data.length; i++) {
  const current = data[i].metric;
  const previous = data[i - 1].metric;
  data[i].changeFromPrevious = current - previous;
}
```

### Percentage Calculation

```tsx
const total = data.reduce(
  (sum, entry) => (entry.metric > 0 ? sum + entry.metric : sum),
  0
);
const percentage =
  entry.metric > 0 && total > 0
    ? ((entry.metric / total) * 100).toFixed(1)
    : "0.0";
```

## Responsive Design

### Mobile Breakpoints

- `flex-column flex-lg-row`: Stack vertically on mobile, horizontal on large screens
- `flex-column flex-sm-row`: Stack vertically on small screens, horizontal on small+
- `mb-3 mb-lg-0`: Margin bottom on mobile, none on large screens
- `mt-2 mt-sm-0`: Margin top on mobile, none on small+

### Table Responsiveness

- `table-responsive`: Horizontal scroll on small screens
- `sticky-top`: Header stays visible while scrolling

## Animation and Loading

### Spin Animation

```css
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

tables must be text-start aligned for readability.

## Implementation Checklist

- [ ] Card container with proper border radius and colors
- [ ] Header with title, icon, and controls
- [ ] Chart type toggle buttons (Line/Bar/Area)
- [ ] Date range filters with icons
- [ ] Reset filters button
- [ ] Loading, error, and empty states
- [ ] ResponsiveContainer with proper height
- [ ] Custom tooltip with formatted values
- [ ] Data table with sticky header
- [ ] Print functionality with custom styles
- [ ] Responsive design for mobile
- [ ] Currency formatting using currencyFormatter
- [ ] Date formatting functions
- [ ] Change and percentage calculations</content>
      <parameter name="filePath">chart-ui-standard.md
