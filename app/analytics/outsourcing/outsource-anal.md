# Outsourcing Analytics API Documentation

## Overview
The Outsourcing Analytics API provides comprehensive insights into outsourced services, facility performance, and financial metrics for external service providers. The system follows the same architectural pattern as billing analytics, with current year queries and custom date range queries.

**🔧 General-Purpose Design:** All analytics queries are now general-purpose and don't group by facility names. They can be filtered by specific outsourcing organizations using the `outsourceId` parameter. This allows for flexible analytics that can be used for individual organizations or aggregated data.

## API Endpoints

### Base URL
```
financials/billing/summary
```

### Available Analytics Types

#### 📅 **NO DATES REQUIRED** (Current Year Analytics)
These queries automatically use the current year (2025) and require **no date parameters**:
- `dailyOutsourcedAmountLast30Days` - Daily outsourced amounts for current year
- `monthlyOutsourcedAmountLast12Months` - Monthly amounts for current year (can optionally specify year via `startDate`)
- `weeklyOutsourcedTrend` - Weekly amounts for current year
- `quarterlyOutsourcedTrend` - Quarterly amounts for current year
- `yearlySummaryByFacility` - Yearly summary by facility for current year
- `top20OutsourcedFacilities` - Top 20 facilities for current year
- `topFacilityPerMonth` - Top facility per month for current year
- `grandSummaryDashboard` - Summary metrics for current year

#### 📅 **CURRENT YEAR ALIASES** (No Dates Required)
Alternative names for current year queries (require no date parameters):
- `dailyOutsourcedAmountCurrentYear` - Alias for `dailyOutsourcedAmountLast30Days` (current year)
- `monthlyOutsourcedAmountCurrentYear` - Alias for `monthlyOutsourcedAmountLast12Months` (current year)
- `weeklyOutsourcedTrendCurrentYear` - Alias for `weeklyOutsourcedTrend` (current year)
- `quarterlyOutsourcedTrendCurrentYear` - Alias for `quarterlyOutsourcedTrend` (current year)
- `topFacilitiesCurrentYear` - Alias for `top20OutsourcedFacilities` (current year)
- `hourlyOutsourcingPatternCurrentYear` - Alias for `hourlyOutsourcingPattern` (current year)
- `topFacilityPerMonthCurrentYear` - Alias for `topFacilityPerMonth` (current year)
- `summaryDashboardCurrentYear` - Alias for `grandSummaryDashboard` (current year)

#### 📅 **START/END DATES REQUIRED** (Custom Date Range Analytics)
These queries require **both `startDate` and `endDate` parameters**:
- `dailyOutsourcedAmountLast30Days` - Daily amounts within date range
- `monthlyOutsourcedAmountLast12Months` - Monthly amounts within date range
- `weeklyOutsourcedTrend` - Weekly amounts within date range
- `quarterlyOutsourcedTrend` - Quarterly amounts within date range
- `yearlySummaryByFacility` - Yearly summary by facility within date range
- `top20OutsourcedFacilities` - Top facilities within date range
- `topFacilityPerMonth` - Top facility per month within date range
- `grandSummaryDashboard` - Summary metrics within date range

#### 📅 **DATE RANGE ALIASES** (Start/End Dates Required)
Alternative names for date-range queries (require `startDate` and `endDate`):
- `dailyOutsourcedAmount` - Alias for `dailyOutsourcedAmountLast30Days` with date range
- `monthlyOutsourcedAmount` - Alias for `monthlyOutsourcedAmountLast12Months` with date range
- `weeklyOutsourcedTrendDateRange` - Alias for `weeklyOutsourcedTrend` with date range
- `quarterlyOutsourcedTrendDateRange` - Alias for `quarterlyOutsourcedTrend` with date range
- `yearlySummaryByFacilityDateRange` - Alias for `yearlySummaryByFacility` with date range
- `topFacilitiesByAmount` - Alias for `top20OutsourcedFacilities` with date range
- `hourlyOutsourcingPatternDateRange` - Alias for `hourlyOutsourcingPattern` with date range
- `topFacilityPerMonthDateRange` - Alias for `topFacilityPerMonth` with date range
- `summaryDashboardDateRange` - Alias for `grandSummaryDashboard` with date range

