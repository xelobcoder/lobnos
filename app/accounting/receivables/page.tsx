"use client";
import React from "react";
import SubledgerReport from "../../../components/accounting/SubledgerReport";

export default function ReceivablesPage() {
     return (
          <SubledgerReport
               ledger="AR"
               title="Accounts Receivable"
               subtitle="Current unpaid patient bills by bill date"
               partyLabel="Patient"
          />
     );
}
