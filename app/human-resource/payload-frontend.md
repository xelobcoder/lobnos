# Payroll API Frontend Integration Guide

## Overview
This document provides comprehensive guidance for frontend developers to integrate with the Payroll Management API. All endpoints require authentication via JWT token in cookies and a `tenantId` query parameter.

## Base URL
```
http://localhost:5000/api/v1/payroll
```

## Authentication
- **Method**: Cookie-based JWT authentication
- **Cookie Name**: `pls-prime-tenant-session`
- **Required Parameter**: `tenantId` (query parameter for all requests)

## Common Response Format
All API responses follow this structure:
```json
{
  "status": "success" | "error",
  "statusCode": number,
  "message": string,
  "result": any
}
```

## Error Responses
```json
{
  "status": "error",
  "statusCode": 400 | 404 | 500,
  "message": "Error description"
}
```

---

# 1. COMPENSATION ENDPOINTS

## 1.1 Create Compensation Record
**Endpoint**: `POST /api/v1/payroll/compensation?tenantId={tenantId}`

**Request Payload**:
```json
{
  "employeeid": 123,
  "compensation_type": "salary",
  "basic_salary": 5000.00,
  "salary_grade": "Grade A",
  "currency": "GHS",
  "hourly_rate": null,
  "overtime_rate_multiplier": 1.5,
  "commission_percentage": null,
  "commission_target": null,
  "payment_frequency": "monthly",
  "payment_method": "bank_transfer",
  "bank_account_number": "1234567890",
  "bank_name": "Bank of Ghana",
  "bank_branch": "Accra Main",
  "mobile_money_number": null,
  "effective_from": "2024-01-01",
  "effective_to": null,
  "is_active": true,
  "created_by": 1
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Compensation record created successfully",
  "result": {
    "id": 1
  }
}
```

