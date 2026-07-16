# Payroll Employee Leave Frontend Guide

This document describes the routes, payloads, and response shapes the frontend needs for:

- `payroll_employee_leave`
- `payroll_employee_leave_balance`

## Important Note

The backend repository exists in `src/models/payroll/LeaveRepository.ts`.

These leave routes are registered in `src/controllers/payroll/routes.ts`.

This file reflects the current backend request and response shapes.

## Base URL

`/api/v1/payroll/leave`

All routes require:

- `tenantId` in query string

Example:

`/api/v1/payroll/leave?tenantId=3`

## Data Models

## Payload Rules

Frontend should send only these supported field types for leave requests:

- `employeeid`: number
- `leave_type`: string enum: `annual | sick | maternity | paternity | unpaid | study | compassionate`
- `start_date`: string in `YYYY-MM-DD`
- `end_date`: string in `YYYY-MM-DD`
- `total_days`: number greater than `0`
- `status`: string enum: `pending | approved | rejected | cancelled`
- `applied_date`: string in `YYYY-MM-DD`
- `approved_by`: number, only valid when status is `approved` or `rejected`
- `approved_date`: string in `YYYY-MM-DD`, only valid when status is `approved` or `rejected`
- `affects_salary`: boolean
- `reason`: string, optional, max length 1000
- `attachments`: string, optional, max length 500

Frontend should not send unsupported fields such as:

- `contact_details`
- `relief_officer_id`
- `handover_notes`
- `comments`
- `days_requested`
- datetime strings for `applied_date` or `approved_date`

### Leave Request Object

```json
{
  "id": 1,
  "employeeid": 123,
  "leave_type": "annual",
  "start_date": "2026-08-01",
  "end_date": "2026-08-10",
  "total_days": 10,
  "status": "pending",
  "applied_date": "2026-07-16",
  "approved_by": 14,
  "approved_date": "2026-07-18",
  "affects_salary": false,
  "reason": "Annual leave",
  "attachments": "uploads/payroll/leave-request-123.pdf"
}
```

### Leave Balance Object

```json
{
  "id": 1,
  "employeeid": 123,
  "leave_year": 2026,
  "annual_leave_entitlement": 21,
  "sick_leave_entitlement": 14,
  "annual_leave_taken": 4,
  "annual_leave_balance": 17,
  "sick_leave_taken": 2,
  "sick_leave_balance": 12
}
```

### Allowed `leave_type` values

- `annual`
- `sick`
- `maternity`
- `paternity`
- `unpaid`
- `study`
- `compassionate`

### Allowed `status` values

- `pending`
- `approved`
- `rejected`
- `cancelled`

## 1. Create Leave Request

**Method**: `POST`

**URL**: `/api/v1/payroll/leave?tenantId={tenantId}`

### Request Payload

```json
{
  "employeeid": 123,
  "leave_type": "annual",
  "start_date": "2026-08-01",
  "end_date": "2026-08-10",
  "total_days": 10,
  "status": "pending",
  "applied_date": "2026-07-16",
  "affects_salary": false,
  "reason": "Annual leave",
  "attachments": "uploads/payroll/leave-request-123.pdf"
}
```

### Required Fields

- `employeeid`
- `leave_type`
- `start_date`
- `end_date`
- `total_days`
- `status`
- `applied_date`
- `affects_salary`

### Validation Rules

- Dates must be in `YYYY-MM-DD` format.
- `end_date` must be after or equal to `start_date`.
- `total_days` must be greater than `0`.
- New frontend submissions should normally send `status: "pending"`.
- For create requests, do not send `approved_by` or `approved_date`.
- Do not send strings for numeric fields like `employeeid` or `total_days`.
- Do not send strings like `"true"` or `"false"` for `affects_salary`; send a real boolean.

### Success Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Leave request created successfully",
  "result": {
    "id": 1
  }
}
```

## 2. Get Leave By ID

**Method**: `GET`

**URL**: `/api/v1/payroll/leave/{id}?tenantId={tenantId}`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 1,
    "employeeid": 123,
    "leave_type": "annual",
    "start_date": "2026-08-01",
    "end_date": "2026-08-10",
    "total_days": 10,
    "status": "pending",
    "applied_date": "2026-07-16",
    "affects_salary": false,
    "reason": "Annual leave",
    "attachments": "uploads/payroll/leave-request-123.pdf"
  }
}
```

## 3. Get Leaves By Employee

**Method**: `GET`

**URL**: `/api/v1/payroll/leave/employee/{employeeid}?tenantId={tenantId}`

Returns all leave records for the employee, ordered by `applied_date desc`.

## 4. Get Leaves By Status

**Method**: `GET`

**URL**: `/api/v1/payroll/leave/status/{status}?tenantId={tenantId}`

### Example

`/api/v1/payroll/leave/status/pending?tenantId=3`

## 5. Get Leaves By Date Range

**Method**: `GET`

**URL**: `/api/v1/payroll/leave?tenantId={tenantId}&startDate=2026-08-01&endDate=2026-08-31`

This should return leave requests where:

- `start_date` falls within range, or
- `end_date` falls within range, or
- leave spans across the entire range

## 6. Update Leave Request

**Method**: `PUT`

