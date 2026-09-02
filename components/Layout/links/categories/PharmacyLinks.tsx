import { Link } from '../types';
import {
     RiShoppingCartLine,
     RiFileListLine,
     RiMedicineBottleLine,
     RiAlarmWarningLine,
     RiArchiveLine,
     RiDashboardLine,
     RiBankCardLine,
     RiSettings3Line,
} from '@remixicon/react';

export const PharmacyLinks: Link[] = [
     {
          title: "Overview",
          link: "/pharmacy",
          icon: <RiDashboardLine />,
     },
     {
          title: "Point of Sale",
          link: "/pharmacy/sell",
          icon: <RiShoppingCartLine />,
     },
     {
          title: "Cashier",
          link: "/pharmacy/cashier",
          icon: <RiBankCardLine />,
     },
     {
          title: "Sales History",
          link: "/pharmacy/sales-history",
          icon: <RiFileListLine />,
     },
     {
          title: "Pharmacy Items",
          link: "/pharmacy/catalogue",
          icon: <RiMedicineBottleLine />,
     },
     {
          title: "Stock Levels",
          link: "/pharmacy/stock",
          icon: <RiArchiveLine />,
     },
     {
          title: "Low Stock Alerts",
          link: "/pharmacy/stock?filter=low",
          icon: <RiAlarmWarningLine />,
     },
     {
          title: "Settings",
          link: "/pharmacy/settings",
          icon: <RiSettings3Line />,
     },
];
