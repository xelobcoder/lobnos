# Employee Frontend Integration Guide

This guide explains how the frontend should model and submit employee data when working with the backend employee settings system.

## 1) Important distinction: roles table vs employee settings tables

There are two different layers in the current backend design:

1. Roles/account layer
   - The table called `roles` is the master employee login/account record.
   - It stores identity, authentication, and access metadata such as:
     - `employeeid`
     - `username`
     - `role`
     - `password`
     - `pin`
     - `email`
     - `mobile`
     - `branch`
     - `firstname`, `lastname`, etc.
   - This is the table that identifies the employee as a user in the system.
   - The `roles` table no longer includes a `permissions` column; permission data should be handled through the employee role-permission APIs instead.

2. Employee detail layer
   - The employee settings tables are secondary records that add profile, employment, and operational metadata.
   - Examples:
     - designations
     - contacts
     - credentials
     -educations
     - licenses
     - certifications
     - employment history
     - emergency contacts
     - bank accounts
     - attendance
     - performance reviews
     - role assignments
     - role permissions

In practice, the frontend should treat the `roles` table as the employee account record, and the per-table employee settings endpoints as extra profile records linked to the same `employeeid`.

---

## 2) Roles table shape

The current backend schema is:

```sql
CREATE TABLE `roles` (
  `employeeid` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `role` enum('scientist','sonographer','admin','manager','phlebotomist','customer service representative','storekeeper','super_admin','accountant','lab manager','imaging head') NOT NULL,
  `password` varchar(255) NOT NULL,
  `pin` int unsigned DEFAULT '0',
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  `refresh_token` varchar(255) DEFAULT NULL,
  `activation` tinyint(1) NOT NULL DEFAULT '0',
  `email` varchar(200) NOT NULL,
  `updated_on` datetime(6) DEFAULT NULL,
  `emailAuthenticated` varchar(6) NOT NULL DEFAULT 'false',
  `branch` int unsigned DEFAULT NULL,
  `mobile` varchar(10) NOT NULL,
  `alternativeMobile` varchar(10) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `time` datetime(6) DEFAULT NULL,
  `firstname` varchar(100) DEFAULT NULL,
  `middlename` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `designation` int DEFAULT NULL,
  PRIMARY KEY (`employeeid`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `mobile` (`mobile`)
);
```

### Role enum values

The backend currently expects values like:

- `scientist`
- `sonographer`
- `admin`
- `manager`
- `phlebotomist`
- `customer service representative`
- `storekeeper`
- `super_admin`
- `accountant`
- `lab manager`
- `imaging head`

Do not send anything outside this list.

---

## 3) Recommended frontend flow

### Step 1: Create/login the employee account

The employee account is created from the `roles` record.

When creating a user account, the frontend should submit a payload similar to:

```json
{
  "username": "jane.doe",
  "role": "scientist",
  "password": "StrongPass!123",
  "pin": 1234,
  "email": "jane.doe@clinic.com",
  "mobile": "0551234567",
  "alternativeMobile": "0557654321",
  "dob": "1990-05-20",
  "firstname": "Jane",
  "middlename": "Mary",
  "lastname": "Doe",
  "branch": 1,
  "designation": 3,
  "activation": 1,
  "emailAuthenticated": "true"
}
```

> `permissions` is not stored on the `roles` table anymore. If the UI needs fine-grained permission assignment, it should call the role-permission endpoints instead of sending a `permissions` field in the account payload.

### Important note

The current employee settings router does not expose a dedicated `roles` CRUD route. The master account is still handled by the app’s existing auth/role repository flow, not by the separate employee settings router.

So the frontend should:

- use the existing auth or account creation flow for the `roles` table
- then use the employee settings endpoints for the rest of the employee profile data

---

## 4) Employee settings endpoints

The current settings route file is mounted at:

- `/api/v1/employees/...`

The main routes in the backend are:

### Employee designations

- `GET /api/v1/employees/designations?tenantId=<id>`
- `POST /api/v1/employees/designations?tenantId=<id>`
- `GET /api/v1/employees/designations/:id?tenantId=<id>`
- `PUT /api/v1/employees/designations/:id?tenantId=<id>`
- `DELETE /api/v1/employees/designations/:id?tenantId=<id>`

### Employee credentials

- `GET /api/v1/employees/:employeeId/credentials?tenantId=<id>`
- `POST /api/v1/employees/credentials?tenantId=<id>`
- `GET /api/v1/employees/credentials/:id?tenantId=<id>`
- `PUT /api/v1/employees/credentials/:id?tenantId=<id>`
- `DELETE /api/v1/employees/credentials/:id?tenantId=<id>`

### Employee contacts

