"use client";

import { Tabs, Tab } from "react-bootstrap";
import AllowancesDeductionsForm from "../../../../components/HR/employeeforms/AllowancesDeductionsForm";
import AuditLogsForm from "../../../../components/HR/employeeforms/AuditLogsForm";
import EmployeesForm from "../../../../components/HR/employeeforms/EmployeesForm";
import EmploymentDocumentsForm from "../../../../components/HR/employeeforms/EmploymentDocumentsForm";
import LoginCredentialsForm from "../../../../components/HR/employeeforms/LoginCredentialsForm";
import PaymentHistoryForm from "../../../../components/HR/employeeforms/PaymentHistoryForm";
import PerformanceMetricsForm from "../../../../components/HR/employeeforms/PerformanceMetricsForm";
import PerformanceReviewsForm from "../../../../components/HR/employeeforms/PerformanceReviewsForm";
import RolesPermissionsForm from "../../../../components/HR/employeeforms/RolesPermissionsForm";
import SalaryStructureForm from "../../../../components/HR/employeeforms/SalaryStructureForm";
import SecurityClearanceForm from "../../../../components/HR/employeeforms/SecurityClearanceForm";
import SopSignoffsForm from "../../../../components/HR/employeeforms/SopSignoffsForm";
import TrainingRecordsForm from "../../../../components/HR/employeeforms/TrainingRecordsForm";
import WorkflowAssignmentsForm from "../../../../components/HR/employeeforms/WorkflowAssignmentsForm";

export default function EmployeesTabs() {
  return (
    <div >
      <h2>Employee Management</h2>
      <div  className="bg-white p-3 ">
        <div style={{ flex: "1 1 auto" }}>
          <Tabs
            defaultActiveKey="profile"
            id="employee-forms-tabs"
            className="mb-3 border-bottom border-primary bg-light"
          >
            <Tab eventKey="profile" title="Employee Profile">
              <EmployeesForm />
            </Tab>
            <Tab eventKey="login" title="Login Credentials">
              <LoginCredentialsForm />
            </Tab>
            <Tab eventKey="roles" title="Roles & Permissions">
              <RolesPermissionsForm />
            </Tab>
            <Tab eventKey="training" title="Training Records">
              <TrainingRecordsForm />
            </Tab>
            <Tab eventKey="sop" title="SOP Signoffs">
              <SopSignoffsForm />
            </Tab>
            <Tab eventKey="audit" title="Audit Logs">
              <AuditLogsForm />
            </Tab>
            <Tab eventKey="workflow" title="Workflow Assignments">
              <WorkflowAssignmentsForm />
            </Tab>
            <Tab eventKey="metrics" title="Performance Metrics">
              <PerformanceMetricsForm />
            </Tab>
            <Tab eventKey="documents" title="Employment Documents">
              <EmploymentDocumentsForm />
            </Tab>
            <Tab eventKey="security" title="Security Clearance">
              <SecurityClearanceForm />
            </Tab>
            <Tab eventKey="reviews" title="Performance Reviews">
              <PerformanceReviewsForm />
            </Tab>
            <Tab eventKey="salary" title="Salary Structure">
              <SalaryStructureForm />
            </Tab>
            <Tab eventKey="allowances" title="Allowances & Deductions">
              <AllowancesDeductionsForm />
            </Tab>
            <Tab eventKey="payments" title="Payment History">
              <PaymentHistoryForm />
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
