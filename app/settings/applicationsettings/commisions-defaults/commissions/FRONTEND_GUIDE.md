# Commission Engine - Frontend Integration Guide

## Overview

The Commission Engine automatically calculates clinician and organization commissions when services are billed and completed. The frontend doesn't need to manually trigger commission calculations—they happen automatically during the billing submission process.

## What the Frontend Needs to Know

### 1. Commission Calculations Are Automatic

**When services are billed:**

- Services are inserted into the database (`dboservices` table)
- Commission is automatically calculated based on the service amount and assigned configuration
- Results are stored in the `commission_tracking` table (immutable ledger)

**No frontend action needed** for basic commission flow—it all happens server-side.

### 2. Complete API Reference

#### Commission Configurations

**Create Configuration:**

```javascript
POST /api/v1/commission/configs
Content-Type: application/json

{
  "tenantId": 1,
  "name": "Specialist Doctor Commission",
  "commission_type": "percentage",
  "percentage_rate": 10,
  "fixed_component": null,
  "min_commission": 5,
  "max_commission": 500,
  "period_cap": 1000,
  "period_cap_reset": "monthly",
  "effective_from": "2026-01-01",
  "effective_to": "2026-12-31",
  "is_active": true
}
```

**Get All Configurations:**

```javascript
GET /api/v1/commission/configs?tenantId={tenantId}
```

**Get Specific Configuration:**

```javascript
GET /api/v1/commission/configs/{id}?tenantId={tenantId}
```

**Update Configuration:**

```javascript
PUT /api/v1/commission/configs/{id}?tenantId={tenantId}
```

**Delete Configuration:**

```javascript
DELETE /api/v1/commission/configs/{id}?tenantId={tenantId}
```

#### Commission Assignments

**Create Assignment:**

```javascript
POST /api/v1/commission/assignments
Content-Type: application/json

{
  "tenantId": 1,
  "commission_config_id": 1,
  "scope_type": "clinician",
  "scope_id": 42,
  "service_id": null,
  "service_category": null,
  "priority": 100,
  "assigned_from": "2026-01-01",
  "assigned_to": "2026-12-31",
  "is_active": true
}
```

**Get Assignments:**

```javascript
GET /api/v1/commission/assignments?tenantId={tenantId}&commission_config_id={configId}
```

**Resolve Assignment for Service:**

```javascript
GET /api/v1/commission/assignments/resolve?tenantId={tenantId}&service_id={serviceId}&clinician_id={clinicianId}&organization_id={orgId}
```

**Get Specific Assignment:**

```javascript
GET /api/v1/commission/assignments/{id}?tenantId={tenantId}
```

**Update Assignment:**

```javascript
PUT /api/v1/commission/assignments/{id}?tenantId={tenantId}
```

**Delete Assignment:**

```javascript
DELETE /api/v1/commission/assignments/{id}?tenantId={tenantId}
```

#### Commission Tracking

**Get Unpaid Commissions:**

```javascript
GET /api/v1/commission/tracking/unpaid?tenantId={tenantId}&recipientType=clinician&recipientId={clinicianId}&limit=100
```

**Get Commission Summary:**

```javascript
GET /api/v1/commission/tracking/summary?tenantId={tenantId}&recipientType=clinician&recipientId={clinicianId}
```

**Get Tracking by Status:**

```javascript
GET /api/v1/commission/tracking/status/{status}?tenantId={tenantId}&recipientType=clinician&recipientId={clinicianId}
```

**Get Tracking by Recipient:**

```javascript
GET /api/v1/commission/tracking/recipient?tenantId={tenantId}&recipientType=clinician&recipientId={clinicianId}
```

**Get Period Total:**

```javascript
GET /api/v1/commission/tracking/period-total?tenantId={tenantId}&recipientType=clinician&recipientId={clinicianId}&period=monthly
```

**Get Service Tracking:**

```javascript
GET /api/v1/commission/tracking/service/{serviceId}?tenantId={tenantId}
```

**Update Commission Status:**

```javascript
PUT /api/v1/commission/tracking/{id}/status?tenantId={tenantId}
Content-Type: application/json

{
  "status": "approved",
  "notes": "Approved for payment"
}
```

