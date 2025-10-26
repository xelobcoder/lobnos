# 🧩 Feature: Timed Result Access Restriction with Permission Request

## 📘 Overview
This feature introduces a time-based access restriction for laboratory or clinical results.  
Once results have been entered or edited, users can freely access or modify them **within 24 hours**.  
After the **24-hour window**, access becomes **restricted**, and users must **request permission** to view or edit the results.

---

## 👥 User Roles and Permissions

### Access Levels
- **Clinicians/Lab Technicians**: Can enter and edit results within 24 hours. Must request permission for older results.
- **Managers/Supervisors**: Can approve or reject access requests. Have full access to all results for oversight.
- **Administrators**: Can view all logs, manage permissions, and override restrictions if necessary.
- **Patients**: May have limited access to their own results, subject to the same time restrictions and approval processes.

### Permission Hierarchy
- Users with higher roles (e.g., Managers) can access results without restrictions.
- Lower-level users must follow the 24-hour rule and request permissions for older results.
- All accesses are logged regardless of role, ensuring accountability.

---

## 🔐 Workflow Description

### 1. Result Entry Phase
- When a result is entered or edited, the system saves the timestamp in the field `last_updated_at`.
- This timestamp determines the access window.
- All accesses to the result are logged in the `result_access_logs` table, including the user's role and department.

### 2. Time Validation
When a user attempts to **view** or **edit** a result:
- The system checks:
  - If the result is **≤ 24 hours old**, access is granted and logged.
  - If the result is **> 24 hours old**, access is restricted and the permission workflow begins.
- For users with elevated permissions (e.g., Managers), the time restriction may be waived, but access is still logged.

### 3. Permission Request
- The user is prompted to **request access**, providing:
  - A **reason for access** (required text input)
  - The **type of action** (View or Edit)
  - Optional: **urgency level** (Normal, Urgent, Critical)
- The system creates a record in the `result_access_requests` table, including the requester's role and department.

### 4. Manager Approval
- A **manager or supervisor** from the same department or with oversight is notified of the request.
- The manager can:
  - **Approve** or **Reject** the request
  - Optionally add **remarks** or an **expiry duration** for the approval
  - For urgent requests, expedited approval may be available.

### 5. Controlled Access and Logging
- If approved:
  - The user gains temporary access based on the manager’s approval.
  - The access is logged in the `result_access_logs` table, linked to the approval request.
  - All actions are logged for audit purposes, including the user's full details (name, role, department, IP, user agent).
- If rejected:
  - The user is notified and cannot access or edit the result.
  - The rejection is logged, including reasons.
- Even for accesses within the 24-hour window, details are logged, including who accessed (name, role, department), when, and what was done.

---

## 📊 Access Logging Details

The `result_access_logs` table captures comprehensive information about each access:

- **User Information**: Full name, role, department, employee ID.
- **Access Details**: Timestamp, type (view/edit), result ID, patient ID (anonymized if necessary).
- **Context**: Reason for access (if from a request), IP address, user agent, device type.
- **Audit Trail**: Links to approval requests, changes made (for edits), and any anomalies (e.g., multiple failed attempts).

This logging ensures compliance with regulations like HIPAA or GDPR, allowing for audits and investigations into unauthorized or suspicious accesses.

---

## ⚙️ Backend Logic (Pseudocode)

```js
function canAccessResult(user, result) {
const hoursElapsed = (Date.now() - result.last_updated_at) / (1000 * 60 * 60);

if (hoursElapsed <= 24) return true;

const approvedRequest = db.result_access_requests.find({
  result_id: result.id,
  requested_by: user.id,
  status: 'approved',
  approval_expiry: { $gt: Date.now() },
});

return !!approvedRequest;
}
```

---

## 🛡️ Security Considerations

- **Encryption**: All logs are encrypted at rest.
- **Anonymization**: Sensitive patient data in logs is anonymized.
- **Alerts**: Automatic alerts for unusual access patterns (e.g., multiple rejections, accesses outside normal hours).
- **Retention**: Logs are retained for 7 years as per regulatory requirements.

---

## 🚀 Implementation Steps

1. Update database schema with new tables.
2. Implement time-based access checks in the result viewing/editing endpoints.
3. Create UI for permission requests and approvals.
4. Integrate logging middleware for all result accesses.
5. Test with various user roles and scenarios.
6. Train staff on the new workflow.

This expanded feature enhances security, accountability, and compliance by tracking who accesses results, under what conditions, and ensuring proper oversight for sensitive data.
