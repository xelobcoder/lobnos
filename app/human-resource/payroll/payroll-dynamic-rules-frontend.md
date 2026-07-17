# Payroll Dynamic Rules Frontend Guide

This document describes the new payroll additions for:

- dynamic tax reliefs and exemptions
- dynamic deduction definitions
- employee other deductions using those definitions
- role-based salary grade mapping
- payroll calculation changes for tax and NHIS

## Summary Of What Changed

1. Income tax is now calculated directly from the configured monthly tax bands in the active tax configuration.
2. Hard-coded NHIS has been removed from payroll calculation. `nhis` now resolves to `0` unless you later introduce a dynamic deduction definition and apply it through employee deductions.
3. Fixed tax relief fields are no longer the only source of truth. You can now create dynamic tax relief rows and attach them to a tax configuration.
4. Other payroll deductions are no longer limited to a fixed enum in practice. You can create deduction definitions and then assign them to employees.
5. Salary grades can now be mapped to roles that already exist in the `roles` table.

## Base URL

`/api/v1/payroll`

All routes require:

- `tenantId` in query string

Example:

`/api/v1/payroll/tax-reliefs?tenantId=3`

## MySQL Schema SQL

The backend migration is implemented in:

`src/cron/command-line-tool-database/migrations/20260716_dynamic_payroll_rules.ts`

Equivalent MySQL SQL is below.

### 1. Create `payroll_tax_reliefs`

```sql
CREATE TABLE payroll_tax_reliefs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tax_configuration_id INT UNSIGNED NULL,
  relief_code VARCHAR(100) NULL,
  relief_name VARCHAR(150) NOT NULL,
  calculation_method ENUM('fixed', 'per_dependent', 'percentage_of_gross') NOT NULL DEFAULT 'fixed',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  requires_disability TINYINT(1) NOT NULL DEFAULT 0,
  created_by INT UNSIGNED NULL,
  updated_by INT UNSIGNED NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Create `payroll_deduction_definitions`

```sql
CREATE TABLE payroll_deduction_definitions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  deduction_code VARCHAR(100) NOT NULL UNIQUE,
  deduction_name VARCHAR(150) NOT NULL,
  default_calculation_method ENUM('fixed_amount', 'percentage_of_gross') NOT NULL DEFAULT 'fixed_amount',
  default_amount DECIMAL(12,2) NULL,
  is_statutory TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by INT UNSIGNED NULL,
  updated_by INT UNSIGNED NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. Alter `payroll_employee_other_deductions`

```sql
ALTER TABLE payroll_employee_other_deductions
ADD COLUMN deduction_definition_id INT UNSIGNED NULL AFTER employeeid;
```

### 4. Alter `payroll_salary_grades`

```sql
ALTER TABLE payroll_salary_grades
ADD COLUMN role_name VARCHAR(100) NULL AFTER grade_level;
```

## Tax Relief Logic

When dynamic tax relief rows exist for the active tax configuration, payroll tax uses those rows.

If no dynamic tax relief rows exist, the system falls back to the older fields in the tax configuration table:

- `standard_exemption`
- `dependent_relief`
- `disability_exemption`

### Supported `calculation_method` values for tax reliefs

- `fixed`
- `per_dependent`
- `percentage_of_gross`

### Tax Relief Interpretation

- `fixed`: deduct this amount from gross income before tax
- `per_dependent`: multiply `amount` by dependent count
- `percentage_of_gross`: deduct `grossIncome * (amount / 100)`
- `requires_disability = true`: only apply when employee is marked disabled in the tax calculation call

## Deduction Definition Logic

Deduction definitions are reusable master records.

They allow the frontend or admins to define payroll deductions such as:

- housing levy
- welfare fund
- staff loan recovery
- transport recovery
- company insurance
- union dues

Each employee deduction can optionally reference a deduction definition through `deduction_definition_id`.

When `deduction_definition_id` is sent:

- the backend fetches the definition
- `deduction_type` defaults to `deduction_code` if omitted
- `deduction_name` defaults to `deduction_name` from the definition if omitted

## NHIS Change

The payroll engine no longer applies a hard-coded NHIS percentage.

Current behavior:

- payroll transaction field `nhis` remains in the response shape for backward compatibility
- value is now `0`
- if you need NHIS-like recovery later, create a deduction definition and assign it to employees as an `other deduction`

## Salary Grade Role Mapping

Salary grades can now carry `role_name`.

Rules:

- `role_name` must already exist in the `roles.role` column
- only one active salary grade should exist for a given role
- if `grade_name` is omitted at creation time, the backend will use `role_name`

The frontend can fetch valid roles from:

`GET /api/v1/payroll/salary-grades/roles?tenantId={tenantId}`

## Route Index

### Tax Relief Routes

