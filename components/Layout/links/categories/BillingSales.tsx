import { Link } from '../types';
import {
    RiCustomerService2Line,
    RiUserAddLine,
    RiStethoscopeLine,
    RiUserSettingsLine,
    RiBillFill,
    RiMoneyDollarCircleLine,
    RiAddCircleLine,
    RiStoreLine,
    RiAddBoxLine,
    RiBox3Line,
    RiRefundLine,
    RiMoonLine,
    RiFileListLine,
    RiTimeLine
} from '@remixicon/react';

export const BillingSalesLink: Link[] = [
    {
        title: "Customers",
        link: "/crm/customers",
        icon: <RiCustomerService2Line />
    },
    {
        title: "Registration",
        link: "/crm/registration",
        icon: <RiUserAddLine />
    },
    {
        title: "Add New Customer",
        link: "/customers/new",
        icon: <RiUserAddLine />
    },
    {
        title: "Billing ",
        link: "/billing/patientid",
        icon: <RiBillFill />
    },
    {
        title: "Entity Order Review",
        link: "/billing/entity-orders",
        icon: <RiBillFill />
    },
    {
        title: "Suspended Transactions",
        link: "/billing/suspended-transactions",
        icon: <RiTimeLine />
    },
    {
        title: "Referral Codes",
        link: "/crm/referral-codes",
        icon: <RiFileListLine />,
        roles: ['admin', 'super-admin', 'super_admin', 'manager', 'accountant', 'crm', 'customer service representative', 'customer representative', 'front desk', 'frontdesk']
    },

    {
        title: "Expenses",
        link: "/billing/expenses",
        icon: <RiMoneyDollarCircleLine />
    },
    {
        title: "New Expense",
        link: "/billing/expenses/create-new-expense",
        icon: <RiAddCircleLine />
    },

    {
        title: "New Merchants",
        link: "/billing/expenses/merchants/create",
        icon: <RiAddBoxLine />
    },
    {
        title: "Test Price List",
        link: "/crm/pricelist",
        icon: <RiMoneyDollarCircleLine />
    },
    {
        title: "Packages",
        link: "/billing/packages/create-new-package",
        icon: <RiBox3Line />
    },
    {
        title: "Clinicians",
        link: "/clinician",
        icon: <RiStethoscopeLine />
    },
    {
        title: "Add New Clinician",
        link: "/clinician/new",
        icon: <RiUserSettingsLine />
    },
    {
        title: "Refund Management",
        link: "/billing/refund",
        icon: <RiRefundLine />
    },
    {
        title: "Staff FOC Benefit",
        link: "/billing/foc",
        icon: <RiMoneyDollarCircleLine />,
        roles: ['admin', 'super-admin', 'super_admin', 'accountant']
    },
    {
        title: "Organization Invoices",
        link: "/billing/organization-invoices",
        icon: <RiMoneyDollarCircleLine />,
        roles: ['admin', 'super-admin', 'super_admin', 'manager', 'accountant', 'cashier', 'front desk', 'frontdesk', 'customer service representative', 'billing']
    },
    {
        title: "Time Based Adjustment",
        link: "/settings/applicationsettings/time-adjustments",
        icon: <RiTimeLine />
    }
];