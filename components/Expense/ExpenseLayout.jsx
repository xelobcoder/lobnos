import DefaultSvg from "../icons/Default";
import AppCustomLayout from "../Layout/CustomLayout";

export default function ExpenseLayout({ children }) {
  const sideLinks = [
    { title: "expenses", link: "/expense", icon: <DefaultSvg /> },
    { title: "expense category", link: "/expense/category", icon: <DefaultSvg /> },
    { title: "new Expense", link: "/expense/newExpense", icon: <DefaultSvg /> },
    { title: "New Expense Request", link: "/expense/request", icon: <DefaultSvg /> },
  ];
  return (
    <>
      <AppCustomLayout sideLinks={sideLinks}>{children}</AppCustomLayout>
    </>
  );
}
