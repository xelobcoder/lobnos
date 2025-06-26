"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Pagination } from "react-bootstrap";
import { currencyFormatter, customFetch, updatePagination } from "../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import ExpenseStatusButtons from "../../../components/Layout/ExpenseStatusButtons";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";


interface Expense {
	id: number;
	name: string;
	merchant: string;
	username: string;
	date: string;
	createdon: string;
	amount: number;
	approved: number;
}

export default function ExpenseList() {
	const from= useSearchParams()?.get('from') || ''
	const to = useSearchParams()?.get('to')|| ''
	const status = useSearchParams()?.get('status') || ''
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [filter, setFiltering] = useState({ page: 1, count: 10 });
	const [shouldLoad, setLoad] = useState(false);
	const [filtering, setUserFiltering] = useState({ from: from, to, status});
	const { applicationsettings } = useApplicationSettings();
	const { employeeid, username, role } = applicationsettings.user;
	const branchid = applicationsettings.branchid;

	const columns = [
		{ Header: 'Expense', accessor: 'name' },
		{ Header: 'Merchant', accessor: 'merchant' },
		{ Header: "Submitter", accessor: 'username' },
		{
			Header: 'Expense Date',
			accessor: 'date',
			Cell: ({ value }: { value: string }) => new Date(value).toLocaleDateString()
		},
		{
			Header: 'Submitted On',
			accessor: 'createdon',
			Cell: ({ value }: { value: string }) => new Date(value).toLocaleDateString()
		},
		{
			Header: 'Amount',
			accessor: 'amount',
			Cell: ({ value }: { value: number }) => currencyFormatter.format(value)
		},
		{
			Header: 'Status',
			accessor: "approved",
			Cell: ({ value, row }: { value: number, row: { original: Expense } }) => (
				<ExpenseStatusButtons status={value} expenseId={row.original.id} />
			)
		}
	];

	useEffect(() => {
		if (employeeid && branchid) {
			customFetch(`expenses/records?branchid=${branchid}&employeeid=${employeeid}&page=${filter.page}&count=${filter.count}`)
				.then((data) => {
					setExpenses(data);
				})
				.catch((err) => {
					console.error('Error fetching expenses:', err);
				});
		}
	}, [employeeid, branchid, filter]);


	const handleExpenseFiltering = async () => {
		try {
			const response = await customFetch(`expenses/records?branchid=${branchid}&employeeid=${employeeid}&page=${filter.page}&count=${filter.count}&&from=${filtering.from}&&to=${filtering.to}&&status=${filtering.status}`)
			if (response && Array.isArray(response)) {
				setExpenses(response);
			}
		} catch (err) {
			toast.error('Error Occured Loading Information')
		}
	}



	return (
		<div className="container-fluid p-3">
			<section className="mb-3">
				<div className="d-flex flex-wrap align-items-center gap-2">
					<input
						value={filtering.from}
						onChange={(ev) => { setUserFiltering({ ...filtering, from: ev.target.value }) }}
						type="date"
						className="form-control form-control-sm w-auto"
					/>
					<input
						value={filtering.to}
						onChange={(ev) => { setUserFiltering({ ...filtering, to: ev.target.value }) }}
						type="date"
						className="form-control form-control-sm w-auto"
					/>
					<select className="form-select form-select-sm w-auto" value={filtering.status}
						onChange={(ev) => { setUserFiltering({ ...filtering, status: ev.target.value }) }}>
						<option value=''>Select an option here </option>
						<option value='approved'>Approved</option>
						<option value='rejected'>Rejected</option>
						<option value='requested'>Requested</option>
					</select>
					<button className="btn btn-primary btn-sm" onClick={(ev) => { handleExpenseFiltering() }}>
						Search
					</button>
				</div>
			</section>

			<div className="bg-light p-2 rounded mb-3 fw-medium">
				User Requested Expenses
			</div>

			<PrimeTable
				handleSeverSideProcessing={null}
				column={columns}
				data={expenses || []}
				serverSideFiltering={true}
				filtering={false}
			/>
		</div>
	);
}