**Error Responses**:
- `400`: Foreign key constraint (employee doesn't exist)
- `500`: Server error

## 1.2 Get Employee Compensation History
**Endpoint**: `GET /api/v1/payroll/compensation/employee/{employeeId}?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "employeeid": 123,
      "compensation_type": "salary",
      "basic_salary": 5000.00,
      "payment_frequency": "monthly",
      "payment_method": "bank_transfer",
      "effective_from": "2024-01-01",
      "is_active": true
    }
  ]
}
```

## 1.3 Get Active Compensation for Employee
**Endpoint**: `GET /api/v1/payroll/compensation/employee/{employeeId}/active?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 1,
    "employeeid": 123,
    "compensation_type": "salary",
    "basic_salary": 5000.00,
    "effective_from": "2024-01-01",
    "is_active": true
  }
}
```

**Error Response (404)**:
```json
{
  "status": "error",
  "statusCode": 404,
  "message": "No active compensation found for employee"
}
```

## 1.4 Get All Active Compensations
**Endpoint**: `GET /api/v1/payroll/compensation/active?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "employeeid": 123,
      "compensation_type": "salary",
      "basic_salary": 5000.00,
      "effective_from": "2024-01-01",
      "is_active": true
    }
  ]
}
```

## 1.5 Update Compensation Record
**Endpoint**: `PUT /api/v1/payroll/compensation/{id}?tenantId={tenantId}`

**Request Payload** (partial update supported):
```json
{
  "basic_salary": 5500.00,
  "effective_to": "2024-12-31"
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Compensation record updated successfully"
}
```

**Error Response (404)**:
```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Compensation record not found"
}
```

## 1.6 Create Compensation with History
**Endpoint**: `POST /api/v1/payroll/compensation/employee/{employeeId}/history?tenantId={tenantId}`

**Request Payload**:
```json
{
  "newCompensation": {
    "compensation_type": "salary",
    "basic_salary": 5500.00,
    "payment_frequency": "monthly",
    "payment_method": "bank_transfer",
    "effective_from": "2024-01-01",
    "is_active": true,
    "created_by": 1
  },
  "endDate": "2024-12-31"
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Compensation updated with history",
  "result": {
    "id": 2
  }
}
```

## 1.7 Deactivate Compensation Record
**Endpoint**: `DELETE /api/v1/payroll/compensation/{id}?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Compensation record deactivated successfully"
}
```

---

# 2. PAYROLL PERIOD ENDPOINTS

## 2.1 Create Payroll Period
**Endpoint**: `POST /api/v1/payroll/periods?tenantId={tenantId}`

**Request Payload**: None required (automatically creates the next payroll period based on current date)

**Success Response (201)**:
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Payroll period created successfully",
  "result": {
    "id": 1
  }
}
```

## 2.2 Get All Payroll Periods
**Endpoint**: `GET /api/v1/payroll/periods?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "period_name": "December 2024",
      "period_year": 2024,
      "period_month": 12,
      "period_start_date": "2024-12-01T00:00:00.000Z",
      "period_end_date": "2024-12-31T00:00:00.000Z",
      "status": "draft",
      "total_gross_salary": 0,
      "total_deductions": 0,
      "total_net_salary": 0,
      "employee_count": 0
    }
  ]
}
```

## 2.3 Get Payroll Period by ID
**Endpoint**: `GET /api/v1/payroll/periods/{id}?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 1,
    "period_name": "December 2024",
    "period_year": 2024,
    "period_month": 12,
    "period_start_date": "2024-12-01T00:00:00.000Z",
    "period_end_date": "2024-12-31T00:00:00.000Z",
    "status": "draft",
    "total_gross_salary": 0,
    "total_deductions": 0,
    "total_net_salary": 0,
    "employee_count": 0
  }
}
```

## 2.4 Get Payroll Period Status
**Endpoint**: `GET /api/v1/payroll/periods/{id}/status?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "period": {
      "id": 1,
      "period_name": "December 2024",
      "status": "draft"
    },
    "transaction_count": 10,
    "status_breakdown": {
      "pending": 2,
      "approved": 5,
      "paid": 3
    }
  }
}
```

## 2.5 Get Payroll Period Transactions
**Endpoint**: `GET /api/v1/payroll/periods/{id}/transactions?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "payroll_period_id": 1,
      "employeeid": 123,
      "basic_salary": 5000.00,
      "hourly_earnings": 0.00,
      "overtime_earnings": 0.00,
      "commission_earnings": 0.00,
      "total_allowances": 0.00,
      "total_bonuses": 0.00,
      "gross_salary": 5000.00,
      "income_tax": 750.00,
      "employee_ssnit": 275.00,
      "employer_ssnit": 650.00,
      "employee_tier3": 250.00,
      "employer_tier3": 250.00,
      "nhis": 125.00,
      "total_other_deductions": 0.00,
      "total_deductions": 1400.00,
      "net_salary": 3600.00,
      "employer_cost": 5900.00,
      "days_worked": 22,
      "hours_worked": 176,
      "overtime_hours": 0,
      "days_absent": 0,
      "days_leave": 0,
      "status": "approved",
      "employee_name": "John Doe",
      "employee_role": "scientist",
      "email": "john@example.com",
      "branch_name": "Accra Main"
    }
  ]
}
```

## 2.6 Process Payroll Period
**Endpoint**: `POST /api/v1/payroll/periods/{id}/process?tenantId={tenantId}`

**Request Payload**:
```json
{
  "employeeIds": [123, 124, 125],
  "calculated_by": 1
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Payroll processed successfully",
  "result": {
    "processed_count": 3,
    "total_gross": 15000.00,
    "total_deductions": 2250.00,
    "total_net": 12750.00
  }
}
```

**Error Response (400)**:
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Employee IDs array is required"
}
```

## 2.7 Approve Payroll Period
**Endpoint**: `POST /api/v1/payroll/periods/{id}/approve?tenantId={tenantId}`

**Request Payload**:
```json
{
  "approved_by": 1
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Payroll period approved successfully"
}
```

