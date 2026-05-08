# Commission Configuration Setup Guide - Frontend

## Overview

This guide provides accurate, detailed instructions for setting up and managing commission configurations in the Lobnos Professional Version system. Commission configurations define how commissions are calculated when services are billed.

## Commission Types

### 1. Percentage Commission

- **Type**: `"percentage"`
- **Rate-based**: Commission as percentage of service amount
- **Required Fields**:
  - `commission_type`: "percentage"
  - `percentage_rate`: Number (0-100, e.g., 10.5 = 10.5%)
  - `effective_from`: Date (activation date)
  - `is_active`: Boolean
- **Optional Fields**:
  - `min_commission`: Minimum commission amount (e.g., 5.00)
  - `max_commission`: Maximum commission amount (e.g., 200.00)
  - `period_cap`: Cap per period (e.g., 1000.00)
  - `period_cap_reset`: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  - `effective_to`: Expiry date
  - `description`: Notes about this config

**Example**: GHₛ150 service × 8% = GHₛ12 commission

### 2. Fixed Commission

- **Type**: `"fixed"`
- **Amount-based**: Fixed amount regardless of service value
- **Required Fields**:
  - `commission_type`: "fixed"
  - `fixed_component`: Number (e.g., 50.00)
  - `effective_from`: Date
  - `is_active`: Boolean
- **Optional Fields**: Same as percentage

**Example**: Always GHₛ50 per service, regardless of amount

### 3. Hybrid Commission

- **Type**: `"hybrid"`
- **Combined**: Percentage + fixed amount
- **Required Fields**:
  - `commission_type`: "hybrid"
  - `percentage_rate`: Number
  - `fixed_component`: Number
  - `effective_from`: Date
  - `is_active`: Boolean
- **Optional Fields**: Same as percentage

**Example**: (GHₛ150 × 5%) + GHₛ10 = GHₛ17.50 total

### 4. Tiered Commission

- **Type**: `"tiered"`
- **Range-based**: Different rates for different service amounts
- **Required Fields**:
  - `commission_type`: "tiered"
  - `effective_from`: Date
  - `is_active`: Boolean
- **Tier Structure** (separate creation):
  - `min_amount_inclusive`: Range start (inclusive)
  - `max_amount_exclusive`: Range end (exclusive, null = unlimited)
  - `tier_type`: "fixed" | "percentage"
  - `tier_value`: Commission amount (if fixed) or rate (if percentage)
  - `sort_order`: Display order (1, 2, 3...)

**Example Tiers**:
| Service Amount | Tier Type | Value | Commission |
|---|---|---|---|
| GHₛ0 - GHₛ100 | fixed | 5 | GHₛ5 |
| GHₛ100 - GHₛ500 | percentage | 8 | 8% of amount |
| GHₛ500+ | fixed | 25 | GHₛ25 |

---

## Setup Workflow

### Step 1: Create Commission Configuration

**Endpoint**: `POST /api/v1/commissions/configs`

**Request Body**:

```json
{
  "name": "Lab Services - 8% Commission",
  "description": "Standard commission for lab services",
  "commission_type": "percentage",
  "percentage_rate": 8.0,
  "min_commission": 5.0,
  "max_commission": 200.0,
  "period_cap": 2000.0,
  "period_cap_reset": "monthly",
  "effective_from": "2024-01-01T00:00:00Z",
  "effective_to": null,
  "is_active": true
}
```

**Field Validation**:

- `name`: Required, unique, max 255 characters
- `commission_type`: One of "percentage", "fixed", "hybrid", "tiered"
- `percentage_rate`: Required for percentage/hybrid; 0-100
- `fixed_component`: Required for fixed/hybrid; positive number
- `min_commission`: ≤ `max_commission` if both set
- `period_cap_reset`: Valid only if `period_cap` is set; "daily", "weekly", "monthly", "quarterly", "yearly"
- `effective_from`: Required, must be valid date
- `is_active`: Required, boolean

