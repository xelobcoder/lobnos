# Salary Grade API Documentation

## Overview
The Salary Grade API provides comprehensive management of salary grades within the payroll system. Salary grades define standardized compensation levels with associated salary ranges, benefits, and organizational structure.

## Base URL
```
http://localhost:5000/api/v1/payroll
```

## Authentication
- **Method**: Cookie-based JWT authentication
- **Cookie Name**: `pls-prime-tenant-session`
- **Required Parameter**: `tenantId` (query parameter for all requests)

## Common Response Format
All API responses follow this structure:
```json
{
  "status": "success" | "error",
  "statusCode": number,
  "message": string,
  "result": any
}
```

## Error Responses
```json
{
  "status": "error",
  "statusCode": 400 | 404 | 500,
  "message": "Error description"
}
```

---

# 1. SALARY GRADE ENDPOINTS

## 1.1 Create Salary Grade
**Endpoint**: `POST /api/v1/payroll/salary-grades?tenantId={tenantId}`

**Description**: Creates a new salary grade with defined salary ranges and organizational details.

**Request Payload**:
```json
{
  "grade_name": "Senior Software Engineer",
  "grade_level": "L3",
  "min_salary": 75000.00,
  "max_salary": 95000.00,
  "description": "Senior level software engineering position with 5+ years experience",
  "currency": "USD",
  "is_active": true
}
```

**Field Descriptions**:
- `grade_name` (string, required): Unique name for the salary grade
- `grade_level` (string, required): Level indicator (e.g., L1, L2, Senior, etc.)
- `min_salary` (number, optional): Minimum salary for this grade
- `max_salary` (number, optional): Maximum salary for this grade
- `description` (string, optional): Detailed description of the grade
- `currency` (string, optional): Currency code (defaults to "GHS")
- `is_active` (boolean, optional): Whether grade is active (defaults to true)

**Success Response (201)**:
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Salary grade created successfully",
  "result": {
    "id": 1
  }
}
```

**Validation Rules**:
- `grade_name` must be unique across all active grades
- If both `min_salary` and `max_salary` are provided, `max_salary` must be >= `min_salary`
- `currency` must be a valid 3-letter currency code

---

## 1.2 Get All Salary Grades
**Endpoint**: `GET /api/v1/payroll/salary-grades?tenantId={tenantId}&activeOnly=true`

**Description**: Retrieves all salary grades with optional filtering.

**Query Parameters**:
- `activeOnly` (boolean, optional): If true, returns only active grades (default: true)

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "grade_name": "Junior Developer",
      "grade_level": "L1",
      "min_salary": 30000.00,
      "max_salary": 45000.00,
      "description": "Entry level developer position",
      "currency": "USD",
      "is_active": true,
      "created_at": "2025-12-11T10:00:00.000Z",
      "updated_at": "2025-12-11T10:00:00.000Z",
      "created_by": 1,
      "updated_by": null
    }
  ]
}
```

---

## 1.3 Get Salary Grade by ID
**Endpoint**: `GET /api/v1/payroll/salary-grades/{id}?tenantId={tenantId}`

**Description**: Retrieves a specific salary grade by its ID.

**Path Parameters**:
- `id` (number): Salary grade ID

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 1,
    "grade_name": "Senior Software Engineer",
    "grade_level": "L3",
    "min_salary": 75000.00,
    "max_salary": 95000.00,
    "description": "Senior level software engineering position",
    "currency": "USD",
    "is_active": true,
    "created_at": "2025-12-11T10:00:00.000Z",
    "updated_at": "2025-12-11T10:00:00.000Z",
    "created_by": 1,
    "updated_by": null
  }
}
```

**Error Response (404)**:
```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Salary grade not found"
}
```

---

## 1.4 Get Salary Grade by Name
**Endpoint**: `GET /api/v1/payroll/salary-grades/name/{name}?tenantId={tenantId}`

**Description**: Retrieves a salary grade by its name (case-sensitive).

**Path Parameters**:
- `name` (string): Salary grade name

**Success Response (200)**: Same as Get by ID

---

## 1.5 Update Salary Grade
**Endpoint**: `PUT /api/v1/payroll/salary-grades/{id}?tenantId={tenantId}`

**Description**: Updates an existing salary grade.

**Path Parameters**:
- `id` (number): Salary grade ID

**Request Payload**: Same as create, all fields optional for partial updates
```json
{
  "max_salary": 100000.00,
  "description": "Updated description with new salary range"
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Salary grade updated successfully"
}
```

---

## 1.6 Deactivate Salary Grade
**Endpoint**: `DELETE /api/v1/payroll/salary-grades/{id}?tenantId={tenantId}`

**Description**: Soft-deletes a salary grade by setting `is_active` to false.

**Path Parameters**:
- `id` (number): Salary grade ID

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Salary grade deactivated successfully"
}
```

---

## 1.7 Get Salary Grades by Salary Range
**Endpoint**: `GET /api/v1/payroll/salary-grades/range?tenantId={tenantId}&minSalary=50000&maxSalary=80000`

**Description**: Retrieves salary grades that fall within a specified salary range.

**Query Parameters**:
- `minSalary` (number, required): Minimum salary threshold
- `maxSalary` (number, required): Maximum salary threshold