#### Commission Defaults

**Create Default:**

```javascript
POST /api/v1/commission/defaults
Content-Type: application/json

{
  "tenantId": 1,
  "recipient_type": "clinician",
  "recipient_id": 99,
  "commission_config_id": 2,
  "is_active": true
}
```

**Get Default:**

```javascript
GET /api/v1/commission/defaults?tenantId={tenantId}&recipient_type=clinician&recipient_id={id}
```

**Get Defaults by Type:**

```javascript
GET /api/v1/commission/defaults/type/{recipientType}?tenantId={tenantId}
```

**Update Default:**

```javascript
PUT /api/v1/commission/defaults/{id}?tenantId={tenantId}
```

**Delete Default:**

```javascript
DELETE /api/v1/commission/defaults/{id}?tenantId={tenantId}
```

## Configuration Management (Admin UI)

### Creating a Commission Configuration

**Endpoint:**

```javascript
POST /api/v1/commission/configs
Content-Type: application/json

{
  "tenantId": 1,
  "name": "Specialist Doctor Commission",
  "commission_type": "percentage",
  "percentage_rate": 10,
  "fixed_component": null,
  "min_commission": 5,
  "max_commission": 500,
  "period_cap": 1000,
  "period_cap_reset": "monthly",
  "effective_from": "2026-01-01",
  "effective_to": "2026-12-31",
  "is_active": true
}
```

**Response:**

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Commission configuration created successfully",
  "result": {
    "id": 1,
    "name": "Specialist Doctor Commission",
    "commission_type": "percentage",
    ...
  }
}
```

### Creating Tiered Configuration

For amount-based tier commissions (e.g., 5% for < 500 GHS, 8% for 500-1000 GHS):

**Endpoint:**

```javascript
POST /api/v1/commission/configs
Content-Type: application/json

{
  "tenantId": 1,
  "name": "High Volume Sales Commission",
  "commission_type": "tiered",
  "min_commission": 10,
  "max_commission": 1000,
  "period_cap": 5000,
  "period_cap_reset": "monthly",
  "tiers": [
    {
      "min_amount_inclusive": 0,
      "max_amount_exclusive": 500,
      "tier_type": "percentage",
      "tier_value": 5,
      "sort_order": 1
    },
    {
      "min_amount_inclusive": 500,
      "max_amount_exclusive": 1000,
      "tier_type": "percentage",
      "tier_value": 8,
      "sort_order": 2
    },
    {
      "min_amount_inclusive": 1000,
      "max_amount_exclusive": null,
      "tier_type": "percentage",
      "tier_value": 10,
      "sort_order": 3
    }
  ]
}
```

### Assigning Commission to Clinician

Assign a specific commission config to a clinician (overrides organization/system defaults):

**Endpoint:**

```javascript
POST /api/v1/commission/assignments
Content-Type: application/json

{
  "tenantId": 1,
  "commission_config_id": 1,
  "scope_type": "clinician",
  "scope_id": 42,
  "service_id": null,
  "service_category": null,
  "priority": 100,
  "assigned_from": "2026-01-01",
  "assigned_to": "2026-12-31",
  "is_active": true
}
```

### Assigning Commission to Organization

**Endpoint:**

```javascript
POST /api/v1/commission/assignments
Content-Type: application/json

{
  "tenantId": 1,
  "commission_config_id": 1,
  "scope_type": "organization",
  "scope_id": 5,
  "service_id": null,
  "service_category": null,
  "priority": 50,
  "assigned_from": "2026-01-01",
  "assigned_to": "2026-12-31",
  "is_active": true
}
```

### Setting Default Commission (Fallback)

If no explicit assignment exists, use a default commission:

**Endpoint:**

```javascript
POST /api/v1/commission/defaults
Content-Type: application/json

{
  "tenantId": 1,
  "recipient_type": "clinician",
  "recipient_id": 99,
  "commission_config_id": 2,
  "is_active": true
}
```

---

## Resolution Priority (How Commissions Are Determined)

When a service is billed, the system looks for a matching commission config in this order:

```
1. Clinician-specific assignment (highest priority)
   └─ Service-specific > Service category > Global service