- `POST /api/v1/payroll/tax-reliefs?tenantId={tenantId}`
- `GET /api/v1/payroll/tax-reliefs?tenantId={tenantId}`
- `GET /api/v1/payroll/tax-reliefs/{id}?tenantId={tenantId}`
- `PUT /api/v1/payroll/tax-reliefs/{id}?tenantId={tenantId}`
- `DELETE /api/v1/payroll/tax-reliefs/{id}?tenantId={tenantId}`

### Deduction Definition Routes

- `POST /api/v1/payroll/deduction-definitions?tenantId={tenantId}`
- `GET /api/v1/payroll/deduction-definitions?tenantId={tenantId}`
- `GET /api/v1/payroll/deduction-definitions/{id}?tenantId={tenantId}`
- `PUT /api/v1/payroll/deduction-definitions/{id}?tenantId={tenantId}`
- `DELETE /api/v1/payroll/deduction-definitions/{id}?tenantId={tenantId}`

### Employee Other Deduction Routes

- `POST /api/v1/payroll/other-deductions?tenantId={tenantId}`
- `GET /api/v1/payroll/other-deductions?tenantId={tenantId}`
- `GET /api/v1/payroll/other-deductions/employee/{employeeid}?tenantId={tenantId}`
- `GET /api/v1/payroll/other-deductions/{id}?tenantId={tenantId}`
- `PUT /api/v1/payroll/other-deductions/{id}?tenantId={tenantId}`
- `DELETE /api/v1/payroll/other-deductions/{id}?tenantId={tenantId}`
- `POST /api/v1/payroll/other-deductions/{id}/approve?tenantId={tenantId}`

### Salary Grade Role Route

- `GET /api/v1/payroll/salary-grades/roles?tenantId={tenantId}`

## 1. Create Tax Relief

**Method**: `POST`

**URL**: `/api/v1/payroll/tax-reliefs?tenantId={tenantId}`

### Request Payload

```json
{
  "tax_configuration_id": 4,
  "relief_code": "DEPENDENT_RELIEF",
  "relief_name": "Dependent Relief",
  "calculation_method": "per_dependent",
  "amount": 100,
  "is_active": true,
  "requires_disability": false,
  "created_by": 7
}
```

### Fields

- `tax_configuration_id` optional, if omitted the relief can behave like a global relief row
- `relief_code` optional short code
- `relief_name` required
- `calculation_method` required
- `amount` required
- `is_active` required
- `requires_disability` required

### Success Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Tax relief created successfully",
  "result": {
    "id": 1
  }
}
```

## 2. Get Tax Reliefs

**Method**: `GET`

**URL**: `/api/v1/payroll/tax-reliefs?tenantId={tenantId}&activeOnly=true`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "tax_configuration_id": 4,
      "relief_code": "DEPENDENT_RELIEF",
      "relief_name": "Dependent Relief",
      "calculation_method": "per_dependent",
      "amount": 100,
      "is_active": true,
      "requires_disability": false
    }
  ]
}
```

## 3. Update Tax Relief

**Method**: `PUT`

**URL**: `/api/v1/payroll/tax-reliefs/{id}?tenantId={tenantId}`

### Partial Payload Example

```json
{
  "amount": 120,
  "is_active": true,
  "updated_by": 7
}
```

## 4. Deactivate Tax Relief

**Method**: `DELETE`

**URL**: `/api/v1/payroll/tax-reliefs/{id}?tenantId={tenantId}`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Tax relief deactivated successfully"
}
```

## 5. Create Deduction Definition

**Method**: `POST`

**URL**: `/api/v1/payroll/deduction-definitions?tenantId={tenantId}`

### Request Payload

```json
{
  "deduction_code": "HOUSING_LEVY",
  "deduction_name": "Housing Levy",
  "default_calculation_method": "fixed_amount",
  "default_amount": 75,
  "is_statutory": false,
  "is_active": true,
  "created_by": 7
}
```

### Fields

- `deduction_code` required and should be unique
- `deduction_name` required
- `default_calculation_method` required
- `default_amount` optional
- `is_statutory` required
- `is_active` required

### Allowed `default_calculation_method` values

- `fixed_amount`
- `percentage_of_gross`

## 6. Get Deduction Definitions

**Method**: `GET`

**URL**: `/api/v1/payroll/deduction-definitions?tenantId={tenantId}&activeOnly=true`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "deduction_code": "HOUSING_LEVY",
      "deduction_name": "Housing Levy",
      "default_calculation_method": "fixed_amount",
      "default_amount": 75,
      "is_statutory": false,
      "is_active": true
    }
  ]
}
```

## 7. Update Deduction Definition

**Method**: `PUT`

**URL**: `/api/v1/payroll/deduction-definitions/{id}?tenantId={tenantId}`

### Partial Payload Example

```json
{
  "deduction_name": "Revised Housing Levy",
  "default_amount": 90,
  "updated_by": 7
}
```

## 8. Deactivate Deduction Definition

