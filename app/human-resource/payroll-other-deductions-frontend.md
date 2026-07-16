# Payroll Other Deductions Frontend Guide

This document describes the routes, payloads, and response shapes the frontend needs for `payroll_employee_other_deductions`.

## Important Note

The backend repository for `payroll_employee_other_deductions` exists in `src/models/payroll/DeductionRepository.ts`.

At the time of writing, these routes are **not registered** in `src/controllers/payroll/routes.ts`.

This file is the API contract the frontend can work against, and the backend should expose these routes with the same request and response shapes.

## Base URL

`/api/v1/payroll/deductions/other`

All routes require:

- `tenantId` in query string

Example:

`/api/v1/payroll/deductions/other?tenantId=3`

## Data Model

### Other Deduction Object

```json
{
  "id": 1,
  "employeeid": 123,
  "deduction_type": "loan",
  "deduction_name": "Staff Loan",
  "amount": 500,
  "is_recurring": true,
  "frequency": "monthly",
  "total_amount": 12000,
  "remaining_balance": 8500,
  "deduction_priority": 1,
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "is_active": true,
  "approved_by": 14,
  "approved_date": "2026-01-02",
  "remarks": "Recovered monthly from payroll",
  "attachments": "uploads/payroll/loan-123.pdf"
}
```

### Allowed `deduction_type` values

- `loan`
- `advance`
- `garnishment`
- `union_dues`
- `insurance`
- `cooperative`
- `welfare`
- `savings`
- `disciplinary`
- `other`

### Allowed `frequency` values

- `monthly`
- `bi-weekly`
- `weekly`
- `one-time`

## 1. Create Other Deduction

**Method**: `POST`

**URL**: `/api/v1/payroll/deductions/other?tenantId={tenantId}`

### Request Payload

```json
{
  "employeeid": 123,
  "deduction_type": "loan",
  "deduction_name": "Staff Loan",
  "amount": 500,
  "is_recurring": true,
  "frequency": "monthly",
  "total_amount": 12000,
  "remaining_balance": 12000,
  "deduction_priority": 1,
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "is_active": true,
  "approved_by": 14,
  "approved_date": "2026-01-02",
  "remarks": "Recovered monthly from payroll",
  "attachments": "uploads/payroll/loan-123.pdf"
}
```

### Required Fields

- `employeeid`
- `deduction_type`
- `deduction_name`
- `amount`
- `is_recurring`
- `frequency`
- `deduction_priority`
- `start_date`
- `is_active`

### Conditional Rules

- If `is_recurring` is `false` or `frequency` is `one-time`, `total_amount` must be provided and be greater than `0`.
- If `end_date` is provided, it must be after `start_date`.

### Success Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Other deduction created successfully",
  "result": {
    "id": 1
  }
}
```

### Error Cases

- `400` invalid payload
- `404` employee not found if backend validates employee existence
- `500` unexpected backend error

## 2. Get Deduction By ID

**Method**: `GET`

**URL**: `/api/v1/payroll/deductions/other/{id}?tenantId={tenantId}`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 1,
    "employeeid": 123,
    "deduction_type": "loan",
    "deduction_name": "Staff Loan",
    "amount": 500,
    "is_recurring": true,
    "frequency": "monthly",
    "total_amount": 12000,
    "remaining_balance": 8500,
    "deduction_priority": 1,
    "start_date": "2026-01-01",
    "end_date": "2026-12-31",
    "is_active": true,
    "approved_by": 14,
    "approved_date": "2026-01-02",
    "remarks": "Recovered monthly from payroll",
    "attachments": "uploads/payroll/loan-123.pdf"
  }
}
```

## 3. Get All Deductions For Employee

**Method**: `GET`

**URL**: `/api/v1/payroll/deductions/other/employee/{employeeid}?tenantId={tenantId}`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "employeeid": 123,
      "deduction_type": "loan",
      "deduction_name": "Staff Loan",
      "amount": 500,
      "is_recurring": true,
      "frequency": "monthly",
      "remaining_balance": 8500,
      "deduction_priority": 1,
      "start_date": "2026-01-01",
      "end_date": "2026-12-31",
      "is_active": true
    }
  ]
}
```

## 4. Get Active Deductions For Employee

**Method**: `GET`

**URL**: `/api/v1/payroll/deductions/other/employee/{employeeid}/active?tenantId={tenantId}`

This should return deductions where:

- `is_active = true`
- `start_date <= today`
- `end_date is null` or `end_date >= today`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "result": []
}
```

## 5. Get Recurring Deductions For Employee

**Method**: `GET`

**URL**: `/api/v1/payroll/deductions/other/employee/{employeeid}/recurring?tenantId={tenantId}`

This should return deductions where:

- `is_active = true`
- `is_recurring = true`
- date window is valid

## 6. Update Deduction

**Method**: `PUT`

**URL**: `/api/v1/payroll/deductions/other/{id}?tenantId={tenantId}`

### Partial Update Payload Example

```json
{
  "amount": 450,
  "remaining_balance": 8000,
  "end_date": "2026-11-30",
  "remarks": "Restructured repayment plan"
}
```

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Other deduction updated successfully"
}
```

## 7. Deactivate Deduction

**Method**: `PATCH`

**URL**: `/api/v1/payroll/deductions/other/{id}/deactivate?tenantId={tenantId}`

No request body is required by the current repository logic.

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Other deduction deactivated successfully"
}
```

## 8. Approve Deduction

**Method**: `POST`

**URL**: `/api/v1/payroll/deductions/other/{id}/approve?tenantId={tenantId}`

### Request Payload

```json
{
  "approved_by": 14
}
```

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Other deduction approved successfully"
}
```

## 9. Get Pending Approvals

**Method**: `GET`

**URL**: `/api/v1/payroll/deductions/other/pending-approvals?tenantId={tenantId}`

Returns deductions where `approved_by` is `null`.

## 10. Update Remaining Balance

**Method**: `POST`

**URL**: `/api/v1/payroll/deductions/other/{id}/apply-payment?tenantId={tenantId}`

### Request Payload

```json
{
  "payment_amount": 500
}
```

### Behavior

- Subtracts `payment_amount` from `remaining_balance`
- If `remaining_balance <= 0`, backend should set:
  - `remaining_balance = 0`
  - `is_active = false`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Remaining balance updated successfully"
}
```

## 11. Get Total Deductions By Employee And Frequency

**Method**: `GET`

**URL**: `/api/v1/payroll/deductions/other/employee/{employeeid}/total?tenantId={tenantId}&frequency=monthly`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "employeeid": 123,
    "frequency": "monthly",
    "total": 1500
  }
}
```

## 12. Get Deductions By Type

**Method**: `GET`

**URL**: `/api/v1/payroll/deductions/other/type/{deduction_type}?tenantId={tenantId}`

### Example

`/api/v1/payroll/deductions/other/type/loan?tenantId=3`

## 13. Get All Active Deductions

**Method**: `GET`

**URL**: `/api/v1/payroll/deductions/other/active?tenantId={tenantId}`

Returns all active deductions across employees.

## Frontend Validation Notes

- Always send dates as `YYYY-MM-DD`.
- `amount`, `total_amount`, `remaining_balance`, and `deduction_priority` should be numeric.
- For one-time deductions, send `frequency: "one-time"` and include `total_amount`.
- Use `remarks` for user-facing notes.
- `attachments` should be a file path or upload reference string.

## Backend Gap

Current backend repository methods exist for all the operations above, but `src/controllers/payroll/routes.ts` does not currently register these endpoints.

That means the frontend can use this file as the contract, but the backend still needs controller handlers and route wiring for these URLs before the calls will work.