2. Organization assignment (medium priority)
   └─ Service-specific > Service category > Global service

3. System-wide assignment (lower priority)
   └─ Service-specific > Service category > Global service

4. Commission Default table (fallback)
   └─ If no explicit assignment found

5. No Commission
   └─ If no default exists, no commission is calculated
```

**Example:** If Dr. Kwame has a specific commission config assigned, it will be used instead of the organization's default, even if the organization also has a config assigned.

---

## Commission Caps

All commissions are subject to two types of caps:

### Per-Service Caps (Min/Max)

Applied first to each individual service:

- **min_commission**: Minimum amount owed (e.g., 5 GHS)
- **max_commission**: Maximum amount owed (e.g., 500 GHS)

```
Raw Commission = 2 GHS
Min Cap = 5 GHS
→ Final = 5 GHS (adjusted up to min)

Raw Commission = 600 GHS
Max Cap = 500 GHS
→ Final = 500 GHS (adjusted down to max)
```

### Period Caps (Daily/Weekly/Monthly/Quarterly/Yearly)

Applied after min/max caps to limit total earned in a period:

- **period_cap**: Total limit for the period
- **period_cap_reset**: When the period resets

```
Period Cap = 1000 GHS/month
Already Earned = 950 GHS
New Commission = 150 GHS
Proposed Total = 1100 GHS (exceeds cap by 100)
→ Final = 50 GHS (capped to stay under 1000)
```

---

## Key Fields in Responses

### Commission Tracking Record

```typescript
{
  "id": number,                           // Unique tracking ID
  "service_id": number,                   // Which service generated this
  "service_amount": number,               // Original service amount
  "commission_type": string,              // percentage|fixed|tiered|hybrid
  "percentage_rate_applied": number,      // If percentage-based
  "fixed_amount_applied": number,         // If fixed-based
  "commission_due": number,               // Raw calculation (before caps)
  "min_cap_adjustment": number,           // Min cap adjustment applied
  "max_cap_adjustment": number,           // Max cap adjustment applied
  "period_cap_adjustment": number,        // Period cap adjustment applied
  "final_commission": number,             // After all caps applied
  "recipient_type": string,               // clinician|organization
  "recipient_id": number,                 // ID of who earned it
  "status": string,                       // pending|approved|paid|voided|adjusted
  "currency": string,                     // GHS
  "calculated_at": string,                // ISO timestamp
  "config_id": number,                    // Which config was used
  "assignment_id": number,                // Which assignment matched (if any)
}
```

---

## Common Scenarios

### Scenario 1: View All Unpaid Commissions for a Clinician

```javascript
// Get clinician's unpaid commissions
const clinicianId = 42;
const response = await fetch(
  `/api/v1/commission/tracking/unpaid?tenantId=${tenantId}&recipientType=clinician&recipientId=${clinicianId}`,
);
const unpaidCommissions = await response.json();

// Display in a table
unpaidCommissions.result.forEach((commission) => {
  console.log(
    `Service ${commission.service_id}: ${commission.final_commission} GHS`,
  );
});
```

### Scenario 2: Set Up Organization Commission for a Service Category

```javascript
// 1. First, create a config for "Lab Tests"
const configResponse = await fetch("/api/v1/commission/configs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tenantId: 1,
    name: "Lab Tests Commission",
    commission_type: "percentage",
    percentage_rate: 8,
    min_commission: 10,
    max_commission: 200,
    period_cap: 2000,
    period_cap_reset: "monthly",
  }),
});
const config = await configResponse.json();

// 2. Assign it to the organization for "Lab" category
const assignResponse = await fetch("/api/v1/commission/assignments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tenantId: 1,
    commission_config_id: config.result.id,
    scope_type: "organization",
    scope_id: 5,
    service_category: "Lab",
    priority: 50,
    assigned_from: "2026-01-01",
    is_active: true,
  }),
});
```

### Scenario 3: Override with Clinician-Specific Commission

```javascript
// Create a higher commission for top performer Dr. Asante
const configResponse = await fetch("/api/v1/commission/configs", {
  method: "POST",
  body: JSON.stringify({
    tenantId: 1,
    name: "Dr. Asante Premium",
    commission_type: "percentage",
    percentage_rate: 15, // Higher than org default
    min_commission: 20,
    max_commission: 500,
    period_cap: 3000,
    period_cap_reset: "monthly",
  }),
});
const config = await configResponse.json();

