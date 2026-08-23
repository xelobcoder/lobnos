"use client";
import React from "react";
import AccountActivityReport from "../../../../components/accounting/AccountActivityReport";

export default function StockAdjustmentsPage() {
     return (
          <AccountActivityReport
               accountCode="acc-1003"
               title="Stock Adjustments"
               subtitle="Every movement through the inventory control account"
          />
     );
}
