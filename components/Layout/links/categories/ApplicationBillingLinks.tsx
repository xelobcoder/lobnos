import { Link } from '../types';
import { 
    RiUserSearchLine,
    RiPagesLine,  
    RiMoonLine,
    RiExchangeDollarLine,
    RiRefundLine,
    RiMoneyDollarCircleLine,
    RiSettings2Line
} from '@remixicon/react';

export const ApplicationBillingLinks = function (branchid: number, employeeid: number): Link[] {
    return [
        { title: 'Filter Client', link: '/billing/patientid', icon: <RiUserSearchLine /> },
        { title: 'packages', link: '/billing/packages/create-new-package', icon: <RiPagesLine /> },  // Updated icon
        { title: 'Bill settings Night Adjustment', link: '/billing/settings/night-adjustments', icon: <RiMoonLine /> },
        { title: 'Daily Transactions', link: '/billing/sales/branches', icon: <RiExchangeDollarLine /> },
        { title: "Refund Admin", link: `/billing/refund/refundAdmin/${employeeid}`, icon: <RiRefundLine /> },
        { title: "Refund FrontDesk Representative", link: `/billing/refund/${employeeid}`, icon: <RiRefundLine /> },
        { title: "Sales", link: "/billing/salessummary", icon: <RiMoneyDollarCircleLine /> }
        {title:"Application UI customization", link:"/settings/applicationsettings/customization", icon: 
            <RiSettings2Line/>
        }
    ];
};