"use client";
import React from "react";
import PeriodAnalysisReport from "../../../../components/accounting/PeriodAnalysisReport";

export default function ExpenseAnalysisPage() {
     return (
          <PeriodAnalysisReport
               type="expense"
               title="Expense Analysis"
               subtitle="Expense accounts broken down by month"
          />
     );
}
