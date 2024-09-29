// pages/AdminExpensesList.js
import { useEffect, useState } from "react";
import ExpenseLayout from "../../components/Expense/ExpenseLayout";
import { customFetch, customPost, updatePagination } from "../../components/Auth/customFetch";
import ExpenseRejectionModal from "./ExpenseRejectionModal";
import { toast, ToastContainer } from "react-toastify";
import ExpenseFilter from "./ExpenseFilterComponent";
import ExpenseList from "./ExpenseListComponent";
import ExpenseDetail from "./ExpenseDetailsComponent";

const defaultFilterState = { from: "", to: "", status: "" };

export default function AdminExpensesList({ branchid, employeeid }) {
  const [detail, setDetails] = useState(true);
  const [selected, setSelected] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState(defaultFilterState);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [imagefull, setImageFull] = useState(false);
  const [page, setPage] = useState({ count: 10, page: 1 });
  const [showRmodal, setRmodal] = useState(false);

  const getExpenseData = async () => {
    customFetch(`expenses/records?branchid=${branchid}&&employeeid=${employeeid}&&count=${page.count}&&page=${page.page}&&from=${filter.from}&&to=${filter.to}&&status=${filter.status}`)
      .then((data) => {
        setExpenses(data);
      })
      .catch(() => {
        setExpenses([]);
      });
  };

  useEffect(() => {
    if (employeeid && branchid) {
      getExpenseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page, employeeid, branchid]);

  const handleFilters = () => {
    setPage((prev) => ({ ...prev, page: 1 }));
    getExpenseData();
  };

  return (
    <ExpenseLayout>
      <ToastContainer />
      <ExpenseFilter filter={filter} setFilter={setFilter} handleFilters={handleFilters} />
      <ExpenseList expenses={expenses} setSelected={setSelected} selected={selected} />
      {selected && (
        <ExpenseDetail
          detail={detail}
          setImageFull={setImageFull}
          selectedLoading={selectedLoading}
          onReject={setRmodal}
        />
      )}
      <ExpenseRejectionModal showRmodal={showRmodal} onHide={() => setRmodal(false)} />
    </ExpenseLayout>
  );
}
