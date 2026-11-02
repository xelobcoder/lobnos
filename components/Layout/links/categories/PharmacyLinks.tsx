import { Link } from '../types';
import { accountingDestinations } from '../../../../lib/pharmacyAccounting';
import { RiDashboardLine, RiShoppingCartLine, RiBankCardLine, RiFileListLine, RiArchiveLine, RiBox3Line, RiMoneyDollarCircleLine, RiSettings3Line, RiRefund2Line, RiBookOpenLine } from '@remixicon/react';
const selling=['pharmacist','admin','pharmacy_manager','pharmacy_cashier','pharmacy_dispensary_officer'];
const management=['admin','pharmacy_manager'];
export const PharmacyLinks:Link[]=[
     {title:'Overview',link:'/pharmacy',icon:<RiDashboardLine/>},
     {title:'How to use pharmacy',link:'/pharmacy/guide',icon:<RiBookOpenLine/>},
     {title:'Sell & serve customers',link:'',icon:<RiShoppingCartLine/>,children:[
     {title:'Point of Sale',link:'/pharmacy/sell',icon:<RiShoppingCartLine/>,roles:selling},
     {title:'Counter invoices',link:'/pharmacy/counter',icon:<RiFileListLine/>,roles:[...selling,'pharmacy_accountant']},
     {title:'Uncollected invoices',link:'/pharmacy/collections',icon:<RiFileListLine/>,roles:[...selling,'pharmacy_accountant']},
     {title:'Prescriptions',link:'/pharmacy/prescriptions',icon:<RiFileListLine/>,roles:selling},
     {title:'Sales History',link:'/pharmacy/sales-history',icon:<RiFileListLine/>},
     {title:'Refunds & Voids',link:'/pharmacy/reversals',icon:<RiRefund2Line/>,roles:management},
     {title:'Patient Credit & Invoices',link:'/pharmacy/accounts',icon:<RiMoneyDollarCircleLine/>,roles:[...selling,'pharmacy_accountant']},
     {title:'NHIS Claims',link:'/pharmacy/nhis',icon:<RiFileListLine/>,roles:[...management,'pharmacy_accountant']},
     {title:'Pharmacist Review',link:'/pharmacy/clinical',icon:<RiFileListLine/>,roles:[...management,'pharmacist','pharmacy_dispensary_officer']},
     ]},
     {title:'Buy & manage stock',link:'',icon:<RiBox3Line/>,children:[
     {title:'Catalogue',link:'/pharmacy/catalogue',icon:<RiArchiveLine/>},
     {title:'Stock Levels',link:'/pharmacy/stock',icon:<RiArchiveLine/>},
     {title:'Inventory & Suppliers',link:'/pharmacy/inventory',icon:<RiBox3Line/>,roles:[...management,'pharmacy_storekeeper']},
     {title:'Purchase requests',link:'/pharmacy/inventory/purchase-requests',icon:<RiFileListLine/>,roles:[...management,'pharmacy_storekeeper']},
     {title:'Stock safety & checks',link:'/pharmacy/stock-control',icon:<RiBox3Line/>,roles:[...management,'pharmacy_storekeeper']},
     ]},
     {title:'Cash & day closing',link:'',icon:<RiBankCardLine/>,children:[
     {title:'Cashier & Shift',link:'/pharmacy/cashier',icon:<RiBankCardLine/>,roles:[...selling,'pharmacy_accountant']},
     {title:'Cash & Financial Days',link:'/pharmacy/finance',icon:<RiBankCardLine/>,roles:[...management,'pharmacy_accountant']},
     ]},
     {title:'Analytics & Reports',link:'/pharmacy/analytics',icon:<RiDashboardLine/>,roles:[...management,'pharmacy_accountant','pharmacy_storekeeper']},
     {title:'Pharmacy Accounting',link:'/pharmacy/accounting',icon:<RiMoneyDollarCircleLine/>,roles:[...management,'pharmacy_accountant'],children:accountingDestinations.map(([section,title])=>({title,link:`/pharmacy/accounting${section?`/${section}`:''}`,roles:[...management,'pharmacy_accountant']}))},
     {title:'Setup & staff',link:'',icon:<RiSettings3Line/>,roles:management,children:[
     {title:'Staff & roles',link:'/account/staff',icon:<RiSettings3Line/>,roles:management},
     {title:'Settings',link:'/pharmacy/settings',icon:<RiSettings3Line/>,roles:management},
     ]},
];
