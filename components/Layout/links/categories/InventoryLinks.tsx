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
     RiTrademarkLine
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
          title: "Brands",
          link: "/inventory/brands",
          icon: <RiTrademarkLine />
     },
     {
          title: "Purchase Orders",
          link: "/inventory/orders",
          icon: <RiShoppingCartLine />
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
          title: "Management",
          link: "",
          icon: <RiStoreLine />,
          children: [
               { title: "Add Item", link: "/inventory/add-item", icon: <RiAddLine /> },
               { title: "Add Category", link: "/inventory/add-category", icon: <RiPriceTagLine /> },
               { title: "Add Supplier", link: "/inventory/add-supplier", icon: <RiTruckLine /> },
               { title: "Add Brand", link: "/inventory/add-brand", icon: <RiTrademarkLine /> },
               { title: "Create Template", link: "/inventory/create-template", icon: <RiTestTubeLine /> },
               { title: "Record Transaction", link: "/inventory/record-transaction", icon: <RiSubtractLine /> }
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