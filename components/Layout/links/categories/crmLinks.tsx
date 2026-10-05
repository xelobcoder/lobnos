import { Link } from '../types';
import {
    RiCustomerService2Line,
    RiUserAddLine,
    RiStethoscopeLine,
    RiUserSettingsLine,
    RiBillFill,
    RiMoneyDollarCircleLine,
    RiAddCircleLine,
    RiAddBoxLine,
    RiBox3Line,
    RiRefundLine,
    RiMoonLine,
    RiScales2Fill,
    RiCalendarEventFill,
    RiStoreLine,
    RiFileListLine,
    RiTimeLine
} from '@remixicon/react';

export const CrmLinks: Link[] = [
    {
        title: "Customer Management",
        link: "",
        icon: <RiCustomerService2Line />,
        children: [
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
                title: "Create Lead",
                link: "/crm/leads/create-customers-lead",
                icon: <RiUserAddLine />
            },
            {
                title: "All Leads",
                link: "/crm/leads/list",
                icon: <RiCustomerService2Line />
            },
            {
                title: "Leads Follow-up",
                link: "/crm/leads/follow-up",
                icon: <RiCalendarEventFill />
            },
            {
                title: "Upcoming Birthdays",
                link: "/crm/birthdays/upcoming-birthday",
                icon: <RiCustomerService2Line />
            },
            {
                title: "Birthday Wishes",
                link: "/crm/birthdays/wishes",
                icon: <RiCustomerService2Line />
            },
            {
                title: "Validated Results",
                link: "/crm/validated",
                icon: <RiFileListLine />
            },
            {
                title: "Referral Codes",
                link: "/crm/referral-codes",
                icon: <RiFileListLine />,
                roles: ['admin', 'super-admin', 'super_admin', 'manager', 'accountant', 'crm', 'customer service representative', 'customer representative', 'front desk', 'frontdesk']
            }
        ]
    },
    {
        title: "Billing & Sales",
        link: "",
        icon: <RiBillFill />,
        children: [
            {
                title: "Billing",
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
                title: 'Sales Session',
                link: '/billing/billing-sessions/sales-session',
                icon: <RiScales2Fill />
            },
            {
                title: "Cash Collection",
                link: "/billing/cash-collection",
                icon: <RiMoneyDollarCircleLine />
            },
            {
                title: 'Receipts',
                link: "/billing/receipts",
                icon: <RiMoneyDollarCircleLine />
            },
            {
                title: "Outsourced cases",
                link: "/billing/outsourced-cases",
                icon: <RiStoreLine />
            },
            {
                title: "Test Price List",
                link: "/crm/pricelist",
                icon: <RiMoneyDollarCircleLine />
            },
            {
                title: "Packages",
                link: "/billing/packages",
                icon: <RiBox3Line />
            },
            {
                title: 'Daily Sales Report',
                link: "/billing/sales/branches",
                icon: <RiMoneyDollarCircleLine />
            },
            {
                title: 'Billing Strategies',
                link: '/billing/billing-strategy/strategies',
                icon: <RiScales2Fill />
            },
            {
                title: 'Staff FOC Benefit',
                link: '/billing/foc',
                icon: <RiMoneyDollarCircleLine />,
                roles: ['admin', 'super-admin', 'super_admin', 'accountant']
            }
        ]
    },
    {
        title: "Expenses",
        link: "",
        icon: <RiMoneyDollarCircleLine />,
        children: [
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
                title: 'Expense Category',
                link: '/billing/expenses/category',
                icon: <RiCalendarEventFill />
            },
            {
                title: "Invoices",
                link: "/billing/expenses/invoices",
                icon: <RiBillFill />
            },
            {
                title: "Reversed Payments",
                link: "/billing/expenses/reversed-payments",
                icon: <RiMoneyDollarCircleLine />
            }
        ]
    },
    {
        title: "Clinicians",
        link: "",
        icon: <RiStethoscopeLine />,
        children: [
            {
                title: "Clinicians",
                link: "/clinicians",
                icon: <RiStethoscopeLine />
            },
            {
                title: "Add New Clinician",
                link: "/clinicians/add-new",
                icon: <RiUserSettingsLine />
            },
            {
                title: "Select Clinician(Analytics)",
                link: "/clinicians/selection",
                icon: <RiUserSettingsLine />
            },
        ]
    },
    {
        title: "Organizations",
        link: "",
        icon: <RiUserSettingsLine />,
        children: [
            {
                title: "Organization",
                link: "/organization",
                icon: <RiStethoscopeLine />
            }
        ]
    },
    {
        title: "Financial Operations",
        link: "",
        icon: <RiRefundLine />,
        children: [
            {
                title: "Refund Management",
                link: "/billing/refund",
                icon: <RiRefundLine />
            }
        ]
    }
];