**Error Response (400)**:
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Cannot approve payroll period with status draft"
}
```

## 2.8 Lock Payroll Period
**Endpoint**: `POST /api/v1/payroll/periods/{id}/lock?tenantId={tenantId}`

**Request Payload**:
```json
{
  "locked_by": 1
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Payroll period locked successfully"
}
```

## 2.9 Mark Payroll as Paid
**Endpoint**: `POST /api/v1/payroll/periods/{id}/mark-paid?tenantId={tenantId}`

**Request Payload**:
```json
{
  "payment_date": "2024-12-31",
  "payment_method": "bank_transfer",
  "payment_references": {
    "123": "REF001",
    "124": "REF002"
  }
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Payroll period marked as paid successfully"
}
```

## 2.10 Recalculate Employee Payroll
**Endpoint**: `POST /api/v1/payroll/periods/{id}/recalculate?tenantId={tenantId}`

**Request Payload**:
```json
{
  "employeeid": 123,
  "recalculated_by": 1
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Employee payroll recalculated successfully"
}
```

---

# 3. EMPLOYEE PAYROLL ENDPOINTS

## 3.1 Get Employee Payroll History
**Endpoint**: `GET /api/v1/payroll/employee/{employeeId}/history?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "payroll_period_id": 1,
      "employeeid": 123,
      "basic_salary": 5000.00,
      "hourly_earnings": 0.00,
      "overtime_earnings": 0.00,
      "commission_earnings": 0.00,
      "total_allowances": 0.00,
      "total_bonuses": 0.00,
      "gross_salary": 5000.00,
      "income_tax": 750.00,
      "employee_ssnit": 275.00,
      "employer_ssnit": 650.00,
      "employee_tier3": 250.00,
      "employer_tier3": 250.00,
      "nhis": 125.00,
      "total_other_deductions": 0.00,
      "total_deductions": 1400.00,
      "net_salary": 3600.00,
      "employer_cost": 5900.00,
      "days_worked": 22,
      "hours_worked": 176,
      "overtime_hours": 0,
      "days_absent": 0,
      "days_leave": 0,
      "status": "paid",
      "payment_date": "2024-12-31",
      "payment_method": "bank_transfer",
      "payment_reference": "REF001",
      "created_at": "2024-12-01T10:00:00.000Z",
      "updated_at": "2024-12-31T15:00:00.000Z"
    }
  ]
}
```

## 3.2 Get Employee Year-to-Date Totals
**Endpoint**: `GET /api/v1/payroll/employee/{employeeId}/ytd?tenantId={tenantId}&year=2024`

**Request**: No body required (optional year query parameter, defaults to current year)

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "ytd_gross": 60000.00,
    "ytd_net": 51000.00,
    "ytd_tax": 7500.00,
    "ytd_ssnit": 1500.00
  }
}
```

---

# 4. ATTENDANCE ENDPOINTS *(Planned - Not Yet Implemented)*

## 4.1 Record Employee Attendance
**Endpoint**: `POST /api/v1/payroll/attendance?tenantId={tenantId}`

**Request Payload**:
```json
{
  "employeeid": 123,
  "attendance_date": "2024-12-11",
  "clock_in": "08:30:00",
  "clock_out": "17:30:00",
  "shift_type": "regular",
  "work_location": "on-site",
  "status": "present",
  "late_minutes": 0,
  "overtime_hours": 0,
  "overtime_approved": false,
  "remarks": "On time"
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Attendance record created successfully",
  "result": {
    "id": 1
  }
}
```

**Error Responses**:
- `400`: Invalid time format or missing required fields
- `409`: Duplicate attendance record for date/employee

## 4.2 Get Employee Attendance History
**Endpoint**: `GET /api/v1/payroll/attendance/employee/{employeeId}?tenantId={tenantId}&start_date=2024-12-01&end_date=2024-12-31`

