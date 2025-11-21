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
    RiCalendarEventFill
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
                title: 'Sales Session',
                link: '/billing/billing-sessions/sales-session',
                icon: <RiScales2Fill />
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
                title: "New Merchants",
                link: "/billing/expenses/merchants/create",
                icon: <RiAddBoxLine />
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
            },
            {
                title: "Night Adjustments",
                link: "/billing/settings/night-adjustments",
                icon: <RiMoonLine />
            }
        ]
    }
];