**Method**: `DELETE`

**URL**: `/api/v1/payroll/deduction-definitions/{id}?tenantId={tenantId}`

## 9. Create Employee Other Deduction

**Method**: `POST`

**URL**: `/api/v1/payroll/other-deductions?tenantId={tenantId}`

### Request Payload Using A Definition

```json
{
  "employeeid": 23,
  "deduction_definition_id": 1,
  "amount": 75,
  "is_recurring": true,
  "frequency": "monthly",
  "deduction_priority": 1,
  "start_date": "2026-07-01",
  "is_active": true,
  "remarks": "Monthly housing levy"
}
```

### Request Payload Without A Definition

```json
{
  "employeeid": 23,
  "deduction_type": "custom_recovery",
  "deduction_name": "Device Recovery",
  "amount": 150,
  "is_recurring": false,
  "frequency": "one-time",
  "total_amount": 150,
  "remaining_balance": 150,
  "deduction_priority": 2,
  "start_date": "2026-07-16",
  "is_active": true,
  "remarks": "One-time device recovery"
}
```

### Required Fields

- `employeeid`
- `amount`
- `is_recurring`
- `frequency`
- `deduction_priority`
- `start_date`
- `is_active`
- either `deduction_definition_id` or both `deduction_type` and `deduction_name`

### Allowed `frequency` values

- `monthly`
- `bi-weekly`
- `weekly`
- `one-time`

### Conditional Rules

- if `deduction_definition_id` is supplied, `deduction_type` and `deduction_name` may be omitted
- if `is_recurring` is `false` or `frequency` is `one-time`, `total_amount` must be greater than `0`
- if `end_date` is supplied, it must be after `start_date`

### Success Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Other deduction created successfully",
  "result": {
    "id": 4
  }
}
```

## 10. Get Other Deductions

**Method**: `GET`

**URL**: `/api/v1/payroll/other-deductions?tenantId={tenantId}&activeOnly=true`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 4,
      "employeeid": 23,
      "deduction_definition_id": 1,
      "deduction_type": "HOUSING_LEVY",
      "deduction_name": "Housing Levy",
      "amount": 75,
      "is_recurring": true,
      "frequency": "monthly",
      "deduction_priority": 1,
      "start_date": "2026-07-01",
      "is_active": true,
      "remarks": "Monthly housing levy"
    }
  ]
}
```

## 11. Get Deductions By Employee

**Method**: `GET`

**URL**: `/api/v1/payroll/other-deductions/employee/{employeeid}?tenantId={tenantId}`

## 12. Update Other Deduction

**Method**: `PUT`

**URL**: `/api/v1/payroll/other-deductions/{id}?tenantId={tenantId}`

### Partial Payload Example

```json
{
  "amount": 90,
  "remarks": "Adjusted monthly amount",
  "updated_by": 7
}
```

## 13. Approve Other Deduction

**Method**: `POST`

**URL**: `/api/v1/payroll/other-deductions/{id}/approve?tenantId={tenantId}`

### Request Payload

```json
{
  "approved_by": 7
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

## 14. Get Salary Grade Roles

**Method**: `GET`

**URL**: `/api/v1/payroll/salary-grades/roles?tenantId={tenantId}`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    "admin",
    "manager",
    "scientist",
    "sonographer"
  ]
}
```

## 15. Create Salary Grade With Role Mapping

**Method**: `POST`

**URL**: `/api/v1/payroll/salary-grades?tenantId={tenantId}`

### Request Payload

```json
{
  "grade_name": "Senior Scientist Grade",
  "grade_level": "L4",
  "role_name": "scientist",
  "min_salary": 3500,
  "max_salary": 6000,
  "description": "Salary grade for scientist role",
  "currency": "GHS",
  "is_active": true
}
```

### Rules

- `role_name` should match an existing value in `roles.role`
- only one active salary grade per role should exist
- if `grade_name` is omitted, backend may derive it from `role_name`

## Common Error Cases

- `400` invalid payload or missing required field
- `404` resource not found
- `500` unexpected server error

Examples:

- creating a salary grade for a role that does not exist
- creating an employee deduction with an inactive `deduction_definition_id`
- creating a tax relief with invalid `calculation_method`
- sending `frequency = one-time` without `total_amount`

## Recommended Frontend Flow

1. Fetch active tax configuration.
2. Create or manage tax relief rows for that configuration.
3. Create deduction definitions for reusable payroll deductions.
4. Assign deductions to employees through `other-deductions`.
5. Fetch `/salary-grades/roles` before creating salary grades.
6. Use role-based salary grades when creating or updating compensation structures.

## Notes For Integration

- Existing responses still include `nhis` in payroll transaction results, but the value is now `0`.
- Dynamic tax reliefs take precedence over the older tax configuration relief fields when active rows exist.
- Other deductions now support free-form deduction types or reusable master definitions.