**Query Parameters**:
- `start_date`: Start date in YYYY-MM-DD format
- `end_date`: End date in YYYY-MM-DD format

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "employeeid": 123,
      "attendance_date": "2024-12-11",
      "clock_in": "08:30:00",
      "clock_out": "17:30:00",
      "total_hours": 8.00,
      "shift_type": "regular",
      "work_location": "on-site",
      "status": "present",
      "late_minutes": 0,
      "overtime_hours": 0,
      "overtime_approved": false,
      "remarks": "On time",
      "created_at": "2024-12-11T08:30:00.000Z"
    }
  ]
}
```

## 4.3 Update Attendance Record
**Endpoint**: `PUT /api/v1/payroll/attendance/{id}?tenantId={tenantId}`

**Request Payload** (partial update supported):
```json
{
  "clock_out": "18:00:00",
  "overtime_hours": 0.5,
  "remarks": "Worked overtime"
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Attendance record updated successfully"
}
```

## 4.4 Get Attendance Summary
**Endpoint**: `GET /api/v1/payroll/attendance/summary?tenantId={tenantId}&month=12&year=2024`

**Query Parameters**:
- `month`: Month number (1-12)
- `year`: Year (YYYY)

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "month": 12,
    "year": 2024,
    "total_employees": 50,
    "present_days": 1200,
    "absent_days": 25,
    "late_days": 15,
    "half_days": 5,
    "total_overtime_hours": 45.5,
    "average_attendance": 95.2
  }
}
```

## 4.5 Bulk Record Attendance
**Endpoint**: `POST /api/v1/payroll/attendance/bulk?tenantId={tenantId}`

**Request Payload**:
```json
{
  "attendance_records": [
    {
      "employeeid": 123,
      "attendance_date": "2024-12-11",
      "status": "present",
      "clock_in": "08:30:00",
      "clock_out": "17:30:00"
    },
    {
      "employeeid": 124,
      "attendance_date": "2024-12-11",
      "status": "absent",
      "remarks": "Sick leave"
    }
  ]
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Bulk attendance recorded successfully",
  "result": {
    "processed": 2,
    "successful": 2,
    "failed": 0
  }
}
```

---

# 5. ALLOWANCE & BONUS ENDPOINTS *(Planned - Not Yet Implemented)*

## 5.1 Create Employee Allowance
**Endpoint**: `POST /api/v1/payroll/allowances?tenantId={tenantId}`

**Request Payload**:
```json
{
  "employeeid": 123,
  "allowance_type": "housing",
  "amount": 500.00,
  "calculation_method": "fixed",
  "percentage": null,
  "is_recurring": true,
  "frequency": "monthly",
  "is_taxable": true,
  "effective_from": "2024-01-01",
  "effective_to": null,
  "is_active": true,
  "approved_by": 1
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Employee allowance created successfully",
  "result": {
    "id": 1
  }
}
```

**Error Responses**:
- `400`: Invalid allowance type or calculation method
- `409`: Active allowance already exists for employee/type

## 5.2 Create Employee Bonus
**Endpoint**: `POST /api/v1/payroll/bonuses?tenantId={tenantId}`

**Request Payload**:
```json
{
  "employeeid": 123,
  "bonus_type": "performance",
  "amount": 1000.00,
  "bonus_period": "Q4 2024",
  "is_taxable": true,
  "tax_method": "aggregate",
  "status": "pending",
  "approved_by": null,
  "approved_date": null
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Employee bonus created successfully",
  "result": {
    "id": 1
  }
}
```