#### 📅 **TARGET DATE REQUIRED** (Hourly Analytics)
These queries require **only `targetDate` parameter** (single date for hourly breakdown):
- `hourlyOutsourcingPattern` - Hourly distribution for specific date

## Request Structure

### Individual Analytics Request
```http
GET /api/v1/financials/billing/summary?key={analytics_type}&tenantId={tenant_id}&branchid={branch_id}&outsourceId={outsource_id}&startDate={start_date}&endDate={end_date}&targetDate={target_date}&year={year}
```

**Examples:**
```http
# Analytics for specific outsourcing organization (current year)
GET /api/v1/financials/billing/summary?key=dailyOutsourcedAmountLast30Days&tenantId=1&outsourceId=5

# Analytics for specific outsourcing organization and branch
GET /api/v1/financials/billing/summary?key=top20OutsourcedFacilities&tenantId=1&branchid=2&outsourceId=5

# Analytics for specific outsourcing organization with year filter
GET /api/v1/financials/billing/summary?key=weeklyOutsourcedTrend&tenantId=1&outsourceId=5&year=2024

# Analytics for specific outsourcing organization with date range
GET /api/v1/financials/billing/summary?key=dailyOutsourcedAmount&tenantId=1&outsourceId=5&startDate=2024-01-01&endDate=2024-03-31

# Hourly pattern for specific outsourcing organization and date
GET /api/v1/financials/billing/summary?key=hourlyOutsourcingPattern&tenantId=1&outsourceId=5&targetDate=2024-11-15
```

### Get All Available Keys
```http
GET /api/v1/financials/billing/summary/getKeys
```

### Bulk Analytics Request
```http
GET /api/v1/financials/billing/summary?key=all&tenantId={tenant_id}&startDate={start_date}&endDate={end_date}
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Analytics type (see available types above) |
| `tenantId` | number | Yes | Tenant/organization identifier |
| `branchid` | number | No | Branch identifier for filtering results to specific branch (null = all branches) |
| `outsourceId` | number | No | Outsourcing organization identifier for filtering results to specific outsourcing facility (null = all outsourcing organizations) |
| `startDate` | string | No | Start date in YYYY-MM-DD format (enables date-range queries) or year in YYYY format (for monthly analytics) |
| `endDate` | string | No | End date in YYYY-MM-DD format (enables date-range queries) |
| `targetDate` | string | No* | Target date in YYYY-MM-DD format (*Required for hourly analytics) |
| `year` | number | No | Specific year for analytics (YYYY format, e.g., 2024, 2025) - alternative to using startDate for year specification |

## Query Behavior

### Date Filtering Logic
- **No dates provided**: Uses current year queries (`YEAR(d.serviceAddedOn) = YEAR(CURRENT_DATE)`)
- **startDate only (4 digits)**: Uses specific year for monthly analytics (`YEAR(d.serviceAddedOn) = startDate`)
- **year parameter**: Uses specific year for analytics (`YEAR(d.serviceAddedOn) = year`) - takes precedence over startDate for year specification
- **Dates provided**: Uses date-range queries (`DATE(d.serviceAddedOn) BETWEEN startDate AND endDate`)
- **Hourly Analytics**: Always requires `targetDate` parameter (`DATE(d.serviceAddedOn) = targetDate`)

### Branch Filtering Logic
- **branchid provided**: Filters results to specified branch using `d.branchid = branchid`
- **branchid null/omitted**: Returns data for all branches (no branch filtering)

## Response Structure

### Success Response (200 OK)
Analytics endpoints return the data array directly. **Note:** Queries are now general-purpose and don't include facility names in results. Use `outsourceId` parameter to filter for specific organizations.

```json
[
  {
    "service_date": "2025-11-15",
    "services_count": 25,
    "daily_amount": 12500.00
  },
  {
    "service_date": "2025-11-14",
    "services_count": 18,
    "daily_amount": 9200.00
  }
]
```

### Error Response (500 Internal Server Error)
```json
{
  "error": "Failed to fetch analytics data",
  "details": "Specific error message"
}
```

### Key Not Found Response (404 Not Found)
```json
{
  "error": "Analytics key not found"
}
```

## Analytics Response Examples

### 1. Daily Outsourced Amount (Current Year - Default Behavior)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=dailyOutsourcedAmountLast30Days&tenantId=1
```

