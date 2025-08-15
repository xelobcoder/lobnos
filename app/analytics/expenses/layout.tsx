import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { ExpenseAnalyticsLinks } from "../../../components/Layout/links/categories/expenseAnalyticsLinks";
import MAIN_LAYOUT from "../../../components/Layout/MainLayout";

export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <ApplicationProvider>
        <MAIN_LAYOUT>
          <PrimeLayout links={ExpenseAnalyticsLinks}>
            {children}
          </PrimeLayout>
        </MAIN_LAYOUT>
      </ApplicationProvider>
    </Suspense>
  );
}