**Success Response (200)**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 2,
      "grade_name": "Mid-level Developer",
      "grade_level": "L2",
      "min_salary": 50000.00,
      "max_salary": 70000.00,
      "description": "Mid-level developer position",
      "currency": "USD",
      "is_active": true
    }
  ]
}
```

---

# 2. INTEGRATION WITH COMPENSATION

## 2.1 Compensation with Salary Grade Details
When retrieving compensation records, you can get joined salary grade information:

**Endpoint**: `GET /api/v1/payroll/compensation/{id}?tenantId={tenantId}`

**Enhanced Response**:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 1,
    "employeeid": 123,
    "compensation_type": "salary",
    "basic_salary": 80000.00,
    "salary_grade_id": 2,
    "currency": "USD",
    "is_active": true,
    // Joined grade information
    "grade_name": "Senior Software Engineer",
    "grade_level": "L3",
    "grade_min_salary": 75000.00,
    "grade_max_salary": 95000.00,
    "grade_description": "Senior level software engineering position",
    "grade_currency": "USD"
  }
}
```

## 2.2 Creating Compensation with Salary Grade
When creating compensation, reference the salary grade by ID:

```json
{
  "employeeid": 123,
  "compensation_type": "salary",
  "basic_salary": 80000.00,
  "salary_grade_id": 2,
  "currency": "USD",
  "effective_from": "2025-01-01"
}
```

---

# 3. BUSINESS RULES & VALIDATION

## 3.1 Uniqueness Constraints
- `grade_name` must be unique across all salary grades (enforced at database level)
- Grade names are case-sensitive

## 3.2 Salary Range Validation
- If `min_salary` and `max_salary` are both provided, `max_salary >= min_salary`
- Salary ranges are informational and don't enforce compensation limits

## 3.3 Soft Delete Behavior
- Deactivated grades (`is_active = false`) are excluded from most queries by default
- Use `activeOnly=false` parameter to include inactive grades
- Existing compensation records maintain their grade references even if grade is deactivated

## 3.4 Audit Trail
- All changes are tracked with `created_by`, `updated_by`, `created_at`, `updated_at`
- Foreign key constraints ensure valid user references

---

# 4. USE CASES

## 4.1 Organizational Salary Structure
```javascript
// Create grade hierarchy
const grades = [
  { grade_name: "Junior Developer", grade_level: "L1", min_salary: 30000, max_salary: 45000 },
  { grade_name: "Developer", grade_level: "L2", min_salary: 45000, max_salary: 65000 },
  { grade_name: "Senior Developer", grade_level: "L3", min_salary: 65000, max_salary: 85000 },
  { grade_name: "Lead Developer", grade_level: "L4", min_salary: 85000, max_salary: 110000 }
];
```

## 4.2 Compensation Planning
```javascript
// Find appropriate grades for a salary range
GET /api/v1/payroll/salary-grades/range?minSalary=60000&maxSalary=90000

// Assign grade to employee compensation
POST /api/v1/payroll/compensation
{
  "employeeid": 123,
  "salary_grade_id": 3,  // Senior Developer
  "basic_salary": 75000
}
```

## 4.3 Grade Management
```javascript
// Update salary ranges annually
PUT /api/v1/payroll/salary-grades/3
{
  "min_salary": 70000,
  "max_salary": 95000
}

// Deactivate obsolete grades
DELETE /api/v1/payroll/salary-grades/1
```

---

# 5. ERROR HANDLING

## 5.1 Common Error Codes
- `400 Bad Request`: Invalid input data or validation failure
- `404 Not Found`: Salary grade not found
- `409 Conflict`: Duplicate grade name (if implemented)
- `500 Internal Server Error`: Database or server errors

## 5.2 Validation Error Examples
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Maximum salary must be greater than or equal to minimum salary"
}
```

---

# 6. DATA MODEL

## 6.1 Salary Grade Table Schema
```sql
CREATE TABLE payroll_salary_grades (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  grade_name VARCHAR(100) NOT NULL,
  grade_level VARCHAR(50) NOT NULL,
  min_salary DECIMAL(10, 2) NULL,
  max_salary DECIMAL(10, 2) NULL,
  description TEXT NULL,
  currency VARCHAR(3) DEFAULT 'GHS',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT UNSIGNED NULL,
  updated_by INT UNSIGNED NULL,
  UNIQUE KEY unique_grade_name (grade_name),
  FOREIGN KEY (created_by) REFERENCES roles(employeeid),
  FOREIGN KEY (updated_by) REFERENCES roles(employeeid)
);
```

## 6.2 Relationships
- **Compensation**: `payroll_employee_compensation.salary_grade_id` → `payroll_salary_grades.id`
- **Users**: `created_by`, `updated_by` → `roles.employeeid`

---

# 7. API TESTING EXAMPLES

## 7.1 Postman Collection
```json
{
  "info": {
    "name": "Salary Grade API",
    "description": "Complete API testing for salary grade management"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api/v1/payroll"
    },
    {
      "key": "tenantId",
      "value": "1"
    }
  ]
}
```

## 7.2 Sample Test Script
```javascript
// Create multiple grades
const grades = [
  { grade_name: "Entry Level", grade_level: "L1", min_salary: 25000, max_salary: 35000 },
  { grade_name: "Mid Level", grade_level: "L2", min_salary: 35000, max_salary: 55000 },
  { grade_name: "Senior Level", grade_level: "L3", min_salary: 55000, max_salary: 80000 }
];

for (const grade of grades) {
  await fetch(`${baseUrl}/salary-grades?tenantId=${tenantId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(grade)
  });
}
```