- `GET /api/v1/employees/:employeeId/contacts?tenantId=<id>`
- `POST /api/v1/employees/contacts?tenantId=<id>`
- `GET /api/v1/employees/contacts/:id?tenantId=<id>`
- `PUT /api/v1/employees/contacts/:id?tenantId=<id>`
- `DELETE /api/v1/employees/contacts/:id?tenantId=<id>`

### Role assignments

- `GET /api/v1/employees/:employeeId/role-assignments?tenantId=<id>`
- `GET /api/v1/employees/role-assignments/by-role/:roleId?tenantId=<id>`
- `POST /api/v1/employees/role-assignments?tenantId=<id>`
- `DELETE /api/v1/employees/:employeeId/role-assignments/:roleId?tenantId=<id>`

### Role permissions

- `GET /api/v1/employees/role-permissions/:roleId?tenantId=<id>`
- `POST /api/v1/employees/role-permissions?tenantId=<id>`
- `DELETE /api/v1/employees/role-permissions/:roleId/:permissionId?tenantId=<id>`

### Other profile records

The same pattern is used for:

- education
- licenses
- certifications
- employment history
- emergency contacts
- documents
- bank accounts
- attendance
- performance reviews

---

## 5) Expected payload conventions

Most create/update payloads are plain JSON objects with the employee data. Examples:

### Contact payload

```json
{
  "employeeId": 12,
  "email": "jane.doe@clinic.com",
  "mobile": "0551234567",
  "alternativeMobile": "0557654321",
  "address": "Plot 5, Health Avenue",
  "city": "Accra",
  "state": "Greater Accra",
  "country": "Ghana",
  "postalCode": "00233"
}
```

### Education payload

```json
{
  "employeeId": 12,
  "institution": "University of Ghana",
  "degree": "BSc",
  "fieldOfStudy": "Medical Laboratory Science",
  "startDate": "2010-09-01",
  "endDate": "2014-06-30",
  "grade": "Second Class Upper",
  "certificateNumber": "UG-MLS-2014-224"
}
```

### Bank account payload

```json
{
  "employeeId": 12,
  "bankName": "Access Bank",
  "accountName": "Jane Doe",
  "accountNumber": "0123456789",
  "branchName": "Osu Branch",
  "mobileMoneyNumber": "0551234567"
}
```

### Role assignment payload

```json
{
  "employeeId": 12,
  "roleId": 4
}
```

### Role permission payload

```json
{
  "roleId": 4,
  "permissionId": 9
}
```

---

## 6) Expected response format

The backend uses a standard success envelope:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Employee contacts retrieved successfully",
  "result": [
    {
      "contactId": 1,
      "employeeId": 12,
      "email": "jane.doe@clinic.com",
      "mobile": "0551234567"
    }
  ]
}
```

Create/update responses usually look like:

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Contact created successfully",
  "result": {
    "id": 12
  }
}
```

Error responses look like:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Invalid id"
}
```

---

## 7) Recommended frontend state structure

A good frontend model should separate account and profile state:

```ts
interface EmployeeAccount {
  employeeid: number;
  username: string;
  role: string;
  email: string;
  mobile: string;
  firstname?: string;
  lastname?: string;
  branch?: number;
  designation?: number;
  activation?: number;
}

interface EmployeeProfile {
  employeeId: number;
  contacts?: any[];
  educations?: any[];
  licenses?: any[];
  certifications?: any[];
  bankAccounts?: any[];
  emergencyContacts?: any[];
  performanceReviews?: any[];
}
```

This keeps the master identity record separate from the finer-grained employee metadata.

---

## 8) Required query parameter

Most requests require a `tenantId` in the query string, for example:

```text
?tenantId=1
```

This is intentional because the app is tenant-aware and resolves the appropriate tenant database before executing the query.

---

## 9) Frontend implementation rules

1. Always create or fetch the employee account first from the `roles`/auth flow.
2. After the employee exists, create detail records using the employee settings endpoints.
3. Keep `employeeId` as the parent reference that ties all employee metadata together.
5. Do not include a `permissions` field on the `roles` account payload; use the separate role-permission endpoints for permission assignment.
5. Validate `role` against the enum values listed above.
6. Always send `tenantId` on tenant-aware requests.
7. Use the standard success/error response envelope when showing UI feedback.

---

## 10) Suggested flow for the UI

A typical employee onboarding flow should be:

1. Create account in `roles` (basic identity and login)
2. Save employee profile details
   - designation
   - contacts
   - education
   - licenses
   - certifications
3. Add assignments and permissions
   - role assignment
   - permission rows
4. Save bank details and emergency contacts
5. Save attendance/performance review history if needed

This structure reflects the backend design and reduces data duplication.

---

## 11) Backend sources to confirm

Relevant backend sources include:

- `src/models/settings/users/RolesRepository.ts`
- `src/models/settings/users/repositories/index.ts`
- `src/models/settings/users/routes/employeeSettingsRoutes.ts`

Those are the most important files to use when building frontend forms or contract definitions.
