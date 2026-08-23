"use client";
import React from "react";
import SubledgerReport from "../../../components/accounting/SubledgerReport";

export default function ReceivablesPage() {
     return (
          <SubledgerReport
               ledger="AR"
               title="Accounts Receivable"
               subtitle="What customers owe, reconciled against the receivables control account"
               partyLabel="Customer"
          />
     );
}