// Assign to clinician (priority 100 > organization priority 50)
await fetch("/api/v1/commission/assignments", {
  method: "POST",
  body: JSON.stringify({
    tenantId: 1,
    commission_config_id: config.result.id,
    scope_type: "clinician",
    scope_id: 42,
    priority: 100, // Higher priority overrides org
    is_active: true,
  }),
});
```

---

## Error Handling

### Invalid Commission Configuration

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Invalid commission configuration",
  "errors": [
    "For percentage commission type, 'percentage_rate' is required",
    "min_commission (50) must be less than max_commission (25)"
  ]
}
```

### Missing Configuration for Service

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "No commission configuration found for service",
  "context": {
    "service_id": 5,
    "clinician_id": 42,
    "organization_id": 5,
    "reason": "No assignments match the service, and no default exists"
  }
}
```

### Database Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Database error during commission calculation",
  "details": "Cannot connect to tenant database"
}
```

---

## Testing Commission Calculations

### Use Postman or cURL

**1. Create a test configuration:**

```bash
curl -X POST http://localhost:5000/api/v1/commission/configs \
  -H "Content-Type: application/json" \
  -H "Cookie: pls-prime-tenant-session=YOUR_TOKEN" \
  -d '{
    "tenantId": 1,
    "name": "Test Commission",
    "commission_type": "percentage",
    "percentage_rate": 10,
    "min_commission": 5,
    "max_commission": 100
  }'
```

**2. Assign to a clinician:**

```bash
curl -X POST http://localhost:5000/api/v1/commission/assignments \
  -H "Content-Type: application/json" \
  -H "Cookie: pls-prime-tenant-session=YOUR_TOKEN" \
  -d '{
    "tenantId": 1,
    "commission_config_id": 1,
    "scope_type": "clinician",
    "scope_id": 42,
    "priority": 100,
    "is_active": true
  }'
```

**3. Bill a service and check commission tracking:**

```bash
# Bill a service (this triggers commission calculation automatically)
curl -X POST http://localhost:5000/api/v1/billing/submit \
  ... billing payload ...

# Check if commission was calculated
curl -X GET http://localhost:5000/api/v1/commission/tracking/service/5?tenantId=1 \
  -H "Cookie: pls-prime-tenant-session=YOUR_TOKEN"
```

---

## Troubleshooting

### Zero Commission on Service

**Check these in order:**

1. **Service amount is 0 or null** → Commission can't be calculated
2. **No config assigned** → Check if assignment exists or default is set
3. **Commission below minimum cap** → Check if raw commission < min_commission
4. **Period cap reached** → Check commission tracking for month total
5. **Config not active** → Check if effective_from/effective_to window is valid

**Debug endpoint:**

```
GET /api/v1/commission/tracking/service/{serviceId}?tenantId={tenantId}
```

### Unexpected Commission Amount

**Check these:**

1. **Caps applied** → Review min_cap_adjustment, max_cap_adjustment, period_cap_adjustment
2. **Wrong config** → Verify which assignment was matched (check assignment_id in response)
3. **Tiered calculation** → If tiered, verify correct tier was selected
4. **Period reset** → Check if period_cap_reset matches expected period

---

## Frontend Checklist

- [ ] Display commission summary in clinician dashboard
- [ ] Show unpaid commissions list
- [ ] Create admin panel for commission configs
- [ ] Add commission assignment UI
- [ ] Display per-service commission breakdown
- [ ] Show period caps and remaining balance
- [ ] Handle commission errors gracefully
- [ ] Show commission history/ledger
- [ ] Implement commission payment approval workflow

---

## Support

For issues or questions about commission calculations:

1. Check FLOW_MAP.md for detailed calculation logic
2. Review commission_tracking records for service
3. Verify config is active and within validity window
4. Check assignment resolution priority (clinician > org > system > default)
5. Contact backend team with service_id and tenant_id for debugging
