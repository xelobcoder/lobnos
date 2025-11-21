# Expense Analytics API Documentation

## Overview

The Expense Analytics API provides comprehensive expense analysis capabilities for the Lobnos Professional Version. It includes time-based analytics (daily, weekly, monthly, quarterly, yearly), top performer rankings, and comparative analysis.

## Base URL
```
/api/v1/expenses-analytics
```

## Common Parameters

All endpoints require the following query parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branchid` | number | Yes | Branch identifier |
| `tenantId` | number | Yes | Tenant identifier |

## Endpoints

### 1. Daily Expense Analytics

**Endpoint:** `GET /api/v1/expenses-analytics/daily`

**Description:** Get expense analytics for a specific date.

**Parameters:**
- `targetDate` (string, required): Date in YYYY-MM-DD format

**Response Structure:**
```json
[
  {
    "expense_date": "2025-11-21",
    "total_expenses": 15,
    "total_amount": 2500.50,
    "average_amount": 166.70,
    "min_amount": 25.00,
    "max_amount": 500.00,
    "unique_categories": 8,
    "unique_employees": 12,
    "branch_name": "Main Branch"
  }
]
```

### 2. Weekly Expense Analytics

**Endpoint:** `GET /api/v1/expenses-analytics/weekly`

**Description:** Get expense analytics aggregated by weeks within a date range.

**Parameters:**
- `startDate` (string, optional): Start date in YYYY-MM-DD format
- `endDate` (string, optional): End date in YYYY-MM-DD format

**Response Structure:**
```json
[
  {
    "year": 2025,
    "week_number": 47,
    "week_start": "2025-11-17",
    "week_end": "2025-11-23",
    "total_expenses": 45,
    "total_amount": 7500.25,
    "average_amount": 166.67,
    "unique_categories": 12,
    "unique_employees": 18,
    "branch_name": "Main Branch"
  }
]
```

### 3. Monthly Expense Analytics

**Endpoint:** `GET /api/v1/expenses-analytics/monthly`

**Description:** Get expense analytics aggregated by months within a date range.

**Parameters:**
- `startDate` (string, optional): Start date in YYYY-MM-DD format
- `endDate` (string, optional): End date in YYYY-MM-DD format

**Response Structure:**
```json
[
  {
    "year": 2025,
    "month": 11,
    "month_year": "November 2025",
    "total_expenses": 180,
    "total_amount": 30000.75,
    "average_amount": 166.67,
    "min_amount": 10.00,
    "max_amount": 1000.00,
    "unique_categories": 15,
    "unique_employees": 25,
    "unique_merchants": 20,
    "branch_name": "Main Branch"
  }
]
```

### 4. Quarterly Expense Analytics

**Endpoint:** `GET /api/v1/expenses-analytics/quarterly`

**Description:** Get expense analytics aggregated by quarters within a date range.

**Parameters:**
- `startDate` (string, optional): Start date in YYYY-MM-DD format
- `endDate` (string, optional): End date in YYYY-MM-DD format

**Response Structure:**
```json
[
  {
    "year": 2025,
    "quarter": 4,
    "quarter_year": "Q4 2025",
    "total_expenses": 540,
    "total_amount": 90000.00,
    "average_amount": 166.67,
    "min_amount": 5.00,
    "max_amount": 2000.00,
    "unique_categories": 18,
    "unique_employees": 30,
    "branch_name": "Main Branch"
  }
]
```

### 5. Yearly Expense Analytics

**Endpoint:** `GET /api/v1/expenses-analytics/yearly`

**Description:** Get expense analytics aggregated by years.

**Parameters:**
- `startYear` (number, optional): Start year (defaults to current year - 1)
- `endYear` (number, optional): End year (defaults to current year)

**Response Structure:**
```json
[
  {
    "year": 2025,
    "total_expenses": 2160,
    "total_amount": 360000.00,
    "average_amount": 166.67,
    "min_amount": 1.00,
    "max_amount": 5000.00,
    "unique_categories": 20,
    "unique_employees": 35,
    "unique_merchants": 40,
    "active_months": 12,
    "branch_name": "Main Branch"
  }
]
```

### 6. Top Expense Categories

**Endpoint:** `GET /api/v1/expenses-analytics/top-categories`

**Description:** Get top expense categories by total amount spent.

**Parameters:**
- `startDate` (string, optional): Start date in YYYY-MM-DD format
- `endDate` (string, optional): End date in YYYY-MM-DD format
- `limitCount` (number, optional): Number of results to return (default: 10)

**Response Structure:**
```json
[
  {
    "category_name": "Office Supplies",
    "expense_count": 45,
    "total_amount": 12500.00,
    "average_amount": 277.78,
    "min_amount": 50.00,
    "max_amount": 800.00,
    "branch_name": "Main Branch"
  }
]
```

### 7. Top Expense Merchants

**Endpoint:** `GET /api/v1/expenses-analytics/top-merchants`

**Description:** Get top merchants by total expense amount.

**Parameters:**
- `startDate` (string, optional): Start date in YYYY-MM-DD format
- `endDate` (string, optional): End date in YYYY-MM-DD format
- `limitCount` (number, optional): Number of results to return (default: 10)

**Response Structure:**
```json
[
  {
    "merchant_name": "Amazon",
    "expense_count": 32,
    "total_amount": 8750.50,
    "average_amount": 273.45,
    "min_amount": 25.00,
    "max_amount": 1200.00,
    "branch_name": "Main Branch"
  }
]
```

### 8. Top Expense Employees

**Endpoint:** `GET /api/v1/expenses-analytics/top-employees`

**Description:** Get employees with highest expense amounts.

**Parameters:**
- `startDate` (string, optional): Start date in YYYY-MM-DD format
- `endDate` (string, optional): End date in YYYY-MM-DD format
- `limitCount` (number, optional): Number of results to return (default: 10)

**Response Structure:**
```json
[
  {
    "employee_name": "John Doe",
    "employeeid": 123,
    "expense_count": 28,
    "total_amount": 6500.00,
    "average_amount": 232.14,
    "min_amount": 15.00,
    "max_amount": 950.00,
    "branch_name": "Main Branch"
  }
]
```

### 9. Expense Trends by Category

**Endpoint:** `GET /api/v1/expenses-analytics/trends-by-category`

**Description:** Get expense trends for specific categories over time (monthly aggregation).

**Parameters:**
- `startDate` (string, optional): Start date in YYYY-MM-DD format
- `endDate` (string, optional): End date in YYYY-MM-DD format
- `categoryId` (number, optional): Specific category ID to filter by

**Response Structure:**
```json
[
  {
    "month_year": "2025-11",
    "year": 2025,
    "month": 11,
    "expense_count": 45,
    "total_amount": 7500.25,
    "average_amount": 166.67,
    "category_name": "Office Supplies",
    "branch_name": "Main Branch"
  }
]
```

### 10. Expense Comparison by Period

**Endpoint:** `GET /api/v1/expenses-analytics/comparison-by-period`

**Description:** Compare expense metrics between two time periods.

**Parameters:**
- `currentStartDate` (string, required): Start date for current period
- `currentEndDate` (string, required): End date for current period
- `previousStartDate` (string, required): Start date for previous period
- `previousEndDate` (string, required): End date for previous period

**Response Structure:**
```json
[
  {
    "period_type": "current_period",
    "expense_count": 180,
    "total_amount": 30000.75,
    "average_amount": 166.67,
    "min_amount": 10.00,
    "max_amount": 1000.00,
    "branch_name": "Main Branch"
  },
  {
    "period_type": "previous_period",
    "expense_count": 165,
    "total_amount": 27500.50,
    "average_amount": 166.67,
    "min_amount": 8.00,
    "max_amount": 950.00,
    "branch_name": "Main Branch"
  }
]
```

## Error Responses

All endpoints return standard HTTP status codes:

- `200`: Success
- `400`: Bad Request (missing required parameters)
- `500`: Internal Server Error

Error response format:
```json
{
  "error": "Error message description"
}
```

## Example Requests

### Daily Analytics
```
GET /api/v1/expenses-analytics/daily?branchid=1&tenantId=1&targetDate=2025-11-21
```

### Monthly Analytics with Date Range
```
GET /api/v1/expenses-analytics/monthly?branchid=1&tenantId=1&startDate=2025-01-01&endDate=2025-11-30
```

### Top Categories with Custom Limit
```
GET /api/v1/expenses-analytics/top-categories?branchid=1&tenantId=1&startDate=2025-01-01&endDate=2025-11-30&limitCount=5
```

### Period Comparison
```
GET /api/v1/expenses-analytics/comparison-by-period?branchid=1&tenantId=1&currentStartDate=2025-11-01&currentEndDate=2025-11-30&previousStartDate=2025-10-01&previousEndDate=2025-10-31
```

## Notes

- All monetary values are returned as numbers (floats)
- Dates are returned in YYYY-MM-DD format
- Only approved expenses (approved = 1) are included in calculations
- Branch filtering is applied to all queries
- Empty results return an empty array `[]`
- All endpoints support cross-origin requests</content>
<parameter name="filePath">c:\Programming\PLS-DIFFERENT-VERSIONS\LobnosProfessionalVersion\lobnos-server\docs\expense-analy-plan.md