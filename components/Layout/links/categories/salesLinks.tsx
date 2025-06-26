import { Link } from '../types';
import {
    RiBarChartBoxLine,
    RiPriceTag3Line,
    RiUserLine,
    RiBuildingLine,
    RiCalendarLine
} from '@remixicon/react';

export const SalesLinks: Link[] = [
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
];