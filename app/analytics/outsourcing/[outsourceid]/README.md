# Specific Outsource Organization Analytics

This page provides detailed analytics for a specific outsourcing organization/facility across different time periods.

## Features

- **URL Parameter Support**: Automatically uses the `outsourceid` from the URL parameter
- **Time Period Selection**: Choose from Hourly, Daily, Weekly, Monthly, Quarterly, or Yearly analytics
- **Branch Filtering**: Filter analytics by specific branch or view all branches
- **Dynamic Controls**: Date pickers and year selectors appear based on selected time period
- **Multiple Chart Types**: Bar, Line, and Area charts for data visualization
- **Summary Cards**: Total amount and total services for the selected period
- **Detailed Table**: Dynamic table headers and data display based on time period
- **Percentage Calculations**: Shows each time period's contribution to the total

## Time Periods Available

- **Hourly**: Shows hourly outsourcing patterns for a specific date (requires date selection)
- **Daily**: Shows daily outsourcing amounts - either last 30 days or custom date range (toggle available)
- **Weekly**: Shows weekly outsourcing trends for a selected year (requires year selection)
- **Monthly**: Shows monthly outsourcing amounts for the last 12 months (default, requires year selection)
- **Quarterly**: Shows quarterly outsourcing trends for a selected year (requires year selection)
- **Yearly**: Shows yearly outsourcing summary by facility (requires year selection)

## Dynamic Controls

The interface adapts based on the selected time period:

- **Hourly**: Date picker for target date
- **Daily**: Toggle switch for "Custom Range" + start/end date pickers when enabled
- **Weekly/Monthly/Quarterly/Yearly**: Year dropdown selector
- **All periods**: Branch selector and chart type buttons

## Data Display

- **Chart Visualization**: Interactive charts showing trends for the selected time period
- **Summary Metrics**: Total amount and services for the selected period
- **Dynamic Table**: Headers and data columns adapt to the selected time period
- **Percentage Calculations**: Shows each data point's contribution to the total

## Navigation

Access this page at `/analytics/outsourcing/[outsourceid]` where `[outsourceid]` is the dynamic route parameter representing the specific organization ID.

**Example URLs:**
- `/analytics/outsourcing/16` - View analytics for organization with ID 16
- `/analytics/outsourcing/12` - View analytics for organization with ID 12

The page will automatically use the organization ID from the URL parameter and allow switching between different time periods.