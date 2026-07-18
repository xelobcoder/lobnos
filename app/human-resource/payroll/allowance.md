# Allowance API Documentation

## Overview
The Allowance API manages employee allowances used during payroll calculation.

Allowances are included in payroll when they are active and overlap the payroll period dates.

## Base URL
```
/api/v1/payroll
```

## Required Query Parameter
- `tenantId` (required on all endpoints)

## Common Response Format
```json
{
  "status": "success" | "error",
  "statusCode": 200,
  "message": "optional message",
  "result": {}
}
```

## Allowance Model
```json
{
  "id": 1,
  "employeeid": 28,
  "allowance_type": "transport",
  "amount": 350,
  "calculation_method": "fixed",
  "percentage": null,
  "is_recurring": true,
  "frequency": "monthly",
  "is_taxable": true,
  "effective_from": "2026-07-01",
  "effective_to": null,
  "is_active": true,
  "approved_by": 1
}
```

## Field Rules
- `allowance_type`: one of
  - `housing`
  - `transport`
  - `meal`
  - `medical`
  - `education`
  - `uniform`
  - `mobile`
  - `hazard`
  - `shift_allowance`
  - `professional_development`
- `calculation_method`: one of `fixed`, `percentage_of_basic`, `variable`
- `percentage`: required when `calculation_method = percentage_of_basic`
- `frequency`: one of `monthly`, `quarterly`, `annually`, `one-time`
- `effective_to` must be after `effective_from` when provided
- `amount` must be greater than 0

---

## 1. Create Allowance
**POST** `/api/v1/payroll/allowances?tenantId={tenantId}`

### Request
```json
{
  "employeeid": 28,
  "allowance_type": "transport",
  "amount": 350,
  "calculation_method": "fixed",
  "is_recurring": true,
  "frequency": "monthly",
  "is_taxable": true,
  "effective_from": "2026-07-01",
  "effective_to": null,
  "is_active": true,
  "approved_by": 1
}
```

### Success Response (201)
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Allowance created successfully",
  "result": {
    "id": 9
  }
}
```

---

## 2. Get All Active Allowances
**GET** `/api/v1/payroll/allowances?tenantId={tenantId}`

Returns active allowances valid for current date.

### Success Response (200)
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 9,
      "employeeid": 28,
      "allowance_type": "transport",
      "amount": 350,
      "calculation_method": "fixed",
      "is_recurring": true,
      "frequency": "monthly",
      "is_taxable": true,
      "effective_from": "2026-07-01",
      "effective_to": null,
      "is_active": true
    }
  ]
}
```

---

## 3. Get Allowance Types
**GET** `/api/v1/payroll/allowances/types?tenantId={tenantId}`

### Success Response (200)
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

---

## 4. Get Allowances by Employee (History)
**GET** `/api/v1/payroll/allowances/employee/{employeeid}?tenantId={tenantId}`

### Success Response (200)
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 9,
      "employeeid": 28,
      "allowance_type": "transport",
      "amount": 350,
      "calculation_method": "fixed",
      "is_recurring": true,
      "frequency": "monthly",
      "is_taxable": true,
      "effective_from": "2026-07-01",
      "effective_to": null,
      "is_active": true
    }
  ]
}
```

---

## 5. Get Active Allowances by Employee
**GET** `/api/v1/payroll/allowances/employee/{employeeid}/active?tenantId={tenantId}`

Returns employee allowances active for current date.

---

## 6. Get Allowance by ID
**GET** `/api/v1/payroll/allowances/{id}?tenantId={tenantId}`

### Error Response (404)
```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Allowance record not found"
}
```

---

## 7. Update Allowance
**PUT** `/api/v1/payroll/allowances/{id}?tenantId={tenantId}`

You can send partial fields.

### Request
```json
{
  "amount": 450,
  "frequency": "monthly",
  "is_taxable": false
}
```

### Success Response (200)
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Allowance updated successfully"
}
```

---

## 8. Deactivate Allowance
**DELETE** `/api/v1/payroll/allowances/{id}?tenantId={tenantId}`

Soft deactivation (`is_active = false`).

### Success Response (200)
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Allowance deactivated successfully"
}
```

---

## Payroll Calculation Behavior (Frontend Note)
During payroll processing, allowances are included when:
- allowance `is_active = true`
- allowance date range overlaps payroll period (`effective_from <= period_end` and `effective_to is null OR effective_to >= period_start`)

### Calculation by method
- `fixed`: uses `amount`
- `percentage_of_basic`: uses `(basic_salary * percentage) / 100`
- `variable`: uses `amount`

The calculated value contributes to:
- `total_allowances`
- `gross_salary`
- `allowances_detail` in payroll transaction response

---

## Common Frontend Errors
- `400 Tenant ID is required`
- `400 Tenant ID and employee ID are required`
- `400 Tenant ID and allowance ID are required`
- `400 Failed to update allowance record`
- `404 Allowance record not found`

---

## Suggested Frontend Flow
1. Load types from `GET /allowances/types`
2. Create allowance using `POST /allowances`
3. List employee allowances using `GET /allowances/employee/{employeeid}`
4. Edit with `PUT /allowances/{id}`
5. Deactivate with `DELETE /allowances/{id}`
