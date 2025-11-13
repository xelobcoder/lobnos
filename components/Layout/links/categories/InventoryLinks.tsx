import { Link } from '../types';
import {
     RiStoreLine,
     RiBox3Line,
     RiPriceTagLine,
     RiTruckLine,
     RiTestTubeLine,
     RiHistoryLine,
     RiBarChartBoxLine,
     RiFileListLine,
     RiAddLine,
     RiDownloadLine,
     RiUploadLine,
     RiCameraLine,
     RiMapPinLine,
     RiSubtractLine,
     RiShoppingCartLine,
     RiTrademarkLine,
     RiDeleteBinLine,
     RiAlertLine
} from '@remixicon/react';

export const InventoryLinks: Link[] = [
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
          title: "Transactions",
          link: "/inventory/transactions",
          icon: <RiHistoryLine />
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
     {
          title: "Data Operations",
          link: "",
          icon: <RiFileListLine />,
          children: [
               { title: "Export Data", link: "/inventory/export", icon: <RiDownloadLine /> },
               { title: "Import Data", link: "/inventory/import", icon: <RiUploadLine /> },
               { title: "Camera Capture", link: "/inventory/camera", icon: <RiCameraLine /> }
          ]
     }
];