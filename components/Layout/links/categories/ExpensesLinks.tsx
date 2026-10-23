import { Link } from '../types';
import {
    RiMoneyDollarCircleLine,
    RiAddCircleLine,
    RiFileAddLine,
    RiAddBoxLine,
    RiFolderChartLine,
    RiBillFill,
    RiRefundLine,
    RiBarChartBoxLine
} from '@remixicon/react';

const EXPENSE_FINANCE_ROLES = ['admin', 'manager', 'accountant'];

/** Dedicated Expenses navigation; shown for /billing/expenses routes instead of the CRM links. */
export const ExpensesLinks: Link[] = [
    {
        title: "Expenses",
        link: "",
        icon: <RiMoneyDollarCircleLine />,
        children: [
            { title: "Expenses", link: "/billing/expenses", icon: <RiMoneyDollarCircleLine /> },
            { title: "Awaiting Approval", link: "/billing/expenses/awaiting-approval", icon: <RiFolderChartLine /> },
            { title: "New Expense", link: "/billing/expenses/create-new-expense", icon: <RiAddCircleLine /> },
            { title: "Multiple Expenses", link: "/billing/expenses/create-multiple-expenses", icon: <RiFileAddLine /> },
            { title: "Expense Category", link: "/billing/expenses/category", icon: <RiFolderChartLine /> },
            { title: "New Merchant", link: "/billing/expenses/merchants/create", icon: <RiAddBoxLine /> }
        ]
    },
    {
        title: "Payments",
        link: "",
        icon: <RiBillFill />,
        children: [
            { title: "Invoices", link: "/billing/expenses/invoices", icon: <RiBillFill />, roles: EXPENSE_FINANCE_ROLES },
            { title: "Reversed Payments", link: "/billing/expenses/reversed-payments", icon: <RiRefundLine />, roles: EXPENSE_FINANCE_ROLES }
        ]
    },
    {
        title: "Reports",
        link: "",
        icon: <RiBarChartBoxLine />,
        children: [
            { title: "Expense Analytics", link: "/analytics/expenses", icon: <RiBarChartBoxLine />, roles: ['admin'] }
        ]
    }
];

export const isExpensesPath = (pathname: string | null | undefined): boolean =>
    /^\/billing\/expenses(?:\/|$)/.test(pathname || '');
