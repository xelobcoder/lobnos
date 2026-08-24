import { Link } from '../types';
import {
     RiDashboardLine,
     RiExchangeFundsLine,
     RiQuillPenLine,
     RiPlayListAddLine,
     RiBookletLine,
     RiFileList3Line,
     RiUserReceived2Line,
     RiUserShared2Line,
     RiScales3Line,
     RiLineChartLine,
     RiBarChartBoxLine,
     RiWaterFlashLine,
     RiCheckDoubleLine,
     RiBankLine,
     RiArchiveDrawerLine,
     RiStackLine,
     RiPriceTag3Line,
     RiDeleteBin6Line,
     RiPieChartLine,
     RiFundsLine,
     RiBuilding2Line,
     RiShieldCheckLine,
     RiPulseLine,
     RiCalendarCheckLine,
     RiLockLine,
     RiArchiveLine
} from '@remixicon/react';

export const AccountingLinks: Link[] = [
     {
          title: "Financial Overview",
          link: "/accounting",
          icon: <RiDashboardLine size={20} />
     },
     {
          title: "Transactions",
          link: "/accounting/manual-journals",
          icon: <RiExchangeFundsLine size={20} />,
          children: [
               { title: "Journal Entries", link: "/accounting/manual-journals", icon: <RiQuillPenLine size={18} /> },
               { title: "New Journal Entry", link: "/accounting/manual-journals/new", icon: <RiPlayListAddLine size={18} /> }
          ]
     },
     {
          title: "Ledgers",
          link: "/accounting/general-ledger",
          icon: <RiBookletLine size={20} />,
          children: [
               { title: "General Ledger", link: "/accounting/general-ledger", icon: <RiFileList3Line size={18} /> },
               { title: "Accounts Receivable", link: "/accounting/receivables", icon: <RiUserReceived2Line size={18} /> },
               { title: "Accounts Payable", link: "/accounting/payables", icon: <RiUserShared2Line size={18} /> }
          ]
     },
     {
          title: "Financial Statements",
          link: "/accounting/trial-balance",
          icon: <RiScales3Line size={20} />,
          children: [
               { title: "Trial Balance", link: "/accounting/trial-balance", icon: <RiScales3Line size={18} /> },
               { title: "Profit & Loss", link: "/accounting/income-statement", icon: <RiLineChartLine size={18} /> },
               { title: "Balance Sheet", link: "/accounting/balance-sheet", icon: <RiBarChartBoxLine size={18} /> },
               { title: "Cash Flow", link: "/accounting/cash-flow", icon: <RiWaterFlashLine size={18} /> }
          ]
     },
     {
          title: "Reconciliation",
          link: "/accounting/reconciliation",
          icon: <RiCheckDoubleLine size={20} />,
          children: [
               { title: "AR Reconciliation", link: "/accounting/reconciliation?ledger=AR", icon: <RiUserReceived2Line size={18} /> },
               { title: "AP Reconciliation", link: "/accounting/reconciliation?ledger=AP", icon: <RiUserShared2Line size={18} /> },
               { title: "Inventory Reconciliation", link: "/accounting/inventory/valuation", icon: <RiArchiveDrawerLine size={18} /> },
               { title: "Bank Reconciliation", link: "/accounting/bank-reconciliation", icon: <RiBankLine size={18} /> },
               { title: "Bank Accounts", link: "/accounting/bank-accounts", icon: <RiBankLine size={18} /> }
          ]
     },
     {
          title: "Inventory Accounting",
          link: "/accounting/inventory/valuation",
          icon: <RiStackLine size={20} />,
          children: [
               { title: "Inventory Valuation", link: "/accounting/inventory/valuation", icon: <RiArchiveDrawerLine size={18} /> },
               { title: "Cost of Goods Sold", link: "/accounting/inventory/cogs", icon: <RiPriceTag3Line size={18} /> },
               { title: "Stock Adjustments", link: "/accounting/inventory/adjustments", icon: <RiExchangeFundsLine size={18} /> },
               { title: "Wastage", link: "/accounting/inventory/wastage", icon: <RiDeleteBin6Line size={18} /> }
          ]
     },
     {
          title: "Management",
          link: "/accounting/management/revenue",
          icon: <RiPieChartLine size={20} />,
          children: [
               { title: "Revenue Analysis", link: "/accounting/management/revenue", icon: <RiLineChartLine size={18} /> },
               { title: "Expense Analysis", link: "/accounting/management/expenses", icon: <RiFundsLine size={18} /> },
               { title: "Branch Performance", link: "/accounting/management/branches", icon: <RiBuilding2Line size={18} /> }
          ]
     },
     {
          title: "Period & Close",
          link: "/accounting/periods",
          icon: <RiCalendarCheckLine size={20} />,
          children: [
               { title: "Accounting Periods", link: "/accounting/periods", icon: <RiCalendarCheckLine size={18} /> },
               { title: "Year-End Close", link: "/accounting/year-end-close", icon: <RiLockLine size={18} /> },
               { title: "Opening Balances", link: "/accounting/opening-balances", icon: <RiArchiveLine size={18} /> }
          ]
     },
     {
          title: "Audit",
          link: "/accounting/posting-health",
          icon: <RiShieldCheckLine size={20} />,
          children: [
               { title: "Posting Exceptions", link: "/accounting/posting-health", icon: <RiPulseLine size={18} /> },
               { title: "Delegated Authority", link: "/accounting/delegations", icon: <RiShieldCheckLine size={18} /> },
               { title: "Audit Trail", link: "/accounting/general-ledger", icon: <RiFileList3Line size={18} /> }
          ]
     }
];
