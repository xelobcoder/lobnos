import { Link } from '../types';
import { plsEncryption } from "../../../../lib/encryption";
import { RiBarChartBoxLine, RiMoneyDollarCircleLine, RiPercentLine, RiPriceTag3Line, RiBuildingLine, RiUserLine, RiBuildingFill, RiFileListLine } from '@remixicon/react';

export const SalesOverViewLinks = function (branchid: number, employeeid: number): Link[] {
    const branchId = plsEncryption(branchid.toString());
    return [
        {
            title: "Total Sales by Service Category",
            link: "/sales/totalSalesByServiceCategory?targetKey=0",
            icon: <RiBarChartBoxLine />
        },
        {
            title: "Average Cost per Service",
            link: "/sales/averageCostPerService?targetKey=1",
            icon: <RiMoneyDollarCircleLine />
        },
        {
            title: "Total Tax by Service Category",
            link: "/sales/totalTaxByServiceCategory?targetKey=15",
            icon: <RiPercentLine />
        },
        {
            title: "Sales with Highest Tax Included",
            link: "/sales/salesWithHighestTaxIncluded?targetKey=18",
            icon: <RiPriceTag3Line />
        },
        {
            title: "Total Discount by Branch",
            link: "/sales/totalDiscountByBranch?targetKey=20",
            icon: <RiBuildingLine />
        },
        {
            title: "Average Discount per Service",
            link: "/sales/averageDiscountPerService?targetKey=21",
            icon: <RiPercentLine />
        },
        {
            title: "Total Discount by Clinician",
            link: "/sales/totalDiscountByClinician?targetKey=22",
            icon: <RiUserLine />
        },
        {
            title: "Total Sales by Branch",
            link: "/sales/totalSalesByBranch?targetKey=2",
            icon: <RiBuildingFill />
        },
        {
            title: "Total Sales by Clinician",
            link: "/sales/totalSalesByClinician?targetKey=3",
            icon: <RiUserLine />
        },
        {
            title: "Total Sales by Organization",
            link: "/sales/totalSalesByOrganization?targetKey=4",
            icon: <RiBuildingLine />
        },
        {
            title: "Total Sales by Registration Type",
            link: "/sales/totalSalesByRegistrationType?targetKey=5",
            icon: <RiFileListLine />
        }
    ];
};