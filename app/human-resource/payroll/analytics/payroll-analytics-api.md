# Payroll Analytics API Documentation

## Overview
Comprehensive analytics endpoints for the payroll system, providing insights into payroll periods, compensation, attendance, leave, allowances, bonuses, deductions, and trends.

## Base URL
All endpoints require `tenantId` query parameter and date range parameters (`startDate` and `endDate` in YYYY-MM-DD format).

Example: `/api/v1/payroll/analytics?tenantId=1&startDate=2024-01-01&endDate=2024-12-31`

---

## Endpoints

### 1. Get Comprehensive Payroll Analytics
**GET** `/api/v1/payroll/analytics`

Returns all analytics data in one comprehensive response.

**Query Parameters:**
- `tenantId` (required): Tenant ID
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)
- `topEarnersLimit` (optional): Number of top earners to return (default: 10)

**Response includes:**
- Payroll period metrics by status
- Compensation type distribution
- Payment method breakdown
- Attendance summary
- Overtime metrics
- Leave statistics
- Allowance breakdown
- Bonus statistics
- Statutory deductions summary
- Other deductions breakdown
- Transaction summary
- Top earning employees
- Cost center allocation
- Payroll trend over time
- Compliance metrics
- Earnings distribution by salary band

---

### 2. Get Payroll Period Analytics
**GET** `/api/v1/payroll/analytics/periods`

Analyzes payroll periods by status (draft, calculated, approved, locked, paid).

**Metrics:**
- Period count by status
- Total gross salary
- Total deductions
- Total net salary
- Employee count
- Average gross per period
- Average net per period

---

### 3. Get Compensation Analytics
**GET** `/api/v1/payroll/analytics/compensation`

Breaks down employee compensation by type and payment frequency.

**Metrics by compensation type:**
- Salary, hourly, commission, hybrid breakdown
- Employee count per type
- Average basic salary
- Total basic salary
- Average hourly rate
- Average commission percentage
- Payment frequency distribution

---

### 4. Get Attendance Analytics
**GET** `/api/v1/payroll/analytics/attendance`

Provides attendance insights grouped by status and shift type.

**Metrics:**
- Record count by status (present, absent, half-day, late, early_departure)
- Total hours worked
- Average hours per day
- Total overtime hours
- Average late minutes
- Unique employees
- Breakdown by shift type (regular, night, weekend, holiday)

---

### 5. Get Leave Analytics
**GET** `/api/v1/payroll/analytics/leave`

Analyzes employee leave patterns by type and status.

**Metrics by leave type:**
- Leave types: annual, sick, maternity, paternity, unpaid, study, compassionate
- Leave count
- Total days taken
- Average days per leave
- Unique employees taking leave
- Unpaid leave count
- Status breakdown (pending, approved, rejected, cancelled)

---

### 6. Get Allowance & Bonus Analytics
**GET** `/api/v1/payroll/analytics/allowance-bonus`

Provides insights on employee allowances and bonuses.

**Allowance metrics:**
- Breakdown by type (housing, transport, meal, medical, education, etc.)
- Total and average amounts
- Number of employees receiving
- Calculation method (fixed, percentage_of_basic, variable)
- Taxable vs non-taxable count

**Bonus metrics:**
- Breakdown by type (performance, annual, project, retention, holiday, spot)
- Total and average amounts
- Status (pending, approved, rejected, paid)
- Average performance rating
- Unique employees receiving bonuses

---

### 7. Get Deduction Analytics
**GET** `/api/v1/payroll/analytics/deductions`

Analyzes statutory and other deductions.

**Statutory deductions:**
- SSNIT enrollment count
- Tier 3 pension enrollment
- Tax exempt employees
- NHIS active employees
- Average rates (SSNIT, Tier 3, NHIS)
- Average dependents count
- Compliance percentage

**Other deductions:**
- Breakdown by type (loan, advance, garnishment, union_dues, insurance, etc.)
- Total and average amounts
- Outstanding balances
- Recurring vs one-time deductions

