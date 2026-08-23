"use client";
import React from "react";
import AccountActivityReport from "../../../../components/accounting/AccountActivityReport";

export default function CogsPage() {
     return (
          <AccountActivityReport
               accountCode="acc-5000"
               title="Cost of Goods Sold"
               subtitle="Stock consumed and charged to cost of sales"
          />
     );
}
