import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { ExpenseAnalyticsLinks } from "../../../components/Layout/links/categories/expenseAnalyticsLinks";

export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <ApplicationProvider>
       <PrimeLayout links={ExpenseAnalyticsLinks}>
       {children}
       </PrimeLayout>
      </ApplicationProvider>
    </Suspense>
  );
}
