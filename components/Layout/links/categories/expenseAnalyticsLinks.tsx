import { Link } from '../types';
import {
    RiMoneyDollarCircleLine,
    RiCalendarEventFill,
    RiListCheck2,
    RiScales2Fill
} from '@remixicon/react';

export const ExpenseAnalyticsLinks: Link[] = [
    {
        title: 'Expense Analytics',
        link: '/analytics/expenses',
        icon: <RiMoneyDollarCircleLine />
    },
    {
        title: 'Monthly Expenses',
        link: '/analytics/expenses/monthly-expenses',
        icon: <RiCalendarEventFill />
    },
    {
        title: 'Branch Monthly Expenses',
        link: '/analytics/expenses/branch-monthly-expenses',
        icon: <RiCalendarEventFill />
    },
    {
        title: 'Daily Expense Summary',
        link: '/analytics/expenses/daily-expense-summary',
        icon: <RiCalendarEventFill />
    },
    {
        title: 'Weekly Expense Summary',
        link: '/analytics/expenses/weekly-expense-summary',
        icon: <RiCalendarEventFill />
    },
    {
        title: 'Yearly Expense Summary',
        link: '/analytics/expenses/yearly-expense-summary',
        icon: <RiCalendarEventFill />
    },
    {
        title: 'Hourly Expense Summary',
        link: '/analytics/expenses/hourly-expense-summary',
        icon: <RiCalendarEventFill />
    },
    {
        title: 'Top Expense Categories',
        link: '/analytics/expenses/top-expense-categories',
        icon: <RiMoneyDollarCircleLine />
    },
    {
        title: 'Pending Expenses',
        link: '/analytics/expenses/pending-expenses-list',
        icon: <RiListCheck2 />
    },
    {
        title: 'Approval Status By Branch',
        link: '/analytics/expenses/approval-status-by-branch',
        icon: <RiScales2Fill />
    },
    {
        title: 'Expense Count By Status',
        link: '/analytics/expenses/expense-count-by-status',
        icon: <RiScales2Fill />
    }
];
