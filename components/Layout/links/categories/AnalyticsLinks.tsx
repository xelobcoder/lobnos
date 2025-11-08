import { Link } from '../types';
import {
    RiUserHeartLine,
    RiTestTubeLine,
    RiUserAddLine,
    RiMoneyDollarCircleLine,
    RiBarChart2Line,
    RiLineChartLine,
    RiCalendarEventFill,
    RiScales2Fill,
    RiBarChartBoxLine,
    RiPriceTag3Line,
    RiUserLine,
    RiBuildingLine,
    RiCalendarLine,
    RiListCheck2
} from '@remixicon/react';

export const AnalyticsLinks: Link[] = [
    { title: 'Patient Analytics', link: '/analytics/patients', icon: <RiUserHeartLine /> },
    { title: 'Leads Analytics', link: "/analytics/leads", icon: <RiUserAddLine /> },
    { title: 'Compliance Analytics', link: "/analytics/compliance", icon: <RiBarChart2Line /> },
    {
        title: 'Sales Analytics',
        link: "/analytics/sales",
        icon: <RiLineChartLine />,
        children: [
            { title: 'Daily Sales Trend', link: '/analytics/sales/dailySalesTrend', icon: <RiCalendarLine /> },
            { title: 'Monthly Sales Trend', link: '/analytics/sales/monthlySalesTrend', icon: <RiCalendarLine /> },
            { title: 'Sales By Week And Branch', link: '/analytics/sales/salesByWeekAndBranch', icon: <RiBuildingLine /> },
            { title: 'Total Sales By Branch', link: '/analytics/sales/totalSalesByBranch', icon: <RiBuildingLine /> },
            { title: 'Total Sales By Clinician', link: '/analytics/sales/totalSalesByClinician', icon: <RiUserLine /> },
            { title: 'Total Sales By Employee', link: '/analytics/sales/totalSalesByEmployee', icon: <RiUserLine /> },
            { title: 'Total Sales By Organization', link: '/analytics/sales/totalSalesByOrganization', icon: <RiBuildingLine /> },
            { title: 'Total Sales By Outsourced Status', link: '/analytics/sales/totalSalesByOutsourcedStatus', icon: <RiPriceTag3Line /> },
            { title: 'Total Sales By Service Category', link: '/analytics/sales/totalSalesByServiceCategory', icon: <RiPriceTag3Line /> },
            { title: 'Weekly Sales Trend', link: '/analytics/sales/weeklySalesTrend', icon: <RiCalendarLine /> },
            { title: 'Yearly Sales Trend', link: '/analytics/sales/yearlySalesTrend', icon: <RiCalendarLine /> }
        ]
    },
    {
        title: 'Expenses Analytics',
        link: "/analytics/expenses",
        icon: <RiMoneyDollarCircleLine />,
        children: [
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
        ]
    },
    {
        title: 'Results Analytics',
        link: "/analytics/resultanalysis/alltest",
        icon: <RiTestTubeLine />,
        children: [
            { title: 'All Test', link: '/analytics/resultanalysis/alltest', icon: <RiTestTubeLine /> }
        ]
    }
];