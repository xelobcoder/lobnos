# Tax Configuration API Documentation

## Overview
The Tax Configuration API provides endpoints for managing tax rates, brackets, and statutory deductions used in payroll calculations. This includes income tax brackets, SSNIT rates, and other mandatory deductions.

## Base URL
```
/api/v1/payroll/tax-configurations
```

## Authentication
All endpoints require authentication via JWT token in the `pls-prime-tenant-session` cookie and tenant ID in query parameters.

## Data Models

### Tax Configuration Object
```json
{
  "id": 1,
  "tax_year": "2025",
  "country": "Ghana",
  "tax_bands": [
    {
      "min": 0,
      "max": 4908,
      "rate": 0
    },
    {
      "min": 4908,
      "max": 7340,
      "rate": 5
    },
    {
      "min": 7340,
      "max": 9792,
      "rate": 10
    },
    {
      "min": 9792,
      "max": 12244,
      "rate": 17.5
    },
    {
      "min": 12244,
      "max": null,
      "rate": 25
    }
  ],
  "standard_exemption": 4908.00,
  "dependent_relief": 300.00,
  "disability_exemption": 300.00,
  "employee_ssnit_rate": 5.5,
  "employer_ssnit_rate": 13.0,
  "tier3_employee_rate": 5.5,
  "tier3_employer_rate": 13.0,
  "ssnit_ceiling": null,
  "pension_ceiling": null,
  "is_active": true,
  "created_at": "2025-12-11T15:26:59.000Z",
  "updated_at": "2025-12-11T15:26:59.000Z",
  "created_by": 1
}
```

### Tax Band Structure
```json
{
  "min": 0,
  "max": 4908,
  "rate": 0
}
```

## Endpoints

### 1. Create Tax Configuration
**POST** `/api/v1/payroll/tax-configurations?tenantId={tenantId}`

Creates a new tax configuration for a specific tax year and country.

**Request Body:**
```json
{
  "tax_year": "2025",
  "country": "Ghana",
  "tax_bands": [
    {"min": 0, "max": 4908, "rate": 0},
    {"min": 4908, "max": 7340, "rate": 5},
    {"min": 7340, "max": 9792, "rate": 10},
    {"min": 9792, "max": 12244, "rate": 17.5},
    {"min": 12244, "max": null, "rate": 25}
  ],
  "standard_exemption": 4908.00,
  "dependent_relief": 300.00,
  "disability_exemption": 300.00,
  "employee_ssnit_rate": 5.5,
  "employer_ssnit_rate": 13.0,
  "tier3_employee_rate": 5.5,
  "tier3_employer_rate": 13.0,
  "is_active": true,
  "created_by": 1
}
```

**Response:**
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

### 2. Get All Tax Configurations
**GET** `/api/v1/payroll/tax-configurations?tenantId={tenantId}`

Retrieves all tax configurations for the tenant, ordered by tax year (newest first).

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Tax configurations retrieved successfully",
  "result": [
    {
      "id": 1,
      "tax_year": "2025",
      "country": "Ghana",
      "is_active": true,
      "created_at": "2025-12-11T15:26:59.000Z"
    }
  ]
}
```

### 3. Get Active Tax Configuration
**GET** `/api/v1/payroll/tax-configurations/active?tenantId={tenantId}`

Retrieves the currently active tax configuration used for payroll calculations.

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Active tax configuration retrieved successfully",
  "result": {
    "id": 1,
    "tax_year": "2025",
    "country": "Ghana",
    "tax_bands": [...],
    "standard_exemption": 4908.00,
    "is_active": true
  }
}
```

**Error Response (No Active Configuration):**
```json
{
  "status": "error",
  "statusCode": 404,
  "message": "No active tax configuration found"
}
```

### 4. Get Tax Configuration by ID
**GET** `/api/v1/payroll/tax-configurations/{id}?tenantId={tenantId}`

Retrieves a specific tax configuration by its ID.

**Parameters:**
- `id` (path): Tax configuration ID

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Tax configuration retrieved successfully",
  "result": {
    "id": 1,
    "tax_year": "2025",
    "country": "Ghana",
    "tax_bands": [...],
    "is_active": true
  }
}
```

### 5. Get Tax Configuration by Year
**GET** `/api/v1/payroll/tax-configurations/year/{taxYear}?tenantId={tenantId}`

Retrieves tax configuration for a specific tax year.

**Parameters:**
- `taxYear` (path): 4-digit tax year (e.g., "2025")

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Tax configuration retrieved successfully",
  "result": {
    "id": 1,
    "tax_year": "2025",
    "country": "Ghana",
    "tax_bands": [...],
    "is_active": true
  }
}
```

