# Commission Payments API Documentation

## Overview
The Commission Payments API provides comprehensive management for commission tracking and payments for clinician and organization services in a modular structure. Commission payments are tracked separately from individual payment transactions, allowing for detailed payment history and installment tracking.

## Commissions workspace

The `/commissions` overview groups navigation into **Review pending commissions**
(organization, clinician, and untracked records) and **Payments and reporting**
(commission payments and analytics). Each destination is a keyboard-accessible
link. The overview does not display financial totals or change payment behavior.

### Commission payment report filters

The `/commissions/commission-payments` report defaults to all recipients for the
current year. Organization and clinician filters select recipient types across
the facility, not an individual recipient. Date presets and custom ranges filter
the batch commission period (`start_date >= startDate`, `end_date <= endDate`),
not the payment timestamp. Reset restores all recipients and the current year.
Filter changes reset pagination to page 1; summary cards describe the current
page of returned batches. API failures appear as errors, not empty results.

## Database Structure

### Commission Payments Table
- **commission_payments**: Main table tracking commission amounts due for each service
  - One record per service (serviceid is unique)
  - Tracks total commission due and total amount paid
  - Status automatically managed based on payment completion

### Commission Payment Transactions Table
- **commission_payment_transactions**: Individual payment installments
  - Multiple transactions can exist per commission payment
  - Tracks each payment amount, method, and details
  - Maintains payment history and audit trail

## Base URL
```

/api/v1/commission-payments
```

## Authentication
All endpoints require proper tenant authentication via the `tenantId` query parameter.

---

## 1. Create Commission Payment
**POST** `/api/v1/commission-payments/`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier

**Body:**
```json
{
  "serviceid": 123,
  "commission_due": 150.00,
  "amount_paid": 0.00,
  "type": "clinician",
  "trackid": 456,
  "paymentmode": 1,
  "paid_by": 789
}
```

**Field Requirements:**
- `serviceid` (integer, required): Reference to dboservices.serviceid
- `commission_due` (decimal, required): Amount due for commission
- `type` (string, required): Either "clinician" or "organization"
- `amount_paid` (decimal, optional): Amount already paid (default: null)
- `trackid` (integer, optional): Test panel tracking ID
- `paymentmode` (integer, optional): Payment mode reference
- `paid_by` (integer, optional): Employee ID who made the payment

**Validation Rules:**
- System checks for existing payments for the same `serviceid`
- If existing payments exist, the sum of all `amount_paid` values cannot exceed `commission_due`
- New payment amounts are validated against the remaining balance
- Status is automatically set to `"paid"` if `amount_paid >= commission_due`, otherwise `"pending"`

### Response
**Success (201):**
```json
{
  "status": true,
  "message": "Commission payment created successfully",
  "data": {
    "paymentId": 1
  }
}
```

**Error (400/500):**
```json
{
  "status": false,
  "message": "Error message"
}
```

---

## 2. Get Commission Payment by ID
**GET** `/api/v1/commission-payments/:id`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier

**Path Parameters:**
- `id` (integer, required): Commission payment ID

### Response
**Success (200):**
```json
{
  "status": true,
  "message": "Commission payment retrieved successfully",
  "data": {
    "id": 1,
    "serviceid": 123,
    "commission_due": 150.00,
    "total_amount_paid": 0.00,
    "type": "clinician",
    "status": "pending",
    "created_at": "2025-11-25T10:00:00.000Z",
    "updated_at": "2025-11-25T10:00:00.000Z"
  }
}
```

---

## 3. Get Commission Payments by Service
**GET** `/api/v1/commission-payments/service/:serviceId`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier

**Path Parameters:**
- `serviceId` (integer, required): Service ID from dboservices

### Response
**Success (200):**
```json
{
  "status": true,
  "message": "Commission payments retrieved successfully",
  "data": [
    {
      "id": 1,
      "serviceid": 123,
      "commission_due": 150.00,
      "total_amount_paid": 150.00,
      "type": "clinician",
      "status": "paid",
      "created_at": "2025-11-25T10:00:00.000Z",
      "updated_at": "2025-11-25T10:00:00.000Z",
      "transactions": [
        {
          "id": 1,
          "commission_payment_id": 1,
          "amount_paid": 75.00,
          "trackid": 456,
          "paymentmode": 1,
          "paid_by": 789,
          "notes": "First installment",
          "created_at": "2025-11-25T10:00:00.000Z"
        },
        {
          "id": 2,
          "commission_payment_id": 1,
          "amount_paid": 75.00,
          "trackid": 456,
          "paymentmode": 1,
          "paid_by": 789,
          "notes": "Final payment",
          "created_at": "2025-11-25T11:00:00.000Z"
        }
      ]
    }
  ]
}
```

