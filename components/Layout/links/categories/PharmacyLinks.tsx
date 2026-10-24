import { Link } from '../types';
import { RiDashboardLine, RiShoppingCartLine, RiBankCardLine, RiFileListLine, RiArchiveLine, RiBox3Line, RiMoneyDollarCircleLine, RiSettings3Line, RiRefund2Line } from '@remixicon/react';
const selling=['admin','pharmacy_manager','pharmacy_cashier','pharmacy_dispensary_officer'];
const management=['admin','pharmacy_manager'];
export const PharmacyLinks:Link[]=[
     {title:'Overview',link:'/pharmacy',icon:<RiDashboardLine/>},
     {title:'Point of Sale',link:'/pharmacy/sell',icon:<RiShoppingCartLine/>,roles:selling},
     {title:'Cashier & Shift',link:'/pharmacy/cashier',icon:<RiBankCardLine/>,roles:[...selling,'pharmacy_accountant']},
     {title:'Prescriptions',link:'/pharmacy/prescriptions',icon:<RiFileListLine/>,roles:selling},
     {title:'Sales History',link:'/pharmacy/sales-history',icon:<RiFileListLine/>},
     {title:'Refunds & Voids',link:'/pharmacy/reversals',icon:<RiRefund2Line/>,roles:management},
     {title:'Catalogue',link:'/pharmacy/catalogue',icon:<RiArchiveLine/>},
     {title:'Stock Levels',link:'/pharmacy/stock',icon:<RiArchiveLine/>},
     {title:'Inventory & Suppliers',link:'/pharmacy/inventory',icon:<RiBox3Line/>,roles:[...management,'pharmacy_storekeeper']},
     {title:'Pharmacy Finances',link:'/pharmacy/finance',icon:<RiMoneyDollarCircleLine/>,roles:[...management,'pharmacy_accountant']},
     {title:'Settings',link:'/pharmacy/settings',icon:<RiSettings3Line/>,roles:management},
];
