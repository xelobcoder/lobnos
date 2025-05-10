import { Link } from '../types';
import {
    RiMoneyDollarCircleLine,
    RiFolderChartLine,
    RiFileAddLine,
    RiAddLine
} from '@remixicon/react';

export const ExpensesLinks: Link[] = [
    { 
        title: "expenses",
        link: "/expense",
        icon: <RiMoneyDollarCircleLine />
    },
    {
        title: "expense category",
        link: "/expense/category",
        icon: <RiFolderChartLine />
    },
    {
        title: "new Expense",
        link: "/expense/newExpense",
        icon: <RiFileAddLine />
    },
    {
        title: "New Expense Request",
        link: "/expense/request",
        icon: <RiAddLine />
    }
];