"use client";
import React from "react";
import SubledgerReport from "../../../components/accounting/SubledgerReport";

export default function PayablesPage() {
     return (
          <SubledgerReport
               ledger="AP"
               title="Accounts Payable"
               subtitle="What the business owes suppliers, reconciled against the payables control account"
               partyLabel="Supplier"
          />
     );
}