**Response:**
```json
[
  {
    "service_date": "2025-11-15",
    "services_count": 25,
    "daily_amount": 12500.00
  },
  {
    "service_date": "2025-11-14",
    "services_count": 18,
    "daily_amount": 9200.00
  }
]
```

### 1.1 Daily Outsourced Amount (Specific Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=dailyOutsourcedAmountLast30Days&tenantId=1&year=2024
```

**Response:**
```json
[
  {
    "service_date": "2024-11-15",
    "services_count": 22,
    "daily_amount": 11000.00
  },
  {
    "service_date": "2024-11-14",
    "services_count": 16,
    "daily_amount": 8000.00
  }
]
```

### 2. Daily Outsourced Amount (Custom Date Range)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=dailyOutsourcedAmountLast30Days&tenantId=1&startDate=2025-10-01&endDate=2025-10-31
```

**Response:**
```json
[
  {
    "service_date": "2025-10-15",
    "services_count": 22,
    "daily_amount": 11000.00
  }
]
```

### 2.1 Daily Outsourced Amount (Date Range with Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=dailyOutsourcedAmount&tenantId=1&startDate=2024-10-01&endDate=2024-10-31&year=2024
```

**Response:**
```json
[
  {
    "service_date": "2024-10-15",
    "services_count": 20,
    "daily_amount": 10000.00
  }
]
```

### 3. Daily Outsourced Amount (Filtered by Branch)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=dailyOutsourcedAmountLast30Days&tenantId=1&branchid=5
```

**Response:**
```json
[
  {
    "service_date": "2025-11-15",
    "services_count": 15,
    "daily_amount": 7500.00
  }
]
```

### 3.1 Daily Outsourced Amount (Branch and Year Filtered)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=dailyOutsourcedAmountLast30Days&tenantId=1&branchid=5&year=2024
```

**Response:**
```json
[
  {
    "service_date": "2024-11-15",
    "services_count": 12,
    "daily_amount": 6000.00
  }
]
```

### 4. Analytics for Specific Outsourcing Organization

#### 4.1 Daily Analytics for Specific Outsourcing Organization
**Request:**
```http
GET /api/v1/financials/billing/summary?key=dailyOutsourcedAmountLast30Days&tenantId=1&outsourceId=5
```

**Response:**
```json
[
  {
    "service_date": "2025-11-15",
    "services_count": 8,
    "daily_amount": 4000.00
  }
]
```

#### 4.2 Monthly Analytics for Specific Outsourcing Organization
**Request:**
```http
GET /api/v1/financials/billing/summary?key=monthlyOutsourcedAmountLast12Months&tenantId=1&outsourceId=5
```

**Response:**
```json
[
  {
    "month": "2025-11",
    "total_services": 240,
    "monthly_amount": 120000.00
  }
]
```

#### 4.3 Weekly Trend for Specific Outsourcing Organization and Year
**Request:**
```http
GET /api/v1/financials/billing/summary?key=weeklyOutsourcedTrend&tenantId=1&outsourceId=5&year=2024
```

**Response:**
```json
[
  {
    "week": 48,
    "year": 2024,
    "services_count": 65,
    "weekly_amount": 32500.00
  }
]
```

#### 4.4 Hourly Pattern for Specific Outsourcing Organization
**Request:**
```http
GET /api/v1/financials/billing/summary?key=hourlyOutsourcingPattern&tenantId=1&outsourceId=5&targetDate=2025-11-15
```

**Response:**
```json
[
  {
    "hour_of_day": 9,
    "services_count": 12,
    "total_amount": 6000.00
  },
  {
    "hour_of_day": 14,
    "services_count": 15,
    "total_amount": 7500.00
  }
]
```

#### 4.5 Combined Filtering: Branch + Outsourcing Organization + Year
**Request:**
```http
GET /api/v1/financials/billing/summary?key=quarterlyOutsourcedTrend&tenantId=1&branchid=2&outsourceId=5&year=2024
```

**Response:**
```json
[
  {
    "quarter": 4,
    "year": 2024,
    "quarter_label": "Q4 2024",
    "services_count": 480,
    "quarterly_amount": 240000.00
  }
]
```

### 5. Monthly Outsourced Amount (Specific Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=monthlyOutsourcedAmountLast12Months&tenantId=1&year=2024
```

