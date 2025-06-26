import { Link } from '../types';
import { 
    RiMoneyDollarCircleLine, 
    RiBarChartBoxLine,
    RiPriceTag3Line,
    RiBuildingLine,
    RiUserLine,
    RiCalendarLine
} from '@remixicon/react';

export const ServiceCostsLinks: Link[] = [
    {
        title: "Max and Min Service Costs",
        link: "/sales/maxAndMinServiceCosts?targetKey=37",
        icon: <RiBarChartBoxLine />
    },
    {
        title: "Service Cost by Category",
        link: "/sales/serviceCostByCategory?targetKey=38",
        icon: <RiPriceTag3Line />
    },
    {
        title: "Cost Breakdown by Clinician",
        link: "/sales/costBreakdownByClinician?targetKey=39",
        icon: <RiUserLine />
    },
    {
        title: "Number of Transactions by Branch",
        link: "/sales/numberOfTransactionsByBranch?targetKey=40",
        icon: <RiBuildingLine />
    },
    {
        title: "Total Sales by Transaction ID",
        link: "/sales/totalSalesByTransactionId?targetKey=41",
        icon: <RiMoneyDollarCircleLine />
    },
    {
        title: "Transaction Count by Employee",
        link: "/sales/transactionCountByEmployee?targetKey=42",
        icon: <RiUserLine />
    },
    {
        title: "Total Sales and Transactions by Date",
        link: "/sales/totalSalesAndTransactionsByDate?targetKey=43",
        icon: <RiCalendarLine />
    }
]