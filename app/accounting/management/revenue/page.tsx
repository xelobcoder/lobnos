"use client";
import React from "react";
import PeriodAnalysisReport from "../../../../components/accounting/PeriodAnalysisReport";

export default function RevenueAnalysisPage() {
     return (
          <PeriodAnalysisReport
               type="revenue"
               title="Revenue Analysis"
               subtitle="Income accounts broken down by month"
          />
     );
}
