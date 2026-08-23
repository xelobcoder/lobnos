"use client";
import React from "react";
import AccountActivityReport from "../../../components/accounting/AccountActivityReport";

export default function BankReconciliationPage() {
     return (
          <AccountActivityReport
               accountCode="acc-1001"
               title="Bank Book"
               subtitle="Every posting against the bank account. Statement import and matching are not built yet."
          />
     );
}
