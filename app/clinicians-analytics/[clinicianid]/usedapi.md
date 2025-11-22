# APIs Used in Clinicians Analytics [clinicianid] Folder

This document lists all the APIs used in the `app/clinicians-analytics/[clinicianid]` folder.

## API Endpoint: `clinician/anal/overall`

### 1. Clinician Overall Analytics
- **Files**:
  - `page.tsx` (main clinician analytics page)
  - `overall/page.tsx` (dedicated overall analytics page)
- **URL**: `clinician/anal/overall/${clinicianid}`
- **Parameters**:
  - `clinicianid`: The ID of the clinician (from URL params)
- **Purpose**: Fetches overall analytics data for a specific clinician
- **Response Structure**:
  - `success`: Boolean indicating if the request was successful
  - `data`: Array containing clinician analytics data (first element used)
- **Usage**: Data is passed to `ClinicianOverallAnalytics` component for display

## Files Without Direct API Calls

The following files in this folder do not make direct API calls but instead render components that may handle their own API calls:

- `layout.tsx` - Layout component with navigation links
- `daily-case-change/page.tsx` - Renders `ClinicianAnalyticsDailyCaseChange` component
- `daily-summary/page.tsx` - Renders `ClinicianAnalyticsCaseSummaryDailyRecent` component
- `monthly-summary/page.tsx` - Renders `ClinicianAnalyticsCaseSummaryMonthly` component
- `monthly-totals/page.tsx` - Renders `ClinicianAnalyticsMonthlyTotals` component
- `totalcases/page.tsx` - Renders `ClinicianCasesVerseTotalCases` component
- `yearly-summary/page.tsx` - Renders `ClinicianAnalyticsCaseSummaryMonthly` component
- `yearly-totals/page.tsx` - Renders `ClinicianAnalyticsYearlyTotals` component

## Common Patterns

- **Base URL**: All APIs use `clinician/anal/` as the base path
- **Parameter Structure**: Clinician ID is passed as a URL parameter
- **Response Format**: APIs return objects with `success` boolean and `data` array
- **Error Handling**: Components check for `response?.success` before using data
- **Component Architecture**: Most pages are thin wrappers that pass clinician ID to specialized components

## Navigation Structure

The layout defines 9 different analytics views for clinicians:
1. Clinician Overview
2. Daily Summary
3. Monthly Summary
4. Yearly Summary
5. Daily Case Change
6. Monthly Totals
7. Yearly Totals
8. Cases vs Total
9. Total Cases