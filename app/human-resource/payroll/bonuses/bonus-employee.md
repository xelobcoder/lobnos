# Employee Bonus Frontend Guide

This document describes the routes, payloads, response shapes, and suggested page structure for managing employee bonuses.

## Important Note

The backend repository exists in `src/models/payroll/AllowanceBonusRepository.ts`.

The bonus controller exists in `src/controllers/payroll/bonusController.ts`.

These routes are registered in `src/controllers/payroll/routes.ts`.

## Base URL

`/api/v1/payroll/bonuses`

All routes require:

- `tenantId` in query string

Example:

`/api/v1/payroll/bonuses?tenantId=3`

## Data Model

### Bonus Object

```json
{
  "id": 1,
  "employeeid": 23,
  "bonus_type": "performance",
  "amount": 500,
  "bonus_period": "2026-Q3",
  "is_taxable": true,
  "tax_method": "aggregate",
  "status": "pending",
  "approved_by": 7,
  "approved_date": "2026-07-17",
  "reason": "Strong quarterly performance",
  "performance_rating": 5,
  "payment_date": "2026-07-31",
  "payroll_period_id": 12
}
```

### Allowed `bonus_type` values

- `performance`
- `annual`
- `project`
- `retention`
- `holiday`
- `spot`

### Allowed `tax_method` values

- `aggregate`
- `separate`
- `bonus_rate`

### Allowed `status` values

- `pending`
- `approved`
- `rejected`
- `paid`

## Suggested Frontend Page Structure

### 1. Bonus List Section

Show all bonuses for a selected employee.

Recommended columns:

- bonus type
- amount
- bonus period
- tax method
- status
- performance rating
- approved date
- payment date
- actions

### 2. Create Bonus Form

Recommended fields:

- employee selector or hidden `employeeid` if already in employee context
- bonus type select
- amount input
- bonus period input
- taxable toggle
- tax method select
- status select
- reason textarea
- performance rating select or number input

### 3. Edit Bonus Drawer or Modal

Allow updating:

- amount
- bonus period
- taxable flag
- tax method
- status
- reason
- performance rating
- approved fields when status changes to `approved`, `rejected`, or `paid`

### 4. Delete Action

Allow delete only for non-paid bonuses.

The backend blocks deleting a record where `status = paid`.

## 1. Create Bonus

**Method**: `POST`

**URL**: `/api/v1/payroll/bonuses?tenantId={tenantId}`

### Request Payload

```json
{
  "employeeid": 23,
  "bonus_type": "performance",
  "amount": 500,
  "bonus_period": "2026-Q3",
  "is_taxable": true,
  "tax_method": "aggregate",
  "status": "pending",
  "reason": "Strong quarterly performance",
  "performance_rating": 5
}
```

### Required Fields

- `employeeid`
- `bonus_type`
- `amount`
- `is_taxable`
- `tax_method`
- `status`

### Conditional Rules

- if `status` is `approved`, `rejected`, or `paid`, send `approved_by`
- if `status` is `approved`, `rejected`, or `paid`, send `approved_date` in `YYYY-MM-DD`
- if `status` is `paid`, it is good practice to also send `payment_date`
- if `performance_rating` is sent, it must be between `1` and `5`

### Success Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Bonus created successfully",
  "result": {
    "id": 1
  }
}
```

## 2. Get Bonuses By Employee

**Method**: `GET`

**URL**: `/api/v1/payroll/bonuses/employee/{employeeid}?tenantId={tenantId}`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "employeeid": 23,
      "bonus_type": "performance",
      "amount": 500,
      "bonus_period": "2026-Q3",
      "is_taxable": true,
      "tax_method": "aggregate",
      "status": "pending",
      "reason": "Strong quarterly performance",
      "performance_rating": 5
    }
  ]
}
```

## 3. Get Bonus By ID

**Method**: `GET`

**URL**: `/api/v1/payroll/bonuses/{id}?tenantId={tenantId}`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 1,
    "employeeid": 23,
    "bonus_type": "performance",
    "amount": 500,
    "bonus_period": "2026-Q3",
    "is_taxable": true,
    "tax_method": "aggregate",
    "status": "pending",
    "reason": "Strong quarterly performance",
    "performance_rating": 5
  }
}
```

## 4. Update Bonus

**Method**: `PUT`

**URL**: `/api/v1/payroll/bonuses/{id}?tenantId={tenantId}`

### Partial Update Payload Example

```json
{
  "amount": 650,
  "status": "approved",
  "approved_by": 7,
  "approved_date": "2026-07-17",
  "reason": "Approved after manager review"
}
```

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Bonus updated successfully"
}
```

## 5. Delete Bonus

**Method**: `DELETE`

**URL**: `/api/v1/payroll/bonuses/{id}?tenantId={tenantId}`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Bonus deleted successfully"
}
```

### Important Delete Rule

- paid bonuses cannot be deleted

### Expected Error Case For Paid Bonus

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Paid bonuses cannot be deleted"
}
```

## Frontend Validation Tips

- keep `amount` numeric and greater than `0`
- use `YYYY-MM-DD` for `approved_date` and `payment_date`
- hide approval fields unless the status requires them
- only show delete for bonuses that are not `paid`
- if `bonus_type = performance`, prefer showing `performance_rating`

## Suggested API Flow

1. Load employee bonuses with `GET /bonuses/employee/{employeeid}`.
2. Open create form and submit to `POST /bonuses`.
3. Refresh the list after success.
4. Open edit modal and submit changes to `PUT /bonuses/{id}`.
5. Allow delete only when status is not `paid`.

## Common Error Cases

- `400` tenantId missing
- `400` invalid payload shape
- `400` approved fields missing for approved, rejected, or paid bonus states
- `404` bonus not found
- `500` unexpected backend error