---

## 4. Get Commission Payments by Type
**GET** `/api/v1/commission-payments/type/:type`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier
- `limit` (integer, optional): Maximum number of results

**Path Parameters:**
- `type` (string, required): Either "clinician" or "organization"

### Response
**Success (200):**
```json
{
  "status": true,
  "message": "Commission payments retrieved successfully",
  "data": [
    {
      "id": 1,
      "serviceid": 123,
      "commission_due": 150.00,
      "type": "clinician",
      "status": "pending",
      "created_at": "2025-11-25T10:00:00.000Z"
    }
  ]
}
```

---

## 5. Update Commission Payment
**PUT** `/api/v1/commission-payments/:id`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier

**Path Parameters:**
- `id` (integer, required): Commission payment ID

**Body:** (any combination of updatable fields)
```json
{
  "commission_due": 175.00,
  "amount_paid": 50.00,
  "paymentmode": 2,
  "paid_by": 790
}
```

**Note:** `id`, `serviceid`, `type`, `created_at` fields cannot be updated.

### Response
**Success (200):**
```json
{
  "status": true,
  "message": "Commission payment updated successfully"
}
```

---

## 6. Update Payment Amount
**PATCH** `/api/v1/commission-payments/:id/amount`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier

**Path Parameters:**
- `id` (integer, required): Commission payment ID

**Body:**
```json
{
  "amount_paid": 150.00
}
```

### Response
**Success (200):**
```json
{
  "status": true,
  "message": "Payment amount updated successfully"
}
```

---

## 7. Update Commission Payment Status
**PATCH** `/api/v1/commission-payments/:id/status`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier

**Path Parameters:**
- `id` (integer, required): Commission payment ID

**Body:**
```json
{
  "status": "paid"
}
```

**Valid Status Values:**
- `"pending"` - Commission due but not yet paid
- `"paid"` - Commission has been fully paid
- `"overdue"` - Commission payment is past due
- `"cancelled"` - Commission payment cancelled

### Response
**Success (200):**
```json
{
  "status": true,
  "message": "Commission payment status updated successfully"
}
```

---

## 8. Get Commission Payments by Status
**GET** `/api/v1/commission-payments/status/:status`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier
- `limit` (integer, optional): Maximum number of results

**Path Parameters:**
- `status` (string, required): Status value ("pending", "paid", "overdue", "cancelled")

### Response
**Success (200):**
```json
{
  "status": true,
  "message": "Commission payments retrieved successfully",
  "data": [
    {
      "id": 1,
      "serviceid": 123,
      "commission_due": 150.00,
      "amount_paid": 0.00,
      "type": "clinician",
      "status": "pending",
      "created_at": "2025-11-25T10:00:00.000Z"
    }
  ]
}
```

---

## 9. Get Commission Payment Summary
**GET** `/api/v1/commission-payments/summary/overview`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier
- `type` (string, optional): Filter by "clinician" or "organization"

### Response
**Success (200):**
```json
{
  "status": true,
  "message": "Commission payment summary retrieved successfully",
  "data": {
    "total_commission_due": 2500.00,
    "total_amount_paid": 1500.00,
    "total_outstanding": 1000.00,
    "payment_count": 15
  }
}
```

---

## 10. Get Unpaid Commission Payments
**GET** `/api/v1/commission-payments/unpaid/list`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier
- `type` (string, optional): Filter by "clinician" or "organization"

### Response
**Success (200):**
```json
{
  "status": true,
  "message": "Unpaid commission payments retrieved successfully",
  "data": [
    {
      "id": 1,
      "serviceid": 123,
      "commission_due": 150.00,
      "amount_paid": 0.00,
      "type": "clinician",
      "status": "pending",
      "created_at": "2025-11-25T10:00:00.000Z"
    }
  ]
}
```

---

## 11. Get Commission Payments with Details
**GET** `/api/v1/commission-payments/detailed/list`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier
- `limit` (integer, optional): Maximum number of results

