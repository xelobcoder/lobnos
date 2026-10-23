import { useEffect, useState } from "react";
import { customFetch } from "../../components/Auth/customFetch";
import ExpenseList from "./ExpenseListComponent";
import ExpenseDetail from "./ExpenseDetailsComponent";
import Modal from 'react-bootstrap/Modal';

const defaultFilterState = { from: "", to: "", status: "" };

export default function AdminExpensesList({ branchid, employeeid }) {
	const [detail, setDetails] = useState(true);
	const [selected, setSelected] = useState(null);
	const [expenses, setExpenses] = useState([]);
	const [filter, setFilter] = useState(defaultFilterState);
	const [selectedLoading, setSelectedLoading] = useState(false);
	const [imagefull, setImageFull] = useState(false);
	const [page, setPage] = useState({ count: 10, page: 1 });

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
	}, [filter, page, employeeid, branchid]);

	const handleFilters = () => {
		setPage((prev) => ({ ...prev, page: 1 }));
		getExpenseData();
	};

	return (
		<div className="container-fluid p-4">
			<ExpenseList
				expenses={expenses}
				setSelected={setSelected}
				selected={selected}
				employeeid={employeeid}
				filter={filter}
				branchid={branchid}
				setFilter={setFilter}
				setExpenses={setExpenses}
				handleFilters={handleFilters}
			/>
			<Modal fullscreen="sm-down" scrollable data-expense-dialog="true"
				show={!!selected}
				onHide={() => { setSelected(null); }}
				size="lg"
				backdrop="static"
			>
				<Modal.Header
					closeButton
					onHide={() => { setSelected(null); }}
					className="border-bottom py-3"
				>
					<Modal.Title className="fw-semibold" style={{ fontSize: '1.1rem' }}>
						Expense Details
					</Modal.Title>
				</Modal.Header>
				<Modal.Body
					className="p-4"
				>
					<ExpenseDetail
						detail={selected}
						imagefull={imagefull}
						setImageFull={setImageFull}
						selectedLoading={selectedLoading}
					/>
				</Modal.Body>
			</Modal>
		</div>
	);
}
