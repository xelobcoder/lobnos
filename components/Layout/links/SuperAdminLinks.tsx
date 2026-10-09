import { Link } from "./types";
import { AccountingLinks } from "./categories/AccountingLinks";
import { AnalyticsLinks } from "./categories/AnalyticsLinks";
import { ApplicationBillingLinks } from "./categories/ApplicationBillingLinks";
import { ApplicationSettingsLinks } from "./categories/ApplicationSettingsLinks";
import { AppointmentsLinks } from "./categories/AppointmentsLinks";
import { BillingSalesLink } from "./categories/BillingSales";
import { ClinicianLinks } from "./categories/ClinicianLinks";
import { CommissionLinks } from "./categories/CommissionLinks";
import { ComplianceLinks } from "./categories/ComplianceLinks";
import { ConsulationLinks } from "./categories/ConsultationLinks";
import { DoashBoardMainLinks } from "./categories/DashboardLinks";
import { DoctorsPortalLinks } from "./categories/DoctorsPortalLinks";
import { EmailMainLinks } from "./categories/EmailAppLinks";
import { ExpensesLinks } from "./categories/ExpensesLinks";
import { ExpenseAnalyticsLinks } from "./categories/expenseAnalyticsLinks";
import { ImagingLinks } from "./categories/imaginglinks";
import { InventoryLinks } from "./categories/InventoryLinks";
import { LaboratoryOperationsLinks } from "./categories/LaboratoryOperationsLinks";
import { OrganizationMainLinks } from "./categories/OraganizationLinks";
import { OutSourcingAnalyticsLinks } from "./categories/OutsourcingAnalyticsLinks";
import { PayrollLinks } from "./categories/PayrollLinks";
import { PharmacyLinks } from "./categories/PharmacyLinks";
import { PhlebotomyLinks } from "./categories/PhlebotomyLinks";
import { SalesOverViewLinks } from "./categories/SalesOverviewLinks";
import { SalesLinks } from "./categories/salesLinks";
import { ServiceCostsLinks } from "./categories/ServiceCostsLinks";
import { SmsLinks } from "./categories/SmsLinks";
import { CrmLinks } from "./categories/crmLinks";

export function superAdminNavigation(branchId: number, employeeId: number): Link[] {
     return [
          { title: "Platform and settings", link: "", children: ApplicationSettingsLinks },
          { title: "Dashboard", link: "", children: DoashBoardMainLinks },
          { title: "CRM and registration", link: "", children: CrmLinks },
          { title: "Billing", link: "", children: ApplicationBillingLinks(branchId, employeeId) },
          { title: "Sales", link: "", children: [...BillingSalesLink, ...SalesLinks, ...SalesOverViewLinks(branchId, employeeId)] },
          { title: "Laboratory", link: "", children: LaboratoryOperationsLinks },
          { title: "Phlebotomy", link: "", children: PhlebotomyLinks },
          { title: "Imaging", link: "", children: ImagingLinks },
          { title: "Clinicians", link: "", children: ClinicianLinks },
          { title: "Doctor portal", link: "", children: DoctorsPortalLinks },
          { title: "Patient portal", link: "/patientportal" },
          { title: "Consultations", link: "", children: ConsulationLinks },
          { title: "Appointments", link: "", children: AppointmentsLinks },
          { title: "Accounting", link: "", children: AccountingLinks },
          { title: "Expenses", link: "", children: ExpensesLinks },
          { title: "Commissions", link: "", children: CommissionLinks },
          { title: "Payroll", link: "", children: PayrollLinks },
          { title: "Inventory", link: "", children: InventoryLinks },
          { title: "Pharmacy", link: "", children: PharmacyLinks },
          { title: "Organizations", link: "", children: OrganizationMainLinks },
          { title: "Compliance", link: "", children: ComplianceLinks },
          { title: "Analytics", link: "", children: [...AnalyticsLinks, ...ExpenseAnalyticsLinks, ...OutSourcingAnalyticsLinks(branchId, employeeId)] },
          { title: "Service costs", link: "", children: ServiceCostsLinks },
          { title: "Email", link: "", children: EmailMainLinks },
          { title: "SMS", link: "", children: SmsLinks },
     ];
}

export function navigationPages(links: Link[]) {
     const pages = new Map<string, { href: string; label: string; icon: React.ReactNode; description: string }>();
     const visit = (items: Link[], group: string) => {
          for (const item of items) {
               if (item.link && !pages.has(item.link)) {
                    pages.set(item.link, { href: item.link, label: item.title, icon: item.icon, description: group });
               }
               if (item.children) visit(item.children, group || item.title);
          }
     };
     visit(links, "");
     return [...pages.values()];
}