### Response
**Success (200):**
```json
{
  "status": true,
  "message": "Commission payments with details retrieved successfully",
  "data": [
    {
      "id": 1,
      "serviceid": 123,
      "commission_due": 150.00,
      "amount_paid": 0.00,
      "type": "clinician",
      "status": "pending",
      "serviceCategory": "CLINICIAN_SPECIAL_BILLING",
      "totalpayable": 1000.00,
      "status": "active",
      "test_name": "Complete Blood Count",
      "created_at": "2025-11-25T10:00:00.000Z"
    }
  ]
}
```

---

## 12. Delete Commission Payment
**DELETE** `/api/v1/commission-payments/:id`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier

**Path Parameters:**
- `id` (integer, required): Commission payment ID

### Response
**Success (200):**
```json
{
  "status": true,
  "message": "Commission payment deleted successfully"
}
```

---

## Error Responses

## 13. Get Commission Payment Transactions
**GET** `/api/v1/commission-payments/:commissionPaymentId/transactions`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier

**Path Parameters:**
- `commissionPaymentId` (integer, required): Commission payment ID

### Response
**Success (200):**
```json
{
  "status": true,
  "message": "Commission payment transactions retrieved successfully",
  "data": [
    {
      "id": 1,
      "commission_payment_id": 1,
      "amount_paid": 50.00,
      "trackid": 456,
      "paymentmode": 1,
      "paid_by": 789,
      "notes": "Partial payment",
      "created_at": "2025-11-25T10:00:00.000Z"
    }
  ]
}
```

---

## 14. Create Commission Payment Transaction
**POST** `/api/v1/commission-payments/transactions`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier

**Body:**
```json
{
  "commission_payment_id": 1,
  "amount_paid": 50.00,
  "trackid": 456,
  "paymentmode": 1,
  "paid_by": 789,
  "notes": "Partial payment installment"
}
```

**Field Requirements:**
- `commission_payment_id` (integer, required): Reference to commission_payments.id
- `amount_paid` (decimal, required): Amount being paid in this transaction
- `trackid` (integer, optional): Test panel tracking ID
- `paymentmode` (integer, optional): Payment mode reference
- `paid_by` (integer, optional): Employee ID who made the payment
- `notes` (string, optional): Additional notes for the transaction

### Response
**Success (201):**
```json
{
  "status": true,
  "message": "Commission payment transaction created successfully",
  "data": {
    "transactionId": 1
  }
}
```

---

## 15. Delete Commission Payment Transaction
**DELETE** `/api/v1/commission-payments/transactions/:id`

### Request
**Query Parameters:**
- `tenantId` (integer, required): Tenant identifier

**Path Parameters:**
- `id` (integer, required): Transaction ID

