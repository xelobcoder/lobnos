import AppCustomLayout from "../Layout/CustomLayout";
import BookShelfSvg from "../icons/BookShelfSvg";
import PlusBookShelf from "../icons/PlusOutlineSvg";
import GroupIconSvg from "../icons/groupIconSvg";
import MoneyIconSvg from "../icons/moneyIconSvg";

export default function ExpenseLayout({ children }) {
  const sideLinks = [
    { title: "expenses", link: "/expense", icon: <MoneyIconSvg/> },
    { title: "expense category", link: "/expense/category", icon: <GroupIconSvg/> },
    { title: "new Expense", link: "/expense/newExpense", icon: <BookShelfSvg/>},
    { title: "New Expense Request", link: "/expense/request", icon: <PlusBookShelf/> },
  ];
  return (
    <>
      <AppCustomLayout sideLinks={sideLinks}>{children}</AppCustomLayout>
    </>
  );
}
