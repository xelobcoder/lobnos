"use client";
import { Dropdown, Table, Button } from "react-bootstrap";
import PrimeTable from "../accessories/Datatables/PrimeTable";
import { currencyFormatter } from "../Auth/customFetch";
import { plsEncryption } from "../../lib/encryption";
import { useState } from "react";
import { Search } from "@mui/icons-material";
import { handleDatePicker, handleSeverSideProcessing } from "../serverActions/ActionFiltering";
import { fetchPreviousBilledRecords } from "../../lib/billingLib";
import TransactionDetailsModal from './TransactionDetailsModal';
import { useApplicationSettings } from "../Auth/useApplicationContext";

export default function BilledClientsView({ data = [], branchid }) {
	const [datequery, setDatequery] = useState({ from: '', to: '' });
	const [showModal, setShowModal] = useState(false);
	const [previousTransactions, setPreviousTransactions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const { employeeid } = useApplicationSettings().applicationsettings.user;

	const handleViewTransactionDetails = async (billingid) => {
		setIsLoading(true);
		setShowModal(true);
		try {
			const transactions = await fetchPreviousBilledRecords(billingid);
			setPreviousTransactions(transactions);
		} catch (error) {
			console.error("Error fetching transaction details:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const columns = [
		{
			Header: "Date",
			accessor: "date",
			Cell: ({ value }) => <span>{new Date(value).toLocaleDateString()}</span>,
		},
		{ Header: "Fullname", accessor: "fullname" },
		{
			Header: "Patient ID",
			accessor: "fullpatientid",
		},
		{ Header: "Bill Id", accessor: "billingid" },
		{
			Header: "Amt Payable",
			accessor: "payable",
			Cell: ({ value }) => <div>{currencyFormatter.format(value)}</div>,
		},
		{
			Header: "Amount Paid",
			accessor: "paid",
			Cell: ({ row }) => <div>{currencyFormatter.format(row.original.paid)}</div>,
		},
		{ Header: 'Discount', accessor: 'discount', Cell: ({ row }) => <div>{currencyFormatter.format(row.original.discount)}</div> },
		{ Header: 'Amt Refunded', accessor: 'totalRefunded', Cell: ({ row }) => <div>{currencyFormatter.format(row.original.totalRefunded)}</div> },
		{
			Header: "Outstanding",
			accessor: "outstanding",
			Cell: ({ row }) => (
				<div>
					<span className={row.original.outstanding > 0 ? "text-danger" : "text-primary"}>
						{currencyFormatter.format(row.original.outstanding)}
					</span>
				</div>
			),
		},
		{
			Header: "Actions",
			accessor: "actions",
			Cell: ({ row }) => {
				const outstandingBill = row.original?.outstanding;
				return (
					<Dropdown>
						<Dropdown.Toggle variant="light" id="archives-dropdown">
							show
						</Dropdown.Toggle>
						<Dropdown.Menu className="m-0 p-0 bg-white">
							<Dropdown.Item
								href={`/billing/patientid/${plsEncryption(row.original.patientid.toString())}?billingid=${row.original.billingid}&isNewTransaction=0`}
								className="text-capitalize text-sm m-0 px-2 border-top border-top-1"
							>
								Update Transaction
							</Dropdown.Item>
							<Dropdown.Item
								href={`${process.env.PLS_PDF_GENERATOR}generate/receipt/invoice?billingid=${row.original.billingid}&&is_pos=false`}
								className="m-0 p-2 border-top text-sm border-top-1"
							>
								Print Receipt A4 format
							</Dropdown.Item>
							<Dropdown.Item
								href={`${process.env.PLS_PDF_GENERATOR}generate/receipt/invoice?billingid=${row.original.billingid}&&is_pos=true`}
								className="m-0 p-2 border-top text-sm border-top-1"
							>
								Print Receipt POS format
							</Dropdown.Item>
							<Dropdown.Item
								className="m-0 p-2 border-top text-sm border-top-1"
								onClick={() => handleViewTransactionDetails(row.original.billingid)}
							>
								View Transactions Details
							</Dropdown.Item>
							{outstandingBill > 0 && (
								<Dropdown.Item
									className="text-sm m-0 px-2 border-top border-top-1"
									href={`/billing/payment/update/${row.original.patientid}`}
								>
									Settle Bill
								</Dropdown.Item>
							)}
						</Dropdown.Menu>
					</Dropdown>
				);
			},
		},
	];

	return (
		<div>
			<div className="d-flex justify-content-end col-12 my-2">
				<div className="col-2 d-flex">
					<input
						type="date"
						className="custom-input"
						onChange={(ev) => setDatequery({ from: ev.target.value, to: ev.target.value })}
					/>
					<button
						className="btn btn-outline-secondary btn-sm mx-2"
						onClick={() => handleDatePicker({ branchid, date: datequery.from })}
					>
						<Search />
					</button>
				</div>
			</div>
			<PrimeTable
				column={columns}
				styling="ttable table"
				urlparams={datequery}
				data={data || []}
				serverSideFiltering={true}
				handleSeverSideProcessing={handleSeverSideProcessing}
			/>

			<TransactionDetailsModal
				showModal={showModal}
				setShowModal={setShowModal}
				previousTransactions={previousTransactions}
				employeeid={employeeid}
			/>
		</div>
	);
}