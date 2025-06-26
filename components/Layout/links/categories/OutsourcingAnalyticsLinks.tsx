import { Link } from '../types';
import { plsEncryption } from "../../../../lib/encryption";
import { RiExternalLinkLine, RiBuildingLine, RiOrganizationChart } from '@remixicon/react';

export const OutSourcingAnalyticsLinks = function (branchid: number, employeeid: number): Link[] {
    const branchId = plsEncryption(branchid.toString());
    return [
        {
            title: "Total Sales from Outsourced Services",
            link: "/sales/totalSalesFromOutsourcedServices?targetKey=34",
            icon: <RiExternalLinkLine />
        },
        {
            title: "Sales from Outsourced by Branch",
            link: "/sales/salesFromOutsourcedByBranch?targetKey=35",
            icon: <RiBuildingLine />
        },
        {
            title: "Number of Outsourced Services by Org",
            link: "/sales/numberOfOutsourcedServicesByOrg?targetKey=36",
            icon: <RiOrganizationChart />
        }
    ];
};