# Frontend Tax Configuration API Guide

This guide provides detailed information about the Tax Configuration API endpoints for frontend developers. It includes request payloads, response formats, and usage examples.

## Base URL
```
payroll/tax-configurations
```

### 1. Create Tax Configuration
**Method:** `POST`  
**Path:** `payroll/tax-configurations`  
**Description:** Creates a new tax configuration. Only one configuration can be active at a time.

#### Request Payload
```json
{
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
  "disability_exemption": 2000.00,
  "employee_ssnit_rate": 5.5,
  "employer_ssnit_rate": 13.0,
  "tier3_employee_rate": 5.0,
  "tier3_employer_rate": 5.0,
  "ssnit_ceiling": 30000.00,
  "pension_ceiling": 30000.00,
  "is_active": true,
  "created_by": 1
}
```

#### Response
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
**Method:** `GET`  
**Path:** `payroll/tax-configurations`  
**Description:** Retrieves all tax configurations for the tenant.

#### Query Parameters
- `tenantId` (required): Tenant identifier

#### Response
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "tax_year": "2025",
      "country": "Ghana",
      "tax_bands": [...],
      "standard_exemption": 4908.00,
      "dependent_relief": 300.00,
      "disability_exemption": 2000.00,
      "employee_ssnit_rate": 5.5,
      "employer_ssnit_rate": 13.0,
      "tier3_employee_rate": 5.0,
      "tier3_employer_rate": 5.0,
      "ssnit_ceiling": 30000.00,
      "pension_ceiling": 30000.00,
      "is_active": true,
      "created_at": "2025-12-15T10:00:00.000Z",
      "updated_at": "2025-12-15T10:00:00.000Z",
      "created_by": 1
    }
  ]
}
```

### 3. Get Active Tax Configuration
**Method:** `GET`  
**Path:** `payroll/tax-configurations/active`  
**Description:** Retrieves the currently active tax configuration used for payroll calculations.

#### Query Parameters
- `tenantId` (required): Tenant identifier

#### Response
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 1,
    "tax_year": "2025",
    "country": "Ghana",
    "tax_bands": [...],
    "standard_exemption": 4908.00,
    "dependent_relief": 300.00,
    "disability_exemption": 2000.00,
    "employee_ssnit_rate": 5.5,
    "employer_ssnit_rate": 13.0,
    "tier3_employee_rate": 5.0,
    "tier3_employer_rate": 5.0,
    "ssnit_ceiling": 30000.00,
    "pension_ceiling": 30000.00,
    "is_active": true,
    "created_at": "2025-12-15T10:00:00.000Z",
    "updated_at": "2025-12-15T10:00:00.000Z",
    "created_by": 1
  }
}
```

### 4. Get Tax Configuration by ID
**Method:** `GET`  
**Path:** `payroll/tax-configurations/:id`  
**Description:** Retrieves a specific tax configuration by its ID.

#### Path Parameters
- `id`: Tax configuration ID

#### Query Parameters
- `tenantId` (required): Tenant identifier

#### Response
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
    "standard_exemption": 4908.00,
    "dependent_relief": 300.00,
    "disability_exemption": 2000.00,
    "employee_ssnit_rate": 5.5,
    "employer_ssnit_rate": 13.0,
    "tier3_employee_rate": 5.0,
    "tier3_employer_rate": 5.0,
    "ssnit_ceiling": 30000.00,
    "pension_ceiling": 30000.00,
    "is_active": true,
    "created_at": "2025-12-15T10:00:00.000Z",
    "updated_at": "2025-12-15T10:00:00.000Z",
    "created_by": 1
  }
}
```

### 5. Get Tax Configuration by Year
**Method:** `GET`  
**Path:** `payroll/tax-configurations/year/:taxYear`  
**Description:** Retrieves tax configuration for a specific tax year.

#### Path Parameters
- `taxYear`: 4-digit tax year (e.g., "2025")

#### Query Parameters
- `tenantId` (required): Tenant identifier

#### Response
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
    "standard_exemption": 4908.00,
    "dependent_relief": 300.00,
    "disability_exemption": 2000.00,
    "employee_ssnit_rate": 5.5,
    "employer_ssnit_rate": 13.0,
    "tier3_employee_rate": 5.0,
    "tier3_employer_rate": 5.0,
    "ssnit_ceiling": 30000.00,
    "pension_ceiling": 30000.00,
    "is_active": true,
    "created_at": "2025-12-15T10:00:00.000Z",
    "updated_at": "2025-12-15T10:00:00.000Z",
    "created_by": 1
  }
}
```

### 6. Update Tax Configuration
**Method:** `PUT`  
**Path:** `payroll/tax-configurations/:id`  
**Description:** Updates an existing tax configuration. If setting `is_active: true`, all other configurations are automatically deactivated.

#### Path Parameters
- `id`: Tax configuration ID

#### Query Parameters
- `tenantId` (required): Tenant identifier

#### Request Payload
```json
{
  "tax_bands": [
    {
      "min": 0,
      "max": 5000,
      "rate": 0
    },
    {
      "min": 5000,
      "max": 7500,
      "rate": 5
    }
  ],
  "standard_exemption": 5000.00,
  "is_active": true
}
```

#### Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Tax configuration updated successfully"
}
```

### 7. Toggle Tax Configuration Status
**Method:** `PATCH`  
**Path:** `payroll/tax-configurations/:id/status`  
**Description:** Activates or deactivates a tax configuration. Only one can be active at a time.

#### Path Parameters
- `id`: Tax configuration ID

#### Query Parameters
- `tenantId` (required): Tenant identifier

#### Request Payload
```json
{
  "is_active": true
}
```

#### Response
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
**Method:** `DELETE`  
**Path:** `payroll/tax-configurations/:id`  
**Description:** Deletes a tax configuration. Cannot delete active configurations.

#### Path Parameters
- `id`: Tax configuration ID

#### Query Parameters
- `tenantId` (required): Tenant identifier

#### Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Tax configuration deleted successfully"
}
```

## Error Responses

### Common Error Format
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error description"
}
```

### Specific Errors
- **400 Bad Request**: Invalid payload or parameters
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Tax configuration not found
- **409 Conflict**: Attempting to activate multiple configurations
- **500 Internal Server Error**: Server-side processing error

## Frontend Integration Notes

1. **Active Configuration**: Always use the active configuration for new payroll calculations
2. **Historical Data**: Store `tax_configuration_id` with payroll records for accurate historical reporting
3. **Validation**: Validate tax bands array and numeric fields on the frontend
4. **Caching**: Cache active configuration to reduce API calls during payroll processing
5. **Error Handling**: Implement proper error handling for network failures and validation errors

## Tax Bands Structure

The `tax_bands` field is a JSON array of objects:
```json
[
  {
    "min": 0,
    "max": 4908,
    "rate": 0
  },
  {
    "min": 4908,
    "max": null,
    "rate": 25
  }
]
```
