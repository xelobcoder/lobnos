# Payroll Loan Adjustment API (Frontend Guide)

## Overview
Use this endpoint when a loan deduction already has repayment history and balance cannot be edited directly via update endpoint.

This API creates an audited `manual_adjustment` ledger entry and updates remaining balance safely.

## Endpoint
`POST /api/v1/payroll/deductions/other/{id}/loan-adjustment?tenantId={tenantId}`

## Path Params
- `id`: deduction ID (must be a loan deduction)

## Query Params
- `tenantId`: required

## Request Payload
```json
{
  "adjustment_amount": 500,
  "adjustment_action": "decrease_balance",
  "adjusted_by": 3,
  "reason": "Loan restructuring approved"
}
```

## Payload Rules
- `adjustment_amount`: positive number
- `adjustment_action`: `increase_balance` or `decrease_balance`
- `adjusted_by`: employee ID performing adjustment
- `reason`: non-empty string

## Success Response (201)
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Loan adjustment recorded successfully",
  "result": {
    "old_balance": 3000,
    "new_balance": 2500,
    "ledger_entry_id": 18
  }
}
```

## Error Responses
### Validation / Business Error (400)
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "adjustment_action must be increase_balance or decrease_balance"
}
```

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Adjustment would make remaining balance negative"
}
```

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Loan adjustments are only allowed for deductions of type loan"
}
```

### Not Found (404)
```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Other deduction record not found"
}
```

## Frontend Integration Notes
1. When update endpoint returns repayment-history conflict, show CTA: "Create Loan Adjustment".
2. Open adjustment modal with action, amount, reason.
3. Submit to loan-adjustment endpoint.
4. Refresh deduction details and ledger list after success.
5. Show `old_balance -> new_balance` in toast/snackbar.

## Related Endpoints
- `PUT /api/v1/payroll/deductions/other/{id}` (regular updates; blocks balance edits after repayment history)
- `GET /api/v1/payroll/deductions/other/{id}/ledger` (view repayment + manual adjustment history)