---

### 8. Get Payroll Trend
**GET** `/api/v1/payroll/analytics/trend`

Shows payroll cost trends over time (monthly).

**Metrics per month:**
- Gross salary
- Total deductions
- Net salary
- Employee count
- Period status

**Use case:** Chart payroll costs over time, identify seasonal patterns, budget forecasting.

---

## Response Format

**Success Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    // Analytics data specific to endpoint
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error description"
}
```

---

## Example Usage

### Get comprehensive analytics for Q1 2024
```
GET /api/v1/payroll/analytics?tenantId=1&startDate=2024-01-01&endDate=2024-03-31&topEarnersLimit=20
```

### Get attendance analytics for a specific month
```
GET /api/v1/payroll/analytics/attendance?tenantId=1&startDate=2024-06-01&endDate=2024-06-30
```

### Get payroll trend for the year
```
GET /api/v1/payroll/analytics/trend?tenantId=1&startDate=2024-01-01&endDate=2024-12-31
```

---

## Analytics Data Structure

### Payroll Period Metrics
- Groups data by period status
- Calculates totals and averages per status
- Useful for understanding payroll workflow efficiency

### Compensation Distribution
- Shows how employees are paid (salary vs hourly vs commission)
- Payment frequency patterns
- Average compensation by type

### Attendance Summary
- Work hours tracking
- Overtime analysis
- Lateness metrics
- Shift type distribution

### Leave Statistics
- Leave utilization by type
- Leave approval rates
- Unpaid leave tracking

### Allowance & Bonus Breakdown
- Employee benefits analysis
- Bonus distribution
- Taxable vs non-taxable benefits

### Deduction Analytics
- Statutory compliance tracking
- Loan/advance recovery monitoring
- Tax and pension enrollment rates

### Payroll Trend
- Time-series data for charting
- Month-over-month comparisons
- Budget vs actual analysis

### Top Earners
- Identifies highest compensated employees
- Total gross and net salary
- Payroll count in period

### Earnings Distribution
- Salary band analysis
- Income inequality metrics
- Compensation structure insights

### Cost Center Allocation
- Department-wise employee distribution
- Cost allocation percentages
- Branch-level analysis

### Compliance Metrics
- Statutory deduction enrollment rates
- Tax compliance tracking
- SSNIT/NHIS coverage

---

## Performance Considerations

1. **Date Range**: Larger date ranges will take longer to process. Recommended maximum: 1 year.
2. **Parallel Queries**: The comprehensive endpoint executes 16 queries in parallel for optimal performance.
3. **Indexing**: Ensure database indexes on:
   - `payroll_periods.period_start_date`, `period_end_date`
   - `payroll_employee_attendance.attendance_date`
   - `payroll_transactions.payroll_period_id`
   - `payroll_employee_leave.start_date`

4. **Caching**: Consider caching analytics results for historical periods that won't change.

---

## Business Intelligence Use Cases

1. **Payroll Cost Management**: Track total payroll costs, identify trends, forecast budgets
2. **Attendance Monitoring**: Identify attendance patterns, overtime usage, lateness trends
3. **Leave Management**: Monitor leave utilization, identify potential staffing shortages
4. **Compensation Analysis**: Ensure fair compensation distribution, benchmark salaries
5. **Deduction Compliance**: Ensure all employees have proper statutory deductions
6. **Bonus Effectiveness**: Analyze bonus distribution and performance correlation
7. **Cost Center Reporting**: Allocate costs to departments for accurate P&L
8. **Workforce Planning**: Use trend data for hiring and staffing decisions

---

## Notes

- All monetary values are in the configured currency (default: GHS)
- Percentages are rounded to 1 decimal place
- Employee counts are distinct counts
- Date filtering uses MySQL `DATE()` function for accurate range matching
- Results are grouped by relevant dimensions (status, type, period, etc.)