## 5.3 Get Employee Allowances
**Endpoint**: `GET /api/v1/payroll/allowances/employee/{employeeId}?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "employeeid": 123,
      "allowance_type": "housing",
      "amount": 500.00,
      "calculation_method": "fixed",
      "is_recurring": true,
      "frequency": "monthly",
      "is_taxable": true,
      "effective_from": "2024-01-01",
      "is_active": true,
      "created_at": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

## 5.4 Get Employee Bonuses
**Endpoint**: `GET /api/v1/payroll/bonuses/employee/{employeeId}?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "employeeid": 123,
      "bonus_type": "performance",
      "amount": 1000.00,
      "bonus_period": "Q4 2024",
      "is_taxable": true,
      "tax_method": "aggregate",
      "status": "approved",
      "approved_by": 1,
      "approved_date": "2024-12-01T10:00:00.000Z"
    }
  ]
}
```

## 5.5 Update Allowance/Bonus
**Endpoint**: `PUT /api/v1/payroll/allowances/{id}?tenantId={tenantId}`
**Endpoint**: `PUT /api/v1/payroll/bonuses/{id}?tenantId={tenantId}`

**Request Payload** (partial update supported):
```json
{
  "amount": 600.00,
  "effective_to": "2024-12-31"
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Allowance updated successfully"
}
```

## 5.6 Approve Bonus
**Endpoint**: `PUT /api/v1/payroll/bonuses/{id}/approve?tenantId={tenantId}`

**Request Payload**:
```json
{
  "approved_by": 1
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Bonus approved successfully"
}
```

## 5.7 Get Allowance Types
**Endpoint**: `GET /api/v1/payroll/allowances/types?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    "housing",
    "transport",
    "meal",
    "medical",
    "education",
    "uniform",
    "mobile",
    "hazard",
    "shift_allowance",
    "professional_development"
  ]
}
```

## 5.8 Get Bonus Types
**Endpoint**: `GET /api/v1/payroll/bonuses/types?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    "performance",
    "annual",
    "project",
    "retention",
    "holiday",
    "spot"
  ]
}
```

---

# 6. DEDUCTION ENDPOINTS *(Planned - Not Yet Implemented)*

## 6.1 Setup Statutory Deductions
**Endpoint**: `POST /api/v1/payroll/deductions/statutory?tenantId={tenantId}`

**Request Payload**:
```json
{
  "employeeid": 123,
  "ssnit_number": "123456789",
  "ssnit_active": true,
  "ssnit_employee_rate": 5.5,
  "tier3_enrolled": true,
  "tier3_scheme_name": "Premium Pension Scheme",
  "tier3_scheme_number": "TPS123456",
  "tier3_employee_rate": 5.0,
  "tier3_employer_rate": 5.0,
  "tin_number": "TIN123456",
  "tax_exempt": false,
  "dependents_count": 2,
  "nhis_number": "NHIS123456",
  "nhis_active": true,
  "nhis_rate": 2.5
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Statutory deductions setup successfully",
  "result": {
    "id": 1
  }
}
```

**Error Responses**:
- `400`: Invalid SSNIT number or TIN format
- `409`: Statutory deductions already exist for employee

## 6.2 Create Other Deduction
**Endpoint**: `POST /api/v1/payroll/deductions/other?tenantId={tenantId}`

**Request Payload**:
```json
{
  "employeeid": 123,
  "deduction_type": "loan",
  "deduction_name": "Staff Loan",
  "amount": 500.00,
  "calculation_method": "fixed",
  "is_recurring": true,
  "frequency": "monthly",
  "start_date": "2024-01-01",
  "end_date": "2025-01-01",
  "is_mandatory": true,
  "approved_by": 1
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Deduction created successfully",
  "result": {
    "id": 1
  }
}
```

## 6.3 Get Employee Deductions
**Endpoint**: `GET /api/v1/payroll/deductions/employee/{employeeId}?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "statutory": [
      {
        "id": 1,
        "employeeid": 123,
        "deduction_type": "ssnit",
        "amount": null,
        "calculation_method": "percentage",
        "percentage": 5.5,
        "is_recurring": true,
        "frequency": "monthly",
        "is_statutory": true,
        "is_active": true,
        "ssnit_number": "123456789",
        "created_at": "2024-01-01T10:00:00.000Z"
      }
    ],
    "other": [
      {
        "id": 2,
        "employeeid": 123,
        "deduction_type": "loan",
        "deduction_name": "Staff Loan",
        "amount": 500.00,
        "calculation_method": "fixed",
        "is_recurring": true,
        "frequency": "monthly",
        "is_statutory": false,
        "start_date": "2024-01-01",
        "end_date": "2025-01-01",
        "is_active": true,
        "created_at": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

## 6.4 Update Deduction
**Endpoint**: `PUT /api/v1/payroll/deductions/{id}?tenantId={tenantId}`

**Request Payload** (partial update supported):
```json
{
  "amount": 450.00,
  "end_date": "2024-12-31",
  "deduction_name": "Updated loan amount"
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Deduction updated successfully"
}
```

## 6.5 Deactivate Deduction
**Endpoint**: `PUT /api/v1/payroll/deductions/{id}/deactivate?tenantId={tenantId}`

**Request Payload**:
```json
{
  "deactivated_by": 1,
  "reason": "Loan fully repaid"
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Deduction deactivated successfully"
}
```

## 6.6 Get Deduction Types
**Endpoint**: `GET /api/v1/payroll/deductions/types?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "statutory": [
      "ssnit",
      "income_tax",
      "tier3_pension",
      "nhis"
    ],
    "other": [
      "loan",
      "advance",
      "insurance",
      "union_dues",
      "savings",
      "welfare",
      "provident_fund"
    ]
  }
}
```

---

# 7. LEAVE MANAGEMENT ENDPOINTS *(Planned - Not Yet Implemented)*

## 7.1 Submit Leave Request
**Endpoint**: `POST /api/v1/payroll/leave?tenantId={tenantId}`

**Request Payload**:
```json
{
  "employeeid": 123,
  "leave_type": "annual",
  "start_date": "2024-12-20",
  "end_date": "2024-12-24",
  "total_days": 5,
  "reason": "Family vacation",
  "affects_salary": true,
  "contact_details": {
    "phone": "+233501234567",
    "address": "123 Main Street, Accra"
  },
  "relief_officer_id": 124
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Leave request submitted successfully",
  "result": {
    "id": 1,
    "status": "pending"
  }
}
```

**Error Responses**:
- `400`: Insufficient leave balance or invalid date range
- `409`: Conflicting leave request for the same period

## 7.2 Get Employee Leave History
**Endpoint**: `GET /api/v1/payroll/leave/employee/{employeeId}?tenantId={tenantId}&year=2024`

**Query Parameters**:
- `year`: Year to filter leave history (optional)

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "employeeid": 123,
      "leave_type": "annual",
      "start_date": "2024-12-20",
      "end_date": "2024-12-24",
      "total_days": 5,
      "status": "approved",
      "reason": "Family vacation",
      "affects_salary": true,
      "approved_by": 1,
      "approved_date": "2024-12-01T10:00:00.000Z",
      "created_at": "2024-11-25T14:30:00.000Z"
    }
  ]
}
```

## 7.3 Get Leave Balances
**Endpoint**: `GET /api/v1/payroll/leave/balances/employee/{employeeId}?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "employeeid": 123,
    "year": 2024,
    "annual_leave": {
      "entitled": 25,
      "taken": 5,
      "remaining": 20
    },
    "sick_leave": {
      "entitled": 10,
      "taken": 2,
      "remaining": 8
    },
    "maternity_leave": {
      "entitled": 12,
      "taken": 0,
      "remaining": 12
    },
    "paternity_leave": {
      "entitled": 5,
      "taken": 0,
      "remaining": 5
    },
    "compassionate_leave": {
      "entitled": 3,
      "taken": 0,
      "remaining": 3
    }
  }
}
```

## 7.4 Approve/Reject Leave Request
**Endpoint**: `PUT /api/v1/payroll/leave/{id}/status?tenantId={tenantId}`

**Request Payload**:
```json
{
  "status": "approved",
  "approved_by": 1,
  "comments": "Approved for vacation. Enjoy your time with family."
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Leave request approved successfully"
}
```

**Error Responses**:
- `400`: Invalid status transition
- `404`: Leave request not found

## 7.5 Update Leave Balances
**Endpoint**: `PUT /api/v1/payroll/leave/balances/{employeeId}?tenantId={tenantId}`

**Request Payload**:
```json
{
  "leave_type": "annual",
  "adjustment_type": "add",
  "days": 2,
  "reason": "Additional leave granted for outstanding performance",
  "adjusted_by": 1
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Leave balance updated successfully"
}
```

## 7.6 Get Leave Types
**Endpoint**: `GET /api/v1/payroll/leave/types?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "type": "annual",
      "name": "Annual Leave",
      "description": "Regular annual vacation leave",
      "max_days_per_year": 25,
      "affects_salary": true
    },
    {
      "type": "sick",
      "name": "Sick Leave",
      "description": "Medical leave for illness",
      "max_days_per_year": 10,
      "affects_salary": false
    },
    {
      "type": "maternity",
      "name": "Maternity Leave",
      "description": "Leave for childbirth and childcare",
      "max_days_per_year": 12,
      "affects_salary": false
    },
    {
      "type": "paternity",
      "name": "Paternity Leave",
      "description": "Leave for new fathers",
      "max_days_per_year": 5,
      "affects_salary": false
    },
    {
      "type": "compassionate",
      "name": "Compassionate Leave",
      "description": "Leave for family emergencies",
      "max_days_per_year": 3,
      "affects_salary": false
    }
  ]
}
```

---

# 8. TAX CONFIGURATION ENDPOINTS *(Planned - Not Yet Implemented)*

## 8.1 Create Tax Configuration
**Endpoint**: `POST /api/v1/payroll/tax-config?tenantId={tenantId}`

**Request Payload**:
```json
{
  "tax_year": "2024",
  "country": "Ghana",
  "tax_bands": [
    {"min": 0, "max": 401, "rate": 0},
    {"min": 401, "max": 3000, "rate": 5},
    {"min": 3000, "max": 50000, "rate": 10},
    {"min": 50000, "max": 100000, "rate": 17.5},
    {"min": 100000, "max": 200000, "rate": 25},
    {"min": 200000, "max": 300000, "rate": 30},
    {"min": 300000, "max": null, "rate": 35}
  ],
  "standard_exemption": 401,
  "dependent_relief": 100,
  "disability_exemption": 2000,
  "employee_ssnit_rate": 5.5,
  "employer_ssnit_rate": 13.0,
  "tier3_employee_rate": 5.0,
  "tier3_employer_rate": 5.0,
  "ssnit_ceiling": 1500,
  "nhis_rate": 2.5,
  "created_by": 1
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Tax configuration created successfully",
  "result": {
    "id": 1
  }
}
```

**Error Responses**:
- `400`: Invalid tax band structure or overlapping ranges
- `409`: Tax configuration already exists for the year

## 8.2 Get Tax Configuration
**Endpoint**: `GET /api/v1/payroll/tax-config/{year}?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 1,
    "tax_year": "2024",
    "country": "Ghana",
    "tax_bands": [
      {"min": 0, "max": 401, "rate": 0},
      {"min": 401, "max": 3000, "rate": 5},
      {"min": 3000, "max": 50000, "rate": 10},
      {"min": 50000, "max": 100000, "rate": 17.5},
      {"min": 100000, "max": 200000, "rate": 25},
      {"min": 200000, "max": 300000, "rate": 30},
      {"min": 300000, "max": null, "rate": 35}
    ],
    "standard_exemption": 401,
    "dependent_relief": 100,
    "disability_exemption": 2000,
    "employee_ssnit_rate": 5.5,
    "employer_ssnit_rate": 13.0,
    "tier3_employee_rate": 5.0,
    "tier3_employer_rate": 5.0,
    "ssnit_ceiling": 1500,
    "nhis_rate": 2.5,
    "is_active": true,
    "created_by": 1,
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

