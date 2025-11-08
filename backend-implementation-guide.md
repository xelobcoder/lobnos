# Backend Implementation Guide - Incident Management Module

## Overview

This document outlines the backend implementation requirements for the incident management module, including incident reporting, investigation workflows, and analytics functionality.

## Database Schema

### Core Tables

#### `incidents` Table
```sql
CREATE TABLE incidents (
    id VARCHAR(50) PRIMARY KEY,
    type ENUM('patient-safety', 'quality', 'security', 'compliance') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    status ENUM('reported', 'investigating', 'root-cause-analysis', 'corrective-actions', 'resolved', 'closed') NOT NULL DEFAULT 'reported',
    reported_by VARCHAR(100) NOT NULL,
    reported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    affected_parties TEXT,
    location VARCHAR(255),
    immediate_actions TEXT,
    root_cause TEXT,
    root_cause_analysis JSON,
    corrective_actions TEXT,
    corrective_action_plan JSON,
    regulatory_reporting BOOLEAN DEFAULT FALSE,
    regulatory_bodies JSON,
    escalated_to JSON,
    follow_up_date DATE,
    resolution_date DATE,
    attachments JSON,
    investigation_notes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_reported_at (reported_at),
    INDEX idx_location (location)
);
```

#### `users` Table (Authentication)
```sql
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'supervisor', 'technician', 'quality-officer') NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_department (department)
);
```

## API Endpoints

### Incident Management APIs

#### 1. GET /api/compliance/incidents
**Purpose**: Retrieve paginated list of incidents with filtering and sorting

**Query Parameters**:
- `page` (integer, default: 1): Page number
- `count` (integer, default: 10): Items per page
- `sortby` (string, default: 'DESC'): Sort order ('ASC' or 'DESC')
- `type` (string): Filter by incident type
- `severity` (string): Filter by severity
- `status` (string): Filter by status
- `start_date` (string): Filter by reported date start
- `end_date` (string): Filter by reported date end

**Response**:
```json
{
    "data": [
        {
            "id": "INC-001",
            "type": "patient-safety",
            "title": "Wrong Blood Type Result",
            "description": "...",
            "severity": "high",
            "status": "resolved",
            "reportedBy": "Dr. Sarah Johnson",
            "reportedAt": "2025-11-01T10:30:00Z",
            "affectedParties": "Patient ID: 12345",
            "location": "Hematology Lab",
            "immediateActions": "...",
            "rootCause": "...",
            "rootCauseAnalysis": {
                "what": "...",
                "why": "...",
                "when": "...",
                "where": "...",
                "who": "...",
                "how": "..."
            },
            "correctiveActions": "...",
            "correctiveActionPlan": {
                "actions": ["Action 1", "Action 2"],
                "responsible": ["Person 1", "Person 2"],
                "deadlines": ["2025-12-01", "2025-12-15"],
                "status": ["completed", "in-progress"]
            },
            "regulatoryReporting": true,
            "escalatedTo": ["supervisor", "quality-manager"],
            "resolutionDate": "2025-11-15T14:20:00Z"
        }
    ],
    "pagination": {
        "page": 1,
        "count": 10,
        "total": 25,
        "totalPages": 3
    }
}
```

#### 2. POST /api/compliance/incidents
**Purpose**: Create a new incident report

**Request Body**:
```json
{
    "type": "patient-safety",
    "title": "Incident Title",
    "description": "Detailed description",
    "severity": "high",
    "affectedParties": "Affected parties description",
    "location": "Location where incident occurred",
    "immediateActions": "Immediate actions taken"
}
```

**Business Logic**:
1. Generate unique incident ID (format: INC-{timestamp})
2. Set status to 'reported'
3. Set reportedBy from authenticated user
4. Set reportedAt to current timestamp
5. Determine regulatoryReporting based on severity (critical/high = true)
6. Trigger automated escalation based on severity rules
7. Return created incident

#### 3. PUT /api/compliance/incidents/{id}
**Purpose**: Update incident status and investigation data

**Request Body** (partial update):
```json
{
    "status": "investigating",
    // OR for investigation updates:
    "rootCause": "Root cause analysis",
    "rootCauseAnalysis": {
        "what": "...",
        "why": "...",
        "when": "...",
        "where": "...",
        "who": "...",
        "how": "..."
    },
    "correctiveActions": "Corrective action summary",
    "correctiveActionPlan": {
        "actions": ["Action 1", "Action 2"],
        "responsible": ["Person 1", "Person 2"],
        "deadlines": ["2025-12-01", "2025-12-15"],
        "status": ["pending", "pending"]
    }
}
```

