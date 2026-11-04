"use client";
import React from "react";
import SubledgerReport from "../../../components/accounting/SubledgerReport";

export default function ReceivablesPage() {
     return (
          <SubledgerReport
               ledger="AR"
               title="Accounts Receivable"
               subtitle="Current unpaid balances by bill date and payer; NHIS receipts are separate from noncash settlements"
               partyLabel="Payer"
          />
     );
}
