"use client";
import React from "react";
import AccountActivityReport from "../../../../components/accounting/AccountActivityReport";

export default function WastagePage() {
     return (
          <AccountActivityReport
               accountCode="acc-5006"
               title="Wastage"
               subtitle="Stock written off as expired, damaged or otherwise lost"
          />
     );
}