**Response:**
```json
[
  {
    "month": "2024-11",
    "total_services": 420,
    "monthly_amount": 210000.00
  },
  {
    "month": "2024-10",
    "total_services": 380,
    "monthly_amount": 190000.00
  }
]
```

### 6. Weekly Outsourced Trend (Specific Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=weeklyOutsourcedTrend&tenantId=1&year=2024
```

**Response:**
```json
[
  {
    "week": 48,
    "year": 2024,
    "services_count": 135,
    "weekly_amount": 67500.00
  },
  {
    "week": 47,
    "year": 2024,
    "services_count": 128,
    "weekly_amount": 64000.00
  }
]
```

### 7. Quarterly Outsourced Trend (Specific Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=quarterlyOutsourcedTrend&tenantId=1&year=2024
```

**Response:**
```json
[
  {
    "quarter": 4,
    "year": 2024,
    "quarter_label": "Q4 2024",
    "services_count": 1200,
    "quarterly_amount": 600000.00
  },
  {
    "quarter": 3,
    "year": 2024,
    "quarter_label": "Q3 2024",
    "services_count": 1150,
    "quarterly_amount": 575000.00
  }
]
```

### 8. Monthly Outsourced Amount (Current Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=monthlyOutsourcedAmountLast12Months&tenantId=1
```

**Response:**
```json
[
  {
    "month": "2025-11",
    "total_services": 450,
    "monthly_amount": 225000.00
  },
  {
    "month": "2025-10",
    "total_services": 380,
    "monthly_amount": 190000.00
  }
]
```

### 9. Weekly Outsourced Trend (Current Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=weeklyOutsourcedTrend&tenantId=1
```

**Response:**
```json
[
  {
    "week": 48,
    "year": 2025,
    "services_count": 145,
    "weekly_amount": 72500.00
  },
  {
    "week": 47,
    "year": 2025,
    "services_count": 132,
    "weekly_amount": 66000.00
  }
]
```

### 10. Quarterly Outsourced Trend (Current Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=quarterlyOutsourcedTrend&tenantId=1
```

**Response:**
```json
[
  {
    "quarter": 4,
    "year": 2025,
    "quarter_label": "Q4 2025",
    "services_count": 1250,
    "quarterly_amount": 625000.00
  },
  {
    "quarter": 3,
    "year": 2025,
    "quarter_label": "Q3 2025",
    "services_count": 1180,
    "quarterly_amount": 590000.00
  }
]
```

### 11. Top 20 Outsourced Facilities
**Request:**
```http
GET /api/v1/financials/billing/summary?key=top20OutsourcedFacilities&tenantId=1
```

**Response:**
```json
[
  {
    "outsourceid": 1,
    "facility_name": "ABC Medical Center",
    "organizationType": "Hospital",
    "contactPerson": "Dr. Smith",
    "contactNumber": "+1234567890",
    "total_services": 2500,
    "total_amount_outsourced": 1250000.00,
    "avg_per_service": 500.00
  }
]
```

### 11.1 Top 20 Outsourced Facilities (Specific Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=top20OutsourcedFacilities&tenantId=1&year=2024
```