## 8.3 Update Tax Configuration
**Endpoint**: `PUT /api/v1/payroll/tax-config/{id}?tenantId={tenantId}`

**Request Payload** (partial update supported):
```json
{
  "tax_bands": [
    {"min": 0, "max": 401, "rate": 0},
    {"min": 401, "max": 3000, "rate": 5.5},
    {"min": 3000, "max": 50000, "rate": 10.5}
  ],
  "standard_exemption": 420,
  "updated_by": 1
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Tax configuration updated successfully"
}
```

## 8.4 Get Active Tax Configuration
**Endpoint**: `GET /api/v1/payroll/tax-config/active?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 1,
    "tax_year": "2024",
    "country": "Ghana",
    "tax_bands": [
      {"min": 0, "max": 401, "rate": 0},
      {"min": 401, "max": 3000, "rate": 5},
      {"min": 3000, "max": 50000, "rate": 10},
      {"min": 50000, "max": 100000, "rate": 17.5},
      {"min": 100000, "max": 200000, "rate": 25},
      {"min": 200000, "max": 300000, "rate": 30},
      {"min": 300000, "max": null, "rate": 35}
    ],
    "standard_exemption": 401,
    "dependent_relief": 100,
    "disability_exemption": 2000,
    "employee_ssnit_rate": 5.5,
    "employer_ssnit_rate": 13.0,
    "tier3_employee_rate": 5.0,
    "tier3_employer_rate": 5.0,
    "ssnit_ceiling": 1500,
    "nhis_rate": 2.5,
    "is_active": true
  }
}
```