### Response
**Success (200):**
```json
{
  "status": true,
  "message": "Commission payment transaction deleted successfully"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "status": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes:
- `400` - Bad Request (validation errors)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (system errors)

### Common Error Messages:
- `"serviceid, commission_due, and type are required"`
- `"type must be either 'clinician' or 'organization'"`
- `"Valid payment ID is required"`
- `"Commission payment not found"`
- `"Valid status is required (pending, paid, overdue, cancelled)"`
- `"Payment amount exceeds commission due. Total paid would be [amount], but commission due is [amount]"`

---

## Data Types

### CommissionPayment Object
```typescript
interface CommissionPayment {
  id?: number;
  serviceid: number;
  commission_due: number;
  total_amount_paid: number;
  type: 'clinician' | 'organization';
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  created_at?: Date;
  updated_at?: Date;
}
```

### CommissionPaymentTransaction Object
```typescript
interface CommissionPaymentTransaction {
  id?: number;
  commission_payment_id: number;
  amount_paid: number;
  trackid?: number;
  paymentmode?: number;
  paid_by?: number;
  notes?: string;
  created_at?: Date;
}
```

### CommissionPaymentSummary Object
```typescript
interface CommissionPaymentSummary {
  total_commission_due: number;
  total_amount_paid: number;
  total_outstanding: number;
  payment_count: number;
}
```

---

## Notes

1. **Tenant Isolation**: All operations are scoped to the provided `tenantId`
2. **Foreign Keys**: `serviceid` references `dboservices.serviceid`
3. **Default Status**: New commission payments default to `"pending"` status
4. **Automatic Status Updates**: Status is automatically updated to `"paid"` when `amount_paid >= commission_due`, otherwise remains `"pending"`
5. **Immutable Fields**: `id`, `serviceid`, `type`, and `created_at` cannot be modified
6. **Cascade Delete**: Deleting a service from `dboservices` will cascade delete related commission payments

---

# Configurable Commission Engine

The legacy installment API documented above uses `/api/v1/commission-payments`. The configurable commission engine uses `/api/v1/commission` and is the API to use for commission rules, assignments, tracking, analytics, refunds, and clawbacks.

All configurable-engine requests require `tenantId` as a query parameter:

```text
/api/v1/commission/{resource}?tenantId=1
```

## Commission Rule Types

The frontend may create these `commission_type` values:

| Type | Purpose | Required configuration |
| --- | --- | --- |
| `percentage` | Percentage of the commissionable service amount | `percentage_rate` |
| `fixed` | Fixed amount per service | `fixed_component` |
| `hybrid` | Percentage plus fixed amount | `percentage_rate`, `fixed_component` |
| `tiered` | Select one tier based on service amount | `tiers` |
| `sliding_scale` | Select a rate based on current versus previous period performance | `percentage_rate`, `sliding_max_percentage`, `period_cap_reset` |
| `volume` | Select a rate based on eligible service count in a period | `tiers`, `volume_period` |
| `quota` | Select a rate based on target achievement | `quota_target`, `tiers` |
| `accelerating` | Apply progressive percentage rates to performance bands | percentage `tiers` |

## Create Commission Configuration

**POST** `/api/v1/commission/configs?tenantId=1`

### Common request fields

```json
{
  "name": "Laboratory Staff Monthly Commission",
  "description": "Commission for eligible laboratory services",
  "commission_type": "percentage",
  "commission_base": "gross",
  "percentage_rate": 8,
  "fixed_component": null,
  "min_commission": 0,
  "max_commission": 500,
  "period_cap": 5000,
  "period_cap_reset": "monthly",
  "effective_from": "2026-08-20",
  "effective_to": null,
  "is_active": true
}
```

`commission_base` supports `gross` and `outsourced_net`. The latter uses the patient charge minus the outsourced laboratory cost. Supported `period_cap_reset` and `volume_period` values are `daily`, `weekly`, `monthly`, `quarterly`, and `yearly`.

## Volume Commission

Volume tiers use the tier boundaries as service counts, not currency amounts.

```json
{
  "name": "Monthly Service Volume Commission",
  "commission_type": "volume",
  "volume_period": "monthly",
  "effective_from": "2026-08-20",
  "tiers": [
    { "min_amount_inclusive": 0, "max_amount_exclusive": 51, "tier_type": "percentage", "tier_value": 3, "sort_order": 1 },
    { "min_amount_inclusive": 51, "max_amount_exclusive": 101, "tier_type": "percentage", "tier_value": 5, "sort_order": 2 },
    { "min_amount_inclusive": 101, "max_amount_exclusive": null, "tier_type": "percentage", "tier_value": 8, "sort_order": 3 }
  ]
}
```

The engine counts distinct tracked services for the recipient and volume period, then includes the current service. A service should not be submitted repeatedly to create additional volume.

## Quota or Target Commission

Quota tiers use achievement percentage as their tier boundary. The quota metric is supplied by the caller that executes the calculation, such as paid revenue, service count, profit, or completed tests.

```json
{
  "name": "Monthly Revenue Target Commission",
  "commission_type": "quota",
  "quota_target": 100000,
  "effective_from": "2026-08-20",
  "tiers": [
    { "min_amount_inclusive": 0, "max_amount_exclusive": 80, "tier_type": "percentage", "tier_value": 0, "sort_order": 1 },
    { "min_amount_inclusive": 80, "max_amount_exclusive": 100, "tier_type": "percentage", "tier_value": 3, "sort_order": 2 },
    { "min_amount_inclusive": 100, "max_amount_exclusive": 120, "tier_type": "percentage", "tier_value": 5, "sort_order": 3 },
    { "min_amount_inclusive": 120, "max_amount_exclusive": null, "tier_type": "percentage", "tier_value": 8, "sort_order": 4 }
  ]
}
```

Achievement is calculated as `quota_value / quota_target * 100`.

## Accelerating Commission

Accelerating tiers must use percentage values. Unlike ordinary tiered commission, every matching performance segment is calculated.

```json
{
  "name": "Progressive Monthly Commission",
  "commission_type": "accelerating",
  "effective_from": "2026-08-20",
  "tiers": [
    { "min_amount_inclusive": 0, "max_amount_exclusive": 10000, "tier_type": "percentage", "tier_value": 3, "sort_order": 1 },
    { "min_amount_inclusive": 10000, "max_amount_exclusive": 20000, "tier_type": "percentage", "tier_value": 5, "sort_order": 2 },
    { "min_amount_inclusive": 20000, "max_amount_exclusive": null, "tier_type": "percentage", "tier_value": 8, "sort_order": 3 }
  ]
}
```

For a 25,000 performance amount: `10,000 * 3% + 10,000 * 5% + 5,000 * 8% = 1,200`.

## Outsourced-Test Commission

For an outsourced service, billing already stores `outsourceprice`. The backend passes that value into the commission engine when the service has `isoutsourced = 1`.

```json
{
  "name": "Outsourced Test Net Commission",
  "commission_type": "percentage",
  "commission_base": "outsourced_net",
  "percentage_rate": 10,
  "effective_from": "2026-08-20"
}
```

The calculation is `commissionable_amount = patient_charge - outsourced_lab_cost`, followed by `commission = commissionable_amount * percentage_rate / 100`. The commissionable amount cannot be negative. Tracking notes include the outsourced cost and calculated base.

## Assign a Rule

**POST** `/api/v1/commission/assignments?tenantId=1`

```json
{
  "commission_config_id": 12,
  "scope_type": "clinician",
  "scope_id": 42,
  "service_id": null,
  "service_category": "Hematology",
  "priority": 100,
  "assigned_from": "2026-08-20",
  "assigned_to": null,
  "is_active": true
}
```

Use `scope_type` values `system`, `organization`, or `clinician`. A service-specific assignment can provide `service_id`; a category assignment can provide `service_category`.

## Read Tracking and Analytics

```text
GET /api/v1/commission/tracking/:id?tenantId=1
GET /api/v1/commission/tracking/service/:serviceId?tenantId=1
GET /api/v1/commission/tracking/summary?tenantId=1&recipientType=clinician&recipientId=42
GET /api/v1/commission/tracking/recipient?tenantId=1&recipientType=clinician&recipientId=42
GET /api/v1/commission/tracking/status/pending?tenantId=1
GET /api/v1/commission/tracking/period-total?tenantId=1&recipientType=clinician&recipientId=42&periodRef=2026-08-01
```

Analytics endpoints are available under `/api/v1/commission/analytics`: `/dashboard`, `/by-period`, `/by-recipient`, `/by-status`, `/efficiency`, `/summary`, and `/recipient/:recipientId`. Analytics requests require `tenantId`, `startDate`, and `endDate`; recipient-specific reports also require `recipientType`.

## Refunds, Cancellations, Reversals, and Clawbacks

**POST** `/api/v1/commission/tracking/:trackingId/adjustments?tenantId=1`

```json
{
  "kind": "refund",
  "amount": 75,
  "reason": "Patient refund completed"
}
```

Supported `kind` values are `refund`, `cancellation`, `rejection`, `credit`, `reversal`, and `clawback`.

`amount` is optional. When omitted, the full remaining commission is adjusted. The backend creates an immutable negative tracking entry and leaves the original record unchanged. Repeating the same adjustment for the same tracking record and kind returns the existing adjustment instead of creating a duplicate.

The completed service-refund workflow automatically creates a `refund` adjustment. Frontend workflows for cancellations, rejected results, patient credits, chargebacks, and clawbacks should call this endpoint after the source event is confirmed.

## Tracking Statuses

The configurable engine uses `pending`, `approved`, `paid`, `voided`, and `adjusted`. Do not treat an `adjusted` record as payable; display it together with the original record in commission history.

## Frontend Implementation Notes

1. Use `/api/v1/commission` for new rule configuration and tracking features. Use `/api/v1/commission-payments` only for the legacy installment API.
2. Send `tenantId` on every request.
3. Store monetary values as decimal numbers and display the configured currency, currently `GHS` by default.
4. Do not edit historical tracking records to correct a commission. Create an adjustment or clawback.
5. Keep tier ranges half-open: `[min_amount_inclusive, max_amount_exclusive)`; use `null` for the final unbounded tier.
6. For quota rules, show the metric, target, actual value, achievement percentage, and selected tier in the UI.
7. For accelerating rules, show the calculation breakdown by segment rather than only one selected rate.
8. For outsourced tests, display patient charge, outsourced laboratory cost, commissionable amount, and final commission separately.
9. Refresh tracking and summary data after creating a payment, adjustment, refund, or clawback.