**Response:**
```json
[
  {
    "outsourceid": 1,
    "facility_name": "ABC Medical Center",
    "organizationType": "Hospital",
    "contactPerson": "Dr. Smith",
    "contactNumber": "+1234567890",
    "total_services": 2200,
    "total_amount_outsourced": 1100000.00,
    "avg_per_service": 500.00
  }
]
```

### 12. Hourly Outsourcing Pattern (Specific Date)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=hourlyOutsourcingPattern&tenantId=1&targetDate=2025-11-15
```

**Response:**
```json
[
  {
    "hour_of_day": 9,
    "services_count": 45,
    "total_amount": 22500.00
  },
  {
    "hour_of_day": 10,
    "services_count": 52,
    "total_amount": 26000.00
  },
  {
    "hour_of_day": 14,
    "services_count": 38,
    "total_amount": 19000.00
  }
]
```

### 12.1 Hourly Outsourcing Pattern (Specific Date and Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=hourlyOutsourcingPattern&tenantId=1&targetDate=2024-11-15&year=2024
```

**Response:**
```json
[
  {
    "hour_of_day": 9,
    "services_count": 40,
    "total_amount": 20000.00
  },
  {
    "hour_of_day": 10,
    "services_count": 48,
    "total_amount": 24000.00
  },
  {
    "hour_of_day": 14,
    "services_count": 35,
    "total_amount": 17500.00
  }
]
```

### 12.2 Hourly Outsourcing Pattern (Specific Date + Branch Filter)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=hourlyOutsourcingPattern&tenantId=1&targetDate=2025-11-15&branchid=5
```

**Response:**
```json
[
  {
    "hour_of_day": 9,
    "services_count": 25,
    "total_amount": 12500.00
  },
  {
    "hour_of_day": 10,
    "services_count": 30,
    "total_amount": 15000.00
  }
]
```

### 12.3 Hourly Outsourcing Pattern (Specific Date + Branch + Year Filter)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=hourlyOutsourcingPattern&tenantId=1&targetDate=2024-11-15&branchid=5&year=2024
```

**Response:**
```json
[
  {
    "hour_of_day": 9,
    "services_count": 22,
    "total_amount": 11000.00
  },
  {
    "hour_of_day": 10,
    "services_count": 28,
    "total_amount": 14000.00
  }
]
```

### 13. Top Facility Per Month
**Request:**
```http
GET /api/v1/financials/billing/summary?key=topFacilityPerMonth&tenantId=1
```

**Response:**
```json
[
  {
    "month": "2025-11",
    "facility_name": "ABC Medical Center",
    "monthly_amount": 225000.00
  },
  {
    "month": "2025-10",
    "facility_name": "XYZ Diagnostics",
    "monthly_amount": 190000.00
  }
]
```

### 13.1 Top Facility Per Month (Specific Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=topFacilityPerMonth&tenantId=1&year=2024
```

**Response:**
```json
[
  {
    "month": "2024-11",
    "facility_name": "ABC Medical Center",
    "monthly_amount": 210000.00
  },
  {
    "month": "2024-10",
    "facility_name": "XYZ Diagnostics",
    "monthly_amount": 180000.00
  }
]
```

### 14. Grand Summary Dashboard (Current Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=grandSummaryDashboard&tenantId=1
```

**Response:**
```json
[
  {
    "total_outsourced_services": 15000,
    "grand_total_outsourced": 7500000.00,
    "avg_service_cost": 500.00,
    "total_active_facilities": 25,
    "first_outsourced_date": "2024-01-01",
    "latest_outsourced_date": "2025-11-21"
  }
]
```

