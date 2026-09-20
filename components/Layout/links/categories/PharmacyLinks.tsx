import { Link } from '../types';
import {
     RiShoppingCartLine,
     RiFileListLine,
     RiMedicineBottleLine,
     RiAlarmWarningLine,
     RiArchiveLine,
     RiDashboardLine,
     RiBankCardLine,
     RiRefund2Line,
     RiSettings3Line,
     RiBox3Line,
     RiTruckLine,
     RiRulerLine,
     RiMapPinLine,
     RiDeleteBinLine,
     RiMoneyDollarCircleLine,
     RiBarChartBoxLine,
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
          title: "Prescriptions",
          link: "/pharmacy/prescriptions",
          icon: <RiFileListLine />,
     },
     {
          title: "Sales History",
          link: "/pharmacy/sales-history",
          icon: <RiFileListLine />,
     },
     {
          title: "Refunds & Voids",
          link: "/pharmacy/reversals",
          icon: <RiRefund2Line />,
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
          title: "Inventory Management",
          link: "/inventory/items?inventory_domain=pharmacy&workspace=pharmacy",
          icon: <RiBox3Line />,
          children: [
               { title: "Inventory Overview", link: "/inventory?workspace=pharmacy", icon: <RiDashboardLine /> },
               { title: "Inventory Analytics", link: "/inventory/analytics?workspace=pharmacy", icon: <RiBarChartBoxLine /> },
               { title: "Manage Items", link: "/inventory/items?inventory_domain=pharmacy&workspace=pharmacy", icon: <RiBox3Line /> },
               { title: "Purchase Orders", link: "/inventory/orders?inventory_domain=pharmacy&workspace=pharmacy", icon: <RiShoppingCartLine /> },
               { title: "Received Items", link: "/inventory/orders/received-items-history?workspace=pharmacy", icon: <RiFileListLine /> },
               { title: "Suppliers", link: "/inventory/suppliers?workspace=pharmacy", icon: <RiTruckLine /> },
               { title: "Units", link: "/inventory/units?workspace=pharmacy", icon: <RiRulerLine /> },
               { title: "Storage Locations", link: "/inventory/locations?workspace=pharmacy", icon: <RiMapPinLine /> },
               { title: "Supplier Payments", link: "/inventory/payments?workspace=pharmacy", icon: <RiMoneyDollarCircleLine /> },
               { title: "Payment Journal", link: "/inventory/payments/journal?workspace=pharmacy", icon: <RiFileListLine /> },
               { title: "Stock Consumption", link: "/inventory/consumption?workspace=pharmacy", icon: <RiArchiveLine /> },
               { title: "Stock Wastage", link: "/inventory/wastage?workspace=pharmacy", icon: <RiDeleteBinLine /> },
               { title: "Expired Products", link: "/inventory/expired-products?workspace=pharmacy", icon: <RiAlarmWarningLine /> },
               { title: "Consumption History", link: "/inventory/expired-products/consumption-history?workspace=pharmacy", icon: <RiFileListLine /> },
          ],
     },
     {
          title: "Settings",
          link: "/pharmacy/settings",
          icon: <RiSettings3Line />,
     },
];