## 8.5 Calculate Tax Preview
**Endpoint**: `POST /api/v1/payroll/tax-config/calculate?tenantId={tenantId}`

**Request Payload**:
```json
{
  "gross_income": 50000,
  "dependents_count": 2,
  "is_disabled": false,
  "ssnit_contribution": 2750,
  "tier3_contribution": 2500,
  "other_deductions": 1000
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "gross_income": 50000,
    "taxable_income": 38750,
    "tax_bands_applied": [
      {"band": "0-401", "taxable": 401, "rate": 0, "tax": 0},
      {"band": "401-3000", "taxable": 2599, "rate": 5, "tax": 129.95},
      {"band": "3000-50000", "taxable": 20000, "rate": 10, "tax": 2000}
    ],
    "total_tax": 2129.95,
    "effective_rate": 4.26,
    "net_income": 47870.05
  }
}
```

## 8.6 Get Tax Years
**Endpoint**: `GET /api/v1/payroll/tax-config/years?tenantId={tenantId}`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {"year": "2024", "is_active": true},
    {"year": "2023", "is_active": false},
    {"year": "2022", "is_active": false}
  ]
}
```

---

# 9. DOCUMENTATION ENDPOINT

## 9.1 Get All Available Routes
**Endpoint**: `GET /api/v1/payroll/routes`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Payroll API Routes",
  "total_routes": 19,
  "routes": [
    {
      "method": "POST",
      "path": "/api/v1/payroll/compensation",
      "description": "Create compensation record"
    }
    // ... all 19 routes listed
  ]
}
```