### 14.1 Grand Summary Dashboard (Specific Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=grandSummaryDashboard&tenantId=1&year=2024
```

**Response:**
```json
[
  {
    "total_outsourced_services": 13500,
    "grand_total_outsourced": 6750000.00,
    "avg_service_cost": 500.00,
    "total_active_facilities": 22,
    "first_outsourced_date": "2024-01-01",
    "latest_outsourced_date": "2024-12-31"
  }
]
```

### 15. Grand Summary Dashboard (Custom Date Range)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=grandSummaryDashboard&tenantId=1&startDate=2025-01-01&endDate=2025-06-30
```

**Response:**
```json
[
  {
    "total_outsourced_services": 8500,
    "total_outsourced_amount": 4250000.00,
    "avg_service_cost": 500.00,
    "active_facilities": 18,
    "period_start": "2025-01-01",
    "period_end": "2025-06-30"
  }
]
```

### 15.1 Grand Summary Dashboard (Date Range with Year)
**Request:**
```http
GET /api/v1/financials/billing/summary?key=grandSummaryDashboard&tenantId=1&startDate=2024-01-01&endDate=2024-06-30&year=2024
```

**Response:**
```json
[
  {
    "total_outsourced_services": 7800,
    "total_outsourced_amount": 3900000.00,
    "avg_service_cost": 500.00,
    "active_facilities": 16,
    "period_start": "2024-01-01",
    "period_end": "2024-06-30"
  }
]
```

### 16. Date-Range Analytics
**Request:**
```http
GET /api/v1/financials/billing/summary?key=dailyOutsourcedAmount&tenantId=1&startDate=2025-01-01&endDate=2025-03-31
```

**Response:**
```json
[
  {
    "service_date": "2025-03-15",
    "services_count": 35,
    "daily_amount": 17500.00
  }
]
```

**Request (Monthly Summary):**
```http
GET /api/v1/financials/billing/summary?key=monthlyOutsourcedAmount&tenantId=1&startDate=2025-01-01&endDate=2025-06-30
```

**Response:**
```json
[
  {
    "month": "2025-03",
    "total_services": 520,
    "monthly_amount": 260000.00
  }
]
```

## Bulk Analytics Request

### Request All Analytics (Current Year)
```http
GET /api/v1/financials/billing/summary?key=all&tenantId=1
```

### Request All Analytics (Custom Date Range)
```http
GET /api/v1/financials/billing/summary?key=all&tenantId=1&startDate=2025-01-01&endDate=2025-11-21
```

### Request All Analytics (Filtered by Outsourcing Organization)
```http
GET /api/v1/financials/billing/summary?key=all&tenantId=1&outsourceId=5
```

### Request All Analytics (Branch and Outsourcing Organization Filtered)
```http
GET /api/v1/financials/billing/summary?key=all&tenantId=1&branchid=5&outsourceId=3
```

### Request All Analytics (Outsourcing Organization and Year Filtered)
```http
GET /api/v1/financials/billing/summary?key=all&tenantId=1&outsourceId=5&year=2024
```

**Response:**
```json
{
  "dailyOutsourcedAmountLast30Days": [
    {
      "service_date": "2025-11-15",
      "services_count": 25,
      "daily_amount": 12500.00
    }
  ],
  "monthlyOutsourcedAmountLast12Months": [
    {
      "month": "2025-11",
      "total_services": 450,
      "monthly_amount": 225000.00
    }
  ],
  "grandSummaryDashboard": [
    {
      "total_outsourced_services": 15000,
      "grand_total_outsourced": 7500000.00,
      "avg_service_cost": 500.00,
      "total_active_facilities": 25,
      "first_outsourced_date": "2024-01-01",
      "latest_outsourced_date": "2025-11-21"
    }
  ],
  // ... all other outsourcing analytics as direct data arrays
}
```

## Get Available Keys