### 6. Update Tax Configuration
**PUT** `/api/v1/payroll/tax-configurations/{id}?tenantId={tenantId}`

Updates an existing tax configuration.

**Parameters:**
- `id` (path): Tax configuration ID

**Request Body:**
```json
{
  "standard_exemption": 5000.00,
  "dependent_relief": 350.00,
  "employee_ssnit_rate": 5.5
}
```

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Tax configuration updated successfully",
  "result": {
    "success": true
  }
}
```

### 7. Activate/Deactivate Tax Configuration
**PATCH** `/api/v1/payroll/tax-configurations/{id}/status?tenantId={tenantId}`

Activates or deactivates a tax configuration. Only one configuration can be active at a time.

**Parameters:**
- `id` (path): Tax configuration ID

**Request Body:**
```json
{
  "is_active": true
}
```

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Tax configuration activated successfully",
  "result": {
    "success": true
  }
}
```

### 8. Delete Tax Configuration
**DELETE** `/api/v1/payroll/tax-configurations/{id}?tenantId={tenantId}`

Deletes a tax configuration. Cannot delete active configurations.

**Parameters:**
- `id` (path): Tax configuration ID

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Tax configuration deleted successfully"
}
```

## Validation Rules

### Tax Configuration Validation
- `tax_year`: Must be a valid 4-digit year
- `country`: Required, 1-100 characters
- `tax_bands`: Must be a valid JSON array with at least one band
- `standard_exemption`: Must be >= 0
- `dependent_relief`: Must be >= 0
- `disability_exemption`: Must be >= 0
- `employee_ssnit_rate`: Must be 0-100%
- `employer_ssnit_rate`: Must be 0-100%
- `tier3_employee_rate`: Must be 0-100%
- `tier3_employer_rate`: Must be 0-100%

### Tax Band Validation
- `min`: Must be >= 0
- `max`: Can be null (for highest bracket) or >= min
- `rate`: Must be 0-100%

## Error Codes

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | Tenant ID is required | Missing tenantId query parameter |
| 400 | Valid tax configuration ID is required | Invalid or missing ID parameter |
| 400 | Valid 4-digit tax year is required | Invalid tax year format |
| 400 | is_active must be a boolean value | Invalid status value |
| 400 | Cannot delete active tax configuration | Attempting to delete active config |
| 404 | No active tax configuration found | No active configuration exists |
| 404 | Tax configuration not found | Configuration with specified ID doesn't exist |
| 404 | Tax configuration not found for the specified year | No configuration for the tax year |

## Usage Examples

### Setting Up Tax Configuration for Ghana 2025
```bash
curl -X POST "http://localhost:5000/api/v1/payroll/tax-configurations?tenantId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "tax_year": "2025",
    "country": "Ghana",
    "tax_bands": [
      {"min": 0, "max": 4908, "rate": 0},
      {"min": 4908, "max": 7340, "rate": 5},
      {"min": 7340, "max": 9792, "rate": 10},
      {"min": 9792, "max": 12244, "rate": 17.5},
      {"min": 12244, "max": null, "rate": 25}
    ],
    "standard_exemption": 4908.00,
    "dependent_relief": 300.00,
    "disability_exemption": 300.00,
    "employee_ssnit_rate": 5.5,
    "employer_ssnit_rate": 13.0,
    "tier3_employee_rate": 5.5,
    "tier3_employer_rate": 13.0,
    "is_active": true,
    "created_by": 1
  }'
```

### Getting Active Configuration for Payroll Calculations
```bash
curl -X GET "http://localhost:5000/api/v1/payroll/tax-configurations/active?tenantId=1"
```

### Updating Tax Rates
```bash
curl -X PUT "http://localhost:5000/api/v1/payroll/tax-configurations/1?tenantId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_ssnit_rate": 6.0,
    "employer_ssnit_rate": 13.5
  }'
```

## Integration Notes

### Payroll Processing Dependency
- Tax configurations are required for payroll processing
- The system automatically uses the active tax configuration
- If no active configuration exists, payroll processing will fail with "No active tax configuration found"

### Multi-Year Support
- Multiple tax configurations can exist for different years
- Only one configuration can be active at a time
- Historical configurations are preserved for audit purposes

### Rate Updates
- Tax rates can be updated mid-year if needed
- Changes affect future payroll calculations
- Historical payroll data remains unchanged

## Related APIs
- **Payroll Processing**: Uses active tax configuration for calculations
- **Payroll Periods**: References tax configuration for period calculations
- **Employee Compensation**: Works with tax configuration for net salary calculations