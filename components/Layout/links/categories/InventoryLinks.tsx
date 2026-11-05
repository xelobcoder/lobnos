import { RiBookOpenLine } from '@remixicon/react';
import { Link } from '../types';
import {
     RiBox3Line,
     RiPriceTagLine,
     RiTruckLine,
     RiTestTubeLine,
     RiHistoryLine,
     RiBarChartBoxLine,
     RiFileListLine,
     RiMapPinLine,
     RiSubtractLine,
     RiShoppingCartLine,
     RiDeleteBinLine,
     RiAlertLine,
     RiCalculatorLine,
     RiMoneyDollarCircleLine,
     RiWalletLine,
     RiDashboardLine,
     RiFileChartLine,
     RiRulerLine
} from '@remixicon/react';

export const InventoryLinks: Link[] = [
    {title:"Learning Center",link:"/inventory/guide",icon:<RiBookOpenLine/>},
     {title:"Department stock",link:"/inventory/department-stock",icon:<RiBox3Line/>},
     {
          title: "Analytics Dashboard",
          link: "/inventory/analytics",
          icon: <RiDashboardLine />,
          children: [
               { title: "Overview", link: "/inventory/analytics", icon: <RiBarChartBoxLine /> },
               { title: "Purchase Orders", link: "/inventory/analytics/purchase-orders", icon: <RiShoppingCartLine /> },
               { title: "Transactions", link: "/inventory/analytics/transactions", icon: <RiHistoryLine /> },
               { title: "Payments", link: "/inventory/analytics/payments", icon: <RiMoneyDollarCircleLine /> },
               { title: 'Payment Time', link: '/inventory/analytics/payment-time', icon: <RiFileChartLine /> },
               { title: "Costs", link: "/inventory/analytics/costs", icon: <RiCalculatorLine /> },
               { title: "Suppliers", link: "/inventory/analytics/suppliers", icon: <RiTruckLine /> },
               { title: "Stock Levels", link: "/inventory/analytics/stock-levels", icon: <RiBarChartBoxLine /> },
               { title: "Movement", link: "/inventory/analytics/movement", icon: <RiHistoryLine /> },
               { title: "Batch Expiry", link: "/inventory/analytics/batch-expiry", icon: <RiAlertLine /> },
               { title: "Procurement", link: "/inventory/analytics/procurement", icon: <RiShoppingCartLine /> },
               { title: "Cost Valuation", link: "/inventory/analytics/cost-valuation", icon: <RiCalculatorLine /> },
               { title: "Usage", link: "/inventory/analytics/usage", icon: <RiBarChartBoxLine /> },
               { title: "Item Analytics", link: "/inventory/analytics/items", icon: <RiBox3Line /> }

          ]
     },
     {
          title: "Overview",
          link: "/inventory",
          icon: <RiBarChartBoxLine />
     },
     {
          title: "Items",
          link: "/inventory/items",
          icon: <RiBox3Line />
     },
     {
          title: "Categories",
          link: "/inventory/categories",
          icon: <RiPriceTagLine />
     },
     {
          title: "Units",
          link: "/inventory/units",
          icon: <RiRulerLine />
     },
     {
          title: "Suppliers",
          link: "/inventory/suppliers",
          icon: <RiTruckLine />
     },
     {
          title: "Purchase Orders",
          link: "/inventory/orders",
          icon: <RiShoppingCartLine />,
          children: [
               { title: "All Orders", link: "/inventory/orders", icon: <RiFileListLine /> },
               { title: "Received Items History", link: "/inventory/orders/received-items-history", icon: <RiHistoryLine /> }
          ]
     },
     {
          title: "Payments",
          link: "/inventory/payments",
          icon: <RiMoneyDollarCircleLine />,
          children: [
               { title: "All Payments", link: "/inventory/payments", icon: <RiWalletLine /> },
               { title: "Journal Entries", link: "/inventory/payments/journal", icon: <RiFileChartLine /> }
          ]
     },
     {
          title: "Storage Locations",
          link: "/inventory/locations",
          icon: <RiMapPinLine />
     },
     {
          title: "Test Templates",
          link: "/inventory/templates",
          icon: <RiTestTubeLine />
     },
     {
          title: "Stock Consumption",
          link: "/inventory/consumption",
          icon: <RiSubtractLine />
     },
     {
          title: "Stock Wastage",
          link: "/inventory/wastage",
          icon: <RiDeleteBinLine />
     },
     {
          title: "Expired Products",
          link: "/inventory/expired-products",
          icon: <RiAlertLine />,
          children: [
               { title: "Expired Batches", link: "/inventory/expired-products", icon: <RiAlertLine /> },
               { title: "Consumption History", link: "/inventory/expired-products/consumption-history", icon: <RiHistoryLine /> }
          ]
     },
];