---

# Frontend Implementation Notes

## 1. Authentication
- Ensure JWT token is set in cookies before making API calls
- Include `tenantId` in all request query parameters

## 2. Error Handling
```javascript
// Example error handling
try {
  const response = await fetch('/api/v1/payroll/compensation?tenantId=1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(compensationData)
  });

  const data = await response.json();

  if (data.status === 'error') {
    // Handle error
    console.error(data.message);
  } else {
    // Handle success
    console.log(data.result);
  }
} catch (error) {
  // Handle network errors
  console.error('Network error:', error);
}
```

## 3. Date Formatting
- Send dates in `YYYY-MM-DD` format
- API returns dates in ISO string format

## 4. Required Fields
- `tenantId`: Always required in query parameters
- `employeeid`: Required for employee-specific operations
- `calculated_by`, `approved_by`, etc.: Required for workflow operations

## 5. Status Workflow
Payroll periods follow this status flow:
1. `draft` → `calculated` → `approved` → `locked` → `paid`

## 6. Compensation Types
- `salary`: Monthly fixed salary
- `hourly`: Hourly wage with overtime
- `commission`: Commission-based earnings
- `hybrid`: Combination of salary and commission

## 7. Payment Methods
- `bank_transfer`: Bank account transfer
- `cash`: Cash payment
- `cheque`: Cheque payment
- `mobile_money`: Mobile money transfer

## 8. Ghana Tax System
The API automatically calculates:
- Progressive income tax (7 bands)
- SSNIT contributions (5.5% employee, 13% employer)
- Tier 3 pension (5% employee, 5% employer)
- NHIS (2.5% employee)

## 9. Payroll Modules Status
- ✅ **Implemented**: Compensation, Payroll Periods, Employee Payroll History
- ✅ **Fully Documented**: Attendance, Allowances & Bonuses, Deductions, Leave Management, Tax Configuration
- 📋 **Ready for Implementation**: All planned modules have complete API specifications with payload/response examples

---

# Testing Checklist

- [ ] Authentication works with valid JWT token
- [ ] All GET endpoints return expected data structures
- [ ] POST endpoints create records successfully
- [ ] PUT endpoints update records correctly
- [ ] DELETE endpoints deactivate records properly
- [ ] Error responses have appropriate status codes
- [ ] Required field validation works
- [ ] Foreign key constraints are handled properly
- [ ] Date formatting is consistent
- [ ] Workflow state transitions work correctly
- [ ] Zod validation enforces data integrity