**Business Logic**:
1. Validate incident exists
2. Update only provided fields
3. If status changes to 'resolved' or 'closed', set resolutionDate
4. If updating investigation data, ensure proper workflow progression
5. Log status changes in audit trail

## Business Logic Implementation

### Incident Management Workflows

#### Automated Escalation Rules
```javascript
const escalationRules = {
    critical: ['management', 'regulatory-affairs', 'quality-manager'],
    high: ['supervisor', 'quality-manager'],
    medium: ['supervisor'],
    low: []
};
```

#### Status Workflow Validation
```javascript
const validStatusTransitions = {
    'reported': ['investigating', 'closed'],
    'investigating': ['root-cause-analysis', 'escalated', 'closed'],
    'root-cause-analysis': ['corrective-actions', 'escalated', 'closed'],
    'corrective-actions': ['resolved', 'escalated', 'closed'],
    'escalated': ['investigating', 'resolved', 'closed'],
    'resolved': ['closed'],
    'closed': []
};
```

#### Regulatory Reporting Triggers
```javascript
const regulatoryTriggers = {
    'patient-safety': {
        critical: ['FDA'],
        high: ['FDA']
    },
    quality: ['CLIA', 'CAP'],
    compliance: ['CMS', 'State'],
    security: [] // Usually handled internally
};
```

### Investigation Workflow

#### Root Cause Analysis Process
1. **5-Why Analysis**: Iterative questioning to identify root cause
2. **Fishbone Diagram**: Categorize potential causes (People, Process, Equipment, Materials, Environment)
3. **Failure Mode Analysis**: Identify failure modes and their effects

#### Corrective Action Planning
1. **Immediate Actions**: Stop the problem from recurring
2. **Short-term Actions**: Address symptoms
3. **Long-term Actions**: Address root cause
4. **Preventive Actions**: Prevent similar incidents

### Audit Trail Requirements

#### Audit Events
- Incident creation
- Status changes
- Investigation updates
- Corrective action updates
- Escalation events
- Resolution events

#### Audit Data Structure
```json
{
    "id": "AUDIT-001",
    "incidentId": "INC-001",
    "timestamp": "2025-11-01T10:30:00Z",
    "action": "Status Changed",
    "user": "Dr. Sarah Johnson",
    "oldValue": "reported",
    "newValue": "investigating",
    "details": "Investigation started by lab supervisor",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
}
```

## Security Considerations

1. **Authentication**: JWT-based authentication for all endpoints
2. **Authorization**: Role-based access control (RBAC)
3. **Audit Logging**: All changes logged with user context
4. **Data Encryption**: Sensitive patient data encrypted at rest
5. **API Security**: Rate limiting, input validation, SQL injection prevention
6. **HIPAA Compliance**: Ensure patient data handling meets HIPAA requirements

## Performance Optimization

1. **Database Indexing**: Proper indexes on frequently queried fields (type, severity, status, reported_at)
2. **Caching**: Cache user data and reference data
3. **Pagination**: Implement efficient pagination for large incident datasets
4. **Background Jobs**: Process investigation workflows and notifications asynchronously

## Error Handling

1. **API Errors**: Comprehensive error responses with appropriate HTTP status codes
2. **Validation Errors**: Detailed field-level validation messages
3. **Database Errors**: Proper transaction handling and rollback
4. **Authentication Errors**: Clear messages for auth failures

## Testing Requirements

1. **Unit Tests**: Business logic and validation rules for incident workflows
2. **Integration Tests**: API endpoints and database operations
3. **Data Validation**: Test with various incident scenarios and edge cases
4. **Performance Tests**: Large dataset handling and concurrent incident reporting

## Deployment Considerations

1. **Environment Variables**: Secure storage of database credentials and JWT secrets
2. **Database Migrations**: Version-controlled schema changes for incident tables
3. **Monitoring**: Logging and alerting for system health and incident reporting
4. **Backup**: Regular database backups with incident data preservation</content>
<parameter name="filePath">c:\Programming\PLS-DIFFERENT-VERSIONS\LobnosProfessionalVersion\lobnos\backend-implementation-guide.md