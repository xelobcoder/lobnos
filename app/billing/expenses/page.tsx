"use client";

import { useState, useEffect } from "react";
import { currencyFormatter, customFetch } from "../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import ExpenseStatusButtons from "../../../components/Layout/ExpenseStatusButtons";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { RiSearchLine } from "@remixicon/react";

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
	const from = useSearchParams()?.get("from") || "";
	const to = useSearchParams()?.get("to") || "";
	const status = useSearchParams()?.get("status") || "";

	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [filter, setFiltering] = useState({
		page: 1,
		count: 10,
	});

	const [shouldLoad, setLoad] = useState(false);

	const [filtering, setUserFiltering] = useState({
		from: from,
		to,
		status,
	});

	const { applicationsettings } = useApplicationSettings();
	const { employeeid, username, role } = applicationsettings.user;
	const branchid = applicationsettings.branchid;

	const columns = [
		{
			Header: "Expense",
			accessor: "name",
		},
		{
			Header: "Merchant",
			accessor: "merchant_name",
		},
		{
			Header: "Submitter",
			accessor: "username",
		},
		{
			Header: "Expense Date",
			accessor: "date",
			Cell: ({ value }: { value: string }) =>
				new Date(value).toLocaleDateString(),
		},
		{
			Header: "Submitted On",
			accessor: "createdon",
			Cell: ({ value }: { value: string }) =>
				new Date(value).toLocaleDateString(),
		},
		{
			Header: "Amount",
			accessor: "amount",
			Cell: ({ value }: { value: number }) =>
				currencyFormatter.format(value),
		},
		{
			Header: "Status",
			accessor: "approved",
			Cell: ({
				value,
				row,
			}: {
				value: number;
				row: { original: Expense };
			}) => (
				<ExpenseStatusButtons
					status={value}
					expenseId={row.original.id}
				/>
			),
		},
	];

	useEffect(() => {
		if (employeeid && branchid) {
			customFetch(
				`expenses/records?branchid=${branchid}&employeeid=${employeeid}&page=${filter.page}&count=${filter.count}`
			)
				.then((data) => {
					setExpenses(data);
				})
				.catch((err) => {
					console.error("Error fetching expenses:", err);
				});
		}
	}, [employeeid, branchid, filter]);

	const handleExpenseFiltering = async () => {
		try {
			const response = await customFetch(
				`expenses/records?branchid=${branchid}&employeeid=${employeeid}&page=${filter.page}&count=${filter.count}&&from=${filtering.from}&&to=${filtering.to}&&status=${filtering.status}`
			);

			if (response && Array.isArray(response)) {
				setExpenses(response);
			}
		} catch (err) {
			toast.error("Error Occured Loading Information");
		}
	};

	const handleServerProcessing = async (pagination: {
		page: number;
		count: number;
		from: string;
		to: string;
		sortby?: string;
		status: string;
	}) => {
		const {
			count,
			page,
			from,
			to,
			status,
			sortby = "ASC",
		} = pagination;

		try {
			const response = await customFetch(
				`expenses/records?branchid=${branchid}&employeeid=${employeeid}&page=${page}&count=${count}&&from=${from}&&to=${to}&&status=${status}&&sortby=${sortby}`
			);

			if (response && Array.isArray(response)) {
				setExpenses(response);

				return {
					result: response,
					error: false,
				};
			} else {
				setExpenses([]);

				return {
					result: [],
					error: true,
				};
			}
		} catch (err) {
			toast.error("Error Occured Loading Information");

			return {
				result: [],
				error: true,
			};
		}
	};

	return (
		<div
			className="container-fluid"
			style={{
				padding: "20px",
				backgroundColor: "#f8f9fa",
				minHeight: "100%",
			}}
		>
			{/* =====================================================
			    PAGE HEADER
			===================================================== */}
			<div
				className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2"
				style={{
					minHeight: "44px",
				}}
			>
				<div>
					<h5
						style={{
							margin: 0,
							fontSize: "18px",
							fontWeight: 600,
							color: "#212529",
							letterSpacing: "-0.2px",
						}}
					>
						Expense Management
					</h5>

					<div
						style={{
							marginTop: "4px",
							fontSize: "12px",
							color: "#6c757d",
						}}
					>
						Review and manage user requested expenses
					</div>
				</div>
			</div>

			{/* =====================================================
			    FILTER CARD
			===================================================== */}
			<section
				className="mb-3"
				style={{
					backgroundColor: "#ffffff",
					border: "1px solid #e8ebef",
					borderRadius: "10px",
					padding: "18px",
					boxShadow: "0 2px 8px rgba(0, 0, 0, 0.035)",
				}}
			>
				{/* Filter Header */}
				<div
					className="d-flex align-items-center"
					style={{
						paddingBottom: "13px",
						marginBottom: "16px",
						borderBottom: "1px solid #f0f1f3",
					}}
				>
					<div
						style={{
							width: "34px",
							height: "34px",
							borderRadius: "8px",
							backgroundColor: "#f0f5ff",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							marginRight: "10px",
							flexShrink: 0,
						}}
					>
						<RiSearchLine
							size={17}
							style={{
								color: "#0d6efd",
							}}
						/>
					</div>

					<div>
						<div
							style={{
								fontSize: "14px",
								fontWeight: 600,
								color: "#343a40",
								lineHeight: "18px",
							}}
						>
							Filter Expenses
						</div>

						<div
							style={{
								fontSize: "11px",
								color: "#8a9198",
								marginTop: "2px",
							}}
						>
							Filter records by date and approval status
						</div>
					</div>
				</div>

				<div className="row g-3 align-items-end">

					{/* From Date */}
					<div className="col-12 col-md-6 col-xl-3">
						<label
							className="form-label"
							style={{
								fontSize: "12px",
								fontWeight: 600,
								color: "#495057",
								marginBottom: "6px",
							}}
						>
							From Date
						</label>

						<input
							value={filtering.from}
							onChange={(ev) =>
								setUserFiltering({
									...filtering,
									from: ev.target.value,
								})
							}
							type="date"
							className="form-control form-control-sm"
							style={{
								height: "40px",
								borderRadius: "7px",
								border: "1px solid #dfe3e7",
								fontSize: "13px",
								color: "#343a40",
								backgroundColor: "#ffffff",
								boxShadow: "none",
							}}
						/>
					</div>

					{/* To Date */}
					<div className="col-12 col-md-6 col-xl-3">
						<label
							className="form-label"
							style={{
								fontSize: "12px",
								fontWeight: 600,
								color: "#495057",
								marginBottom: "6px",
							}}
						>
							To Date
						</label>

						<input
							value={filtering.to}
							onChange={(ev) =>
								setUserFiltering({
									...filtering,
									to: ev.target.value,
								})
							}
							type="date"
							className="form-control form-control-sm"
							style={{
								height: "40px",
								borderRadius: "7px",
								border: "1px solid #dfe3e7",
								fontSize: "13px",
								color: "#343a40",
								backgroundColor: "#ffffff",
								boxShadow: "none",
							}}
						/>
					</div>

					{/* Status */}
					<div className="col-12 col-md-6 col-xl-3">
						<label
							className="form-label"
							style={{
								fontSize: "12px",
								fontWeight: 600,
								color: "#495057",
								marginBottom: "6px",
							}}
						>
							Status
						</label>

						<select
							className="form-select form-select-sm"
							value={filtering.status}
							onChange={(ev) =>
								setUserFiltering({
									...filtering,
									status: ev.target.value,
								})
							}
							style={{
								height: "40px",
								borderRadius: "7px",
								border: "1px solid #dfe3e7",
								fontSize: "13px",
								color: "#343a40",
								backgroundColor: "#ffffff",
								cursor: "pointer",
								boxShadow: "none",
							}}
						>
							<option value="">All Statuses</option>
							<option value="approved">Approved</option>
							<option value="rejected">Rejected</option>
							<option value="requested">Requested</option>
						</select>
					</div>

					{/* Search */}
					<div className="col-12 col-md-6 col-xl-3">
						<button
							type="button"
							className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center"
							onClick={() => handleExpenseFiltering()}
							style={{
								height: "40px",
								borderRadius: "7px",
								fontSize: "13px",
								fontWeight: 500,
								border: "none",
								boxShadow:
									"0 2px 5px rgba(13, 110, 253, 0.18)",
							}}
						>
							<RiSearchLine
								size={16}
								style={{
									marginRight: "7px",
								}}
							/>

							<span>Search</span>
						</button>
					</div>
				</div>
			</section>

			{/* =====================================================
			    TABLE SECTION HEADER
			===================================================== */}
			<div
				className="d-flex align-items-center justify-content-between mb-2"
				style={{
					backgroundColor: "#ffffff",
					border: "1px solid #e8ebef",
					borderRadius: "9px",
					padding: "12px 15px",
					boxShadow: "0 1px 4px rgba(0, 0, 0, 0.025)",
				}}
			>
				<div className="d-flex align-items-center">
					<div
						style={{
							width: "4px",
							height: "22px",
							borderRadius: "4px",
							backgroundColor: "#0d6efd",
							marginRight: "10px",
							flexShrink: 0,
						}}
					/>

					<div>
						<div
							style={{
								fontSize: "14px",
								fontWeight: 600,
								color: "#343a40",
								lineHeight: "18px",
							}}
						>
							User Requested Expenses
						</div>

						<div
							style={{
								fontSize: "11px",
								color: "#8a9198",
								marginTop: "2px",
							}}
						>
							Review and process submitted expense requests
						</div>
					</div>
				</div>
			</div>

			{/* =====================================================
			    EXPENSE TABLE
			===================================================== */}
			<div
				style={{
					backgroundColor: "#ffffff",
					border: "1px solid #e8ebef",
					borderRadius: "10px",
					overflow: "hidden",
					boxShadow: "0 2px 8px rgba(0, 0, 0, 0.035)",
				}}
			>
				<PrimeTable
					handleSeverSideProcessing={handleServerProcessing}
					column={columns}
					urlparams={{
						from: filtering.from,
						status: filtering.status,
						to: filtering.to,
					}}
					data={expenses || []}
					serverSideFiltering={true}
					filtering={false}
				/>
			</div>
		</div>
	);
}