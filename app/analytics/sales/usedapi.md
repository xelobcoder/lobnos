# APIs Used in Sales Analytics Folder

This document lists all the APIs used in the `app/analytics/sales` folder.

## API Endpoint: `financials/billing/summary`

All APIs in this folder use the same base endpoint with different `key` parameters and optional query parameters.

### 1. Daily Sales Trend
- **File**: `dailySalesTrend/page.tsx` and `dailySalesTrend/copy.tsx`
- **URL**: `financials/billing/summary?key=dailySalesTrend&startDate=${startDate}&endDate=${endDate}&branchid=${branchId}`
- **Parameters**:
  - `key`: `dailySalesTrend`
  - `startDate`: Start date for the data range
  - `endDate`: End date for the data range
  - `branchid`: Branch identifier
- **Purpose**: Fetches daily sales data with trends and comparisons

### 2. Yearly Sales Trend
- **File**: `yearlySalesTrend/page.tsx`
- **URL**: `financials/billing/summary?key=yearlySalesTrend`
- **Parameters**:
  - `key`: `yearlySalesTrend`
- **Purpose**: Fetches yearly sales trend data

### 3. Weekly Sales Trend
- **File**: `weeklySalesTrend/page.tsx`
- **URL**: `financials/billing/summary?key=weeklySalesTrend&startDate=${startDate}&endDate=${endDate}`
- **Parameters**:
  - `key`: `weeklySalesTrend`
  - `startDate`: Start date for the data range
  - `endDate`: End date for the data range
- **Purpose**: Fetches weekly sales trend data

### 4. Total Sales by Service Category
- **File**: `totalSalesByServiceCategory/page.tsx`
- **URL**: `financials/billing/summary?key=totalSalesByBranchAndCategory&startDate=${startDate}&endDate=${endDate}`
- **Parameters**:
  - `key`: `totalSalesByBranchAndCategory`
  - `startDate`: Start date for the data range
  - `endDate`: End date for the data range
- **Purpose**: Fetches total sales data grouped by service category and branch

### 5. Total Sales by Organization
- **File**: `totalSalesByOrganization/page.tsx`
- **URL**: `financials/billing/summary?key=totalSalesByOrganization`
- **Parameters**:
  - `key`: `totalSalesByOrganization`
- **Purpose**: Fetches total sales data grouped by organization

### 6. Total Sales by Branch
- **File**: `totalSalesByBranch/page.tsx`
- **URL**: `financials/billing/summary?key=totalSalesByBranch&startDate=${startDate}&endDate=${endDate}`
- **Parameters**:
  - `key`: `totalSalesByBranch`
  - `startDate`: Start date for the data range
  - `endDate`: End date for the data range
- **Purpose**: Fetches total sales data grouped by branch

### 7. Monthly Sales Trend
- **File**: `monthlySalesTrend/page.tsx`
- **URL**: `financials/billing/summary?key=monthlySalesTrend&startDate=${startDate}&endDate=${endDate}&branchid=${branchId}`
- **Parameters**:
  - `key`: `monthlySalesTrend`
  - `startDate`: Start date for the data range
  - `endDate`: End date for the data range
  - `branchid`: Branch identifier
- **Purpose**: Fetches monthly sales trend data for a specific branch

### 8. Total Sales by Clinician
- **File**: `totalSalesByClinician/page.tsx`
- **URL**: `financials/billing/summary?key=totalSalesByClinician`
- **Parameters**:
  - `key`: `totalSalesByClinician`
- **Purpose**: Fetches total sales data grouped by clinician

### 9. Total Sales by Employee
- **File**: `totalSalesByEmployee/page.tsx`
- **URL**: `financials/billing/summary?key=totalSalesByEmployee&startDate=${startDate}&endDate=${endDate}`
- **Parameters**:
  - `key`: `totalSalesByEmployee`
  - `startDate`: Start date for the data range
  - `endDate`: End date for the data range
- **Purpose**: Fetches total sales data grouped by employee

### 10. Sales by Week and Branch
- **File**: `salesByWeekAndBranch/page.jsx`
- **URL**: `financials/billing/summary?key=salesByWeekAndBranch`
- **Parameters**:
  - `key`: `salesByWeekAndBranch`
- **Purpose**: Fetches sales data grouped by week and branch

### 11. Total Sales by Outsourced Status
- **File**: `totalSalesByOutsourcedStatus/page.tsx`
- **URL**: `financials/billing/summary?key=totalSalesByOutsourcedStatus`
- **Parameters**:
  - `key`: `totalSalesByOutsourcedStatus`
- **Purpose**: Fetches total sales data grouped by outsourced status

## Common Patterns

- **Base URL**: All APIs use `financials/billing/summary` as the base endpoint
- **Key Parameter**: Each API uses a unique `key` parameter to specify the type of data requested
- **Date Filtering**: Several APIs support `startDate` and `endDate` parameters for date range filtering
- **Branch Filtering**: Some APIs support `branchid` parameter for branch-specific data
- **Response Format**: All APIs return data in array format with consistent field naming conventions
- **Error Handling**: All components include proper error handling for API failures

## Files Without API Calls

- `page.tsx` (main sales page) - No API calls, just a placeholder component
- `salesbyhourofday/page.jsx` - No API calls, just a placeholder component