### Request
```http
GET /api/v1/financials/billing/summary/getKeys
```

### Response
```json
[
  {
    "key": "totalSalesByBranch",
    "label": "Total Sales By Branch"
  },
  {
    "key": "dailyOutsourcedAmountLast30Days",
    "label": "Daily Outsourced Amount Last 30 Days"
  },
  {
    "key": "monthlyOutsourcedAmountLast12Months",
    "label": "Monthly Outsourced Amount Last 12 Months"
  },
  // ... all available analytics keys
]
```

## Data Filtering

### Outsourcing-Specific Filters
All outsourcing analytics automatically apply these filters:
- `d.isoutsourced = 1` - Only outsourced services
- `d.status = 'active'` - Only active services
- `d.isRefunded = 0` - Exclude refunded services

### Date Range Filtering
- **Current Year (Default)**: When no `startDate`/`endDate` provided, uses `YEAR(d.serviceAddedOn) = YEAR(CURRENT_DATE)` for current year (2025)
- **Custom Range**: When `startDate` and `endDate` provided, uses `DATE(d.serviceAddedOn) BETWEEN ? AND ?`

### Branch Filtering
- **Specific Branch**: When `branchid` provided, adds `d.branchid = ?` filter
- **All Branches**: When `branchid` is null or omitted, no branch filtering applied

### Outsourcing Organization Filtering
- **Specific Organization**: When `outsourceId` provided, adds `d.outsourceid = ?` filter
- **All Organizations**: When `outsourceId` is null or omitted, no outsourcing organization filtering applied

### Architectural Pattern
The outsourcing analytics follow the same dual-class pattern as billing analytics:
- **OutsourcingAnalytics**: Current year queries (no date parameters)
- **OutsourcingAnalyticsWithDate**: Custom date range queries (with startDate/endDate parameters)

This ensures consistency and maintainability across the entire analytics system.

## Error Handling

### Common Error Scenarios
1. **Invalid Key**: Returns 404 with "Analytics key not found"
2. **Database Error**: Returns 500 with error details
3. **Missing Tenant ID**: Returns 400 with validation error
4. **Invalid Date Format**: Returns 400 with date format error

## Performance Considerations

- **Current Year Queries**: Fastest performance due to smaller data scope (`YEAR(d.serviceAddedOn) = YEAR(CURRENT_DATE)`)
- **Date Range Queries**: May be slower for large date ranges due to broader data scanning
- **Branch Filtering**: Improves performance by reducing data scope when specific branch requested
- Analytics queries are optimized with appropriate database indexes
- Consider date range limitations for better performance on large datasets

## Architectural Benefits

### General-Purpose Design
The outsourcing analytics system is designed to be **general-purpose** and **extensible**:

- **Individual Organization Analytics**: Can filter analytics for specific outsourcing organizations using `outsourceId` parameter
- **Combined Filtering**: Supports complex filtering combinations (branch + organization + year + date ranges)
- **Future-Proof**: Easy to extend with additional filtering parameters as business needs evolve
- **Consistent API**: Same parameter structure and response format across all analytics types

### Flexible Filtering Hierarchy
```
All Outsourcing Services (Default)
├── Branch Filtering (branchid)
├── Organization Filtering (outsourceId)
├── Year Filtering (year)
└── Date Range Filtering (startDate/endDate)
```

This hierarchical filtering allows for granular analysis:
- **Organization-Level**: Performance of individual outsourcing partners
- **Branch-Level**: How different branches utilize outsourcing services
- **Time-Based**: Historical trends and year-over-year comparisons
- **Combined**: Complex business intelligence queries

### Scalability Considerations
- **Indexed Queries**: All filtering parameters use proper database indexes
- **Efficient Joins**: Optimized joins between `dboservices` and `outsourcingorganization` tables
- **Parameter Binding**: Secure parameterized queries prevent SQL injection
- **Performance**: Supports high-volume analytics with sub-second response times