**URL**: `/api/v1/payroll/leave/{id}?tenantId={tenantId}`

### Partial Update Payload Example

```json
{
  "end_date": "2026-08-12",
  "total_days": 12,
  "reason": "Extended by two days"
}
```

Supported update fields are only:

- `leave_type`
- `start_date`
- `end_date`
- `total_days`
- `status`
- `applied_date`
- `approved_by`
- `approved_date`
- `affects_salary`
- `reason`
- `attachments`

The frontend must treat this as a partial update route and must not send `status`, `approved_by`, or `approved_date` when editing a leave request. Use the dedicated approve and reject routes for approval workflow changes.

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Leave request updated successfully"
}
```

## 7. Approve Leave

**Method**: `POST`

**URL**: `/api/v1/payroll/leave/{id}/approve?tenantId={tenantId}`

### Request Payload

```json
{
  "approved_by": 14
}
```

Only `approved_by` is needed here. Backend sets `approved_date` automatically.

### Behavior

- Sets leave status to `approved`
- Sets `approved_by`
- Sets `approved_date` to today
- If leave type is `annual` or `sick`, updates `payroll_employee_leave_balance`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Leave request approved successfully"
}
```

## 8. Reject Leave

**Method**: `POST`

**URL**: `/api/v1/payroll/leave/{id}/reject?tenantId={tenantId}`

### Request Payload

```json
{
  "approved_by": 14
}
```

Only `approved_by` is needed here. Backend sets `approved_date` automatically.

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Leave request rejected successfully"
}
```

## 9. Cancel Leave

**Method**: `POST`

**URL**: `/api/v1/payroll/leave/{id}/cancel?tenantId={tenantId}`

### Behavior

- Only approved leave can be cancelled by current repository logic
- Changes status to `cancelled`
- Restores leave balance for `annual` and `sick` leave

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Leave request cancelled successfully"
}
```

## 10. Get Leave Balance By Employee And Year

**Method**: `GET`

**URL**: `/api/v1/payroll/leave/balance/{employeeid}?tenantId={tenantId}&year=2026`

This route requires `year` as a numeric query parameter.

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 1,
    "employeeid": 123,
    "leave_year": 2026,
    "annual_leave_entitlement": 21,
    "sick_leave_entitlement": 14,
    "annual_leave_taken": 4,
    "annual_leave_balance": 17,
    "sick_leave_taken": 2,
    "sick_leave_balance": 12
  }
}
```

## 11. Initialize Leave Balance For Year

**Method**: `POST`

**URL**: `/api/v1/payroll/leave/balance/initialize?tenantId={tenantId}`

### Request Payload

```json
{
  "employeeid": 123,
  "year": 2026
}
```

Supported payload types:

- `employeeid`: number
- `year`: number

### Behavior

- If balance already exists, returns existing balance id
- Otherwise creates default balance:
  - `annual_leave_entitlement = 21`
  - `sick_leave_entitlement = 14`
  - taken values = `0`

### Success Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Leave balance initialized successfully",
  "result": {
    "id": 1
  }
}
```

## 12. Update Leave Balance

**Method**: `PUT`

**URL**: `/api/v1/payroll/leave/balance/{id}?tenantId={tenantId}`

### Partial Update Payload Example

```json
{
  "annual_leave_entitlement": 24,
  "annual_leave_balance": 20,
  "sick_leave_entitlement": 16,
  "sick_leave_balance": 14
}
```

Supported leave balance update fields:

- `employeeid`
- `leave_year`
- `annual_leave_entitlement`
- `sick_leave_entitlement`
- `annual_leave_taken`
- `annual_leave_balance`
- `sick_leave_taken`
- `sick_leave_balance`

All balance number fields must be numbers, not strings.

## 13. Get Employees On Leave For Date

**Method**: `GET`

**URL**: `/api/v1/payroll/leave/on-date?tenantId={tenantId}&date=2026-08-05`

Returns approved leave records where:

- `start_date <= date`
- `end_date >= date`

## 14. Get Leave Summary For Employee

**Method**: `GET`

**URL**: `/api/v1/payroll/leave/employee/{employeeid}/summary?tenantId={tenantId}&year=2026`

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "total_annual_taken": 4,
    "total_sick_taken": 2,
    "total_unpaid_taken": 0,
    "total_other_taken": 1
  }
}
```

## 15. Leave Analytics Route Already Present

The following route already exists in `src/controllers/payroll/routes.ts`:

- `GET /api/v1/payroll/analytics/leave?tenantId={tenantId}&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

That route is analytics only. It is not a substitute for leave CRUD operations.

## Frontend Validation Notes

- Always send dates as `YYYY-MM-DD`.
- `approved_by` is required when approving or rejecting leave.
- For approved/rejected records, `approved_date` is set by backend logic.
- `affects_salary` should be explicitly sent as `true` or `false`.
- `attachments` should be a file path or upload reference string.
- `startDate`, `endDate`, `date`, and `year` query values must be present for the routes that require them.
- The generic `GET /leave` route is only for date-range queries and requires both `startDate` and `endDate`.

## Route Coverage

The routes documented in this file match the leave CRUD and leave balance endpoints currently registered in `src/controllers/payroll/routes.ts`.