**Response** (201 Created):

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Commission configuration created",
  "result": {
    "id": 1,
    "name": "Lab Services - 8% Commission",
    "commission_type": "percentage",
    "percentage_rate": 8.0,
    "is_active": true,
    ...
  }
}
```

### Step 2: Configure Tiers (Tiered Commissions Only)

**Endpoint**: `POST /api/v1/commissions/configs/{configId}/tiers`

**Request Body** (for config type "tiered"):

```json
[
  {
    "min_amount_inclusive": 0,
    "max_amount_exclusive": 100,
    "tier_type": "fixed",
    "tier_value": 5.0,
    "sort_order": 1
  },
  {
    "min_amount_inclusive": 100,
    "max_amount_exclusive": 500,
    "tier_type": "percentage",
    "tier_value": 8.0,
    "sort_order": 2
  },
  {
    "min_amount_inclusive": 500,
    "max_amount_exclusive": null,
    "tier_type": "fixed",
    "tier_value": 25.0,
    "sort_order": 3
  }
]
```

**Tier Validation Rules**:

- Ranges must NOT overlap
- `min_amount_inclusive` < `max_amount_exclusive` (unless exclusive is null)
- `tier_value` > 0
- `tier_type`: "fixed" = absolute amount, "percentage" = rate percent
- At least 1 tier required for tiered configs
- `sort_order` determines processing sequence

**Note**: Tiers are created in batch. Update individual tiers with `PUT /api/v1/commissions/tiers/{tierId}`.

### Step 3: Assign Config to Scopes

Commission configs apply to specific scopes (system-wide, organization, or clinician).

**Endpoint**: `POST /api/v1/commissions/assignments`

**Request Body** (Clinician-specific assignment):

```json
{
  "commission_config_id": 1,
  "scope_type": "clinician",
  "scope_id": 42,
  "service_category": "Haematology",
  "service_id": null,
  "priority": 1,
  "assigned_from": "2024-01-01T00:00:00Z",
  "assigned_to": null,
  "is_active": true
}
```

**Scope Types**:

- **"system"**: Global default (no scope_id required)
- **"organization"**: Org-level (scope_id = organization ID)
- **"clinician"**: Clinician-level (scope_id = clinician ID)

**Service Filtering** (optional):

- Leave both `service_id` and `service_category` null for all services
- Set `service_category` (e.g., "Haematology") for category-specific
- Set `service_id` for single service only

**Assignment Validation**:

- `scope_type` required: one of "system", "organization", "clinician"
- If scope_type is "organization" or "clinician", `scope_id` required
- `assigned_from` required, must be valid date
- `priority`: 1-10 (used with specificity for resolution)
- `assigned_to`: Optional expiry date

### Step 4: Test Configuration

Before activating, test with sample data.

**Endpoint**: `POST /api/v1/commissions/calculate`

**Request Body**:

```json
{
  "service_id": 456,
  "service_amount": 150.0,
  "service_category": "Haematology",
  "organization_id": 789,
  "clinician_id": 42,
  "completion_date": "2024-01-15T10:00:00Z"
}
```

**Response** (200 OK):

```json
{
  "final_commission": 12.0,
  "tracking_id": 9876,
  "reason": "SUCCESS"
}
```

**Error Response**:

```json
{
  "final_commission": 0,
  "reason": "NO_CONFIG",
  "error": "No assignment found matching criteria"
}
```

## Configuration Setup Process

### Step 1: Create Commission Configuration

Use the `CommissionConfigController` to create a new configuration:

```typescript
POST /api/v1/commissions/configs

Request Body:
{
  "name": "Standard Lab Commission",
  "description": "Commission for standard lab services",
  "commission_type": "percentage",
  "percentage_rate": 8.5,
  "min_commission": 5.00,
  "max_commission": 200.00,
  "period_cap": 1000.00,
  "period_cap_reset": "monthly",
  "is_active": true
}
```

**Validation Rules:**

- `name`: Required, unique, max 255 characters
- `commission_type`: Must be one of: "percentage", "fixed", "hybrid", "tiered"
- `percentage_rate`: Required for "percentage"/"hybrid", 0-100
- `fixed_component`: Required for "fixed"/"hybrid", positive number
- `min_commission`: Must be ≤ `max_commission` if both provided
- `period_cap_reset`: Must be "daily", "weekly", "monthly", "quarterly", or "yearly" if `period_cap` is set

### Step 2: Configure Tiers (For Tiered Commissions Only)

If `commission_type` is "tiered", create tiers using `CommissionTierController`:

```typescript
POST /api/v1/commissions/configs/{configId}/tiers

Request Body:
[
  {
    "min_amount": 0,
    "max_amount": 100,
    "tier_value": 5.00
  },
  {
    "min_amount": 100,
    "max_amount": 500,
    "tier_value": 15.00
  },
  {
    "min_amount": 500,
    "max_amount": null,
    "tier_value": 25.00
  }
]
```

**Tier Validation:**

- Tiers must not overlap
- `min_amount` < `max_amount` (unless `max_amount` is null)
- `tier_value` must be positive
- At least one tier required for tiered configurations

### Step 3: Assign Configuration to Entities

Use `CommissionAssignmentController` to assign configurations to clinicians or organizations:

```typescript
POST /api/v1/commissions/assignments

Request Body:
{
  "commission_config_id": 1,
  "entity_type": "clinician",
  "entity_id": 123,
  "priority": 1,
  "is_active": true,
  "effective_from": "2024-01-01T00:00:00Z",
  "effective_to": null
}
```

**Assignment Rules:**

- `entity_type`: "clinician" or "organization"
- `entity_id`: Must exist in the respective table
- `priority`: Higher number = higher priority (1-10)
- Multiple assignments allowed per entity, resolved by priority

### Step 4: Test Configuration

Use the commission engine to test calculations:

```typescript
POST /api/v1/commissions/calculate

Request Body:
{
  "service_id": 456,
  "service_amount": 150.00,
  "service_category": "lab",
  "organization_id": 789,
  "clinician_id": 123,
  "completion_date": "2024-01-15T10:00:00Z"
}
```

---

## Assignment Resolution Algorithm

The system resolves which assignment applies using a **specificity score** system:

### Resolution Priority (by Specificity):

1. **Clinician + Specific Service** (score = 2+3)
   - Most specific: clinician assignment with service_id

2. **Clinician + Service Category** (score = 2+2)
   - Clinician assignment matching service category

3. **Clinician + All Services** (score = 2+1)
   - Clinician assignment with no service filter

4. **Organization + Specific Service** (score = 1+3)
   - Organization assignment with service_id

5. **Organization + Service Category** (score = 1+2)
   - Organization assignment matching category

6. **Organization + All Services** (score = 1+1)
   - Organization assignment with no service filter

7. **System + Specific Service** (score = 0+3)
   - System-wide with service_id

8. **System + Service Category** (score = 0+2)
   - System-wide matching category

9. **System + All Services** (score = 0+1)
   - System-wide fallback

If multiple assignments have same specificity, **higher priority wins**.

---

## Commission Tracking

All commissions are tracked in an immutable ledger.

**Endpoint**: `GET /api/v1/commissions/tracking?recipient_type=clinician&recipient_id=42&status=pending`

**Response**:

```json
{
  "status": "success",
  "result": [
    {
      "id": 9876,
      "service_id": 456,
      "service_amount": 150.0,
      "commission_due": 12.0,
      "final_commission": 12.0,
      "status": "pending",
      "recipient_type": "clinician",
      "recipient_id": 42,
      "calculated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

**Statuses**: "pending" | "approved" | "paid" | "disputed"

---

## Cap System

Commissions can have multiple cap layers applied in order:

### Per-Service Caps

- `min_commission`: Guaranteed minimum per service
- `max_commission`: Maximum allowed per service

### Period Caps

- `period_cap`: Maximum per period (e.g., monthly)
- `period_cap_reset`: Reset frequency ("daily", "weekly", "monthly", "quarterly", "yearly")
- Applied after per-service caps

**Example**:

- Config: 10% rate, min GHₛ5, max GHₛ50, monthly cap GHₛ200
- Service 1: GHₛ100 → 10% = GHₛ10 → Final: GHₛ10
- Service 2: GHₛ1000 → 10% = GHₛ100 → Capped to GHₛ50 (max) → Final: GHₛ50
- Period total: GHₛ60 (under GHₛ200 cap)

---

## Configuration Lifecycle

### Activate Configuration

- Set `is_active: true`
- Must have valid `effective_from` date
- Can restrict with `effective_to` date

### Update Configuration

- `PUT /api/v1/commissions/configs/{id}`
- Changes apply to new calculations only
- Historical commissions unchanged

### Deactivate Configuration

- Set `is_active: false`
- Existing assignments remain but won't be used
- Existing tracked commissions preserved

### Delete Configuration

- `DELETE /api/v1/commissions/configs/{id}`
- Only if NO active assignments exist
- Cascade deletes associated tiers

### Manage Assignments

- **Update**: `PUT /api/v1/commissions/assignments/{id}`
- **Deactivate**: Set `is_active: false`
- **Delete**: `DELETE /api/v1/commissions/assignments/{id}`

---

## Error Handling

### Common Errors

| Error                | Cause                          | Solution                             |
| -------------------- | ------------------------------ | ------------------------------------ |
| `CONFIG_NOT_FOUND`   | Invalid configId               | Verify config exists                 |
| `TIER_OVERLAP`       | Tier ranges overlap            | Adjust min/max values                |
| `NO_ASSIGNMENT`      | No matching assignment         | Create assignment for scope          |
| `INVALID_SCOPE_TYPE` | Scope type not recognized      | Use: system, organization, clinician |
| `MISSING_SCOPE_ID`   | Org/clinician scope without ID | Provide scope_id                     |
| `TIER_MISMATCH`      | Tiered config without tiers    | Create tiers first                   |
| `INVALID_DATE_RANGE` | effective_from > effective_to  | Fix date order                       |

### Example Error Response

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Tier ranges overlap: Tier 1 and Tier 2",
  "code": "TIER_OVERLAP"
}
```

---

## Frontend Integration Checklist

- [ ] Create commission config (all 4 types)
- [ ] Create tiers for tiered config
- [ ] Assign to clinician scope
- [ ] Assign to organization scope
- [ ] Assign to system scope
- [ ] Test with various service amounts
- [ ] Verify caps are applied
- [ ] Check period cap resets
- [ ] Test assignment resolution (specificity)
- [ ] Verify tracking records created
- [ ] Handle error cases
- [ ] Display commission calculations to users
- [ ] Allow commission updates/status changes

---

## Best Practices

1. **Naming**: Use clear, descriptive config names with rates (e.g., "Lab - 8% Monthly Cap")
2. **Testing**: Always test configs with real service amounts before activation
3. **Effective Dates**: Use consistent date ranges across related configs
4. **Documentation**: Document why configs exist (e.g., contract terms, clinician agreements)
5. **Scope Hierarchy**: Define system defaults first, then org/clinician overrides
6. **Service Categories**: Keep category names consistent with billing system
7. **Monitoring**: Regularly review tracking records for anomalies
8. **Versioning**: Create new configs for rate changes rather than modifying active ones

## Commission Resolution Logic

### Assignment Resolution Priority:

1. **Exact Match**: Clinician + Service Category
2. **Organization Fallback**: Organization + Service Category
3. **Default Configuration**: If no assignment found

### Cap Application Order:

1. **Per-Service Caps**: Min/Max commission per service
2. **Period Caps**: Total commission limits per period
3. **Final Calculation**: Apply all caps in sequence

## Configuration Management

### Updating Configurations

- Use `PUT /api/v1/commissions/configs/{id}` to update
- Tiers can be updated separately
- Changes affect future calculations only (historical data preserved)

### Deactivating Configurations

- Set `is_active: false` to deactivate
- Existing assignments remain but won't be used for new calculations
- Reactivate by setting `is_active: true`

### Deleting Configurations

- Only allowed if no active assignments exist
- Use `DELETE /api/v1/commissions/configs/{id}`
- Associated tiers and tracking records are cascade deleted

## Error Handling

### Common Configuration Errors:

- `INVALID_COMMISSION_TYPE`: Commission type not recognized
- `MISSING_REQUIRED_FIELD`: Required field missing based on type
- `INVALID_PERCENTAGE_RATE`: Percentage outside 0-100 range
- `TIER_OVERLAP`: Tiers have overlapping ranges
- `CONFIG_NOT_FOUND`: Configuration ID doesn't exist
- `ASSIGNMENT_CONFLICT`: Multiple assignments with same priority

### Validation in Code:

```typescript
import { CommissionValidator } from "./utils/CommissionValidator";

// Validate configuration
const errors = CommissionValidator.validateConfig(configData);
if (errors.length > 0) {
  // Handle validation errors
}

// Validate assignment
const assignmentErrors = CommissionValidator.validateAssignment(assignmentData);
```

## API Reference

### Configuration Endpoints:

- `POST /api/v1/commissions/configs` - Create config
- `GET /api/v1/commissions/configs` - List configs
- `GET /api/v1/commissions/configs/{id}` - Get config
- `PUT /api/v1/commissions/configs/{id}` - Update config
- `DELETE /api/v1/commissions/configs/{id}` - Delete config

### Tier Endpoints:

- `POST /api/v1/commissions/configs/{configId}/tiers` - Create tiers
- `GET /api/v1/commissions/configs/{configId}/tiers` - Get tiers
- `PUT /api/v1/commissions/tiers/{tierId}` - Update tier
- `DELETE /api/v1/commissions/tiers/{tierId}` - Delete tier

### Assignment Endpoints:

- `POST /api/v1/commissions/assignments` - Create assignment
- `GET /api/v1/commissions/assignments` - List assignments
- `GET /api/v1/commissions/assignments/{id}` - Get assignment
- `PUT /api/v1/commissions/assignments/{id}` - Update assignment
- `DELETE /api/v1/commissions/assignments/{id}` - Delete assignment
- `POST /api/v1/commissions/assignments/resolve` - Resolve assignment

### Calculation Endpoint:

- `POST /api/v1/commissions/calculate` - Calculate commission</content>
  <parameter name="filePath">c:\Programming\PLS-DIFFERENT-VERSIONS\LobnosProfessionalVersion\lobnos-server\src\models\commissions\commission-configuration-guide.md
