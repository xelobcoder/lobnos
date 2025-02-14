"use client"
import { Dropdown } from "react-bootstrap";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrimeTable from "../accessories/Datatables/PrimeTable";
import { currencyFormatter, customFetch } from "../Auth/customFetch";
import { plsEncryption } from "../../lib/encryption";
import Link from "next/link";
import { useState } from "react";
import { Search } from "@mui/icons-material";
import { handleDatePicker } from "../serverActions/ActionFiltering";



export default function BilledClientsView({ data = [], branchid }) {
	const [datequery, setDatequery] = useState({ from: '', to: '' })

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
						<Dropdown.Toggle variant="light" id="archives-dropdown" >
							<MoreVertIcon />
						</Dropdown.Toggle>
						<Dropdown.Menu className="m-0 p-0 bg-white">
							<Dropdown.Item
								className="text-capitalize  text-sm m-0 px-2 border-top border-top-1"
							>
								<Link href={`/billing/patientid/${plsEncryption(row.original.patientid.toString())}?billingid=${row.original.billingid}&isNewTransaction=0`}>
									Update Transaction
								</Link>

							</Dropdown.Item>
							<Dropdown.Item
								className="m-0 p-2 border-top text-sm border-top-1"
							>
								<Link href={`/billing/print-receipt/${row.original.billingid}`}>
									Print Receipt
								</Link>

							</Dropdown.Item>
							{outstandingBill > 0 && (
								<Dropdown.Item
									className="text-sm m-0 px-2 border-top border-top-1"
									onClick={() => router.push()}
								>
									<Link href={`/billing/payment/update/${row.original.patientid}`}>									Settle Bill</Link>


								</Dropdown.Item>
							)}
						</Dropdown.Menu>
					</Dropdown>
				);
			},
		},
	];






	const handleSeverSideProcessing = async (pagination) => {
		const { page, count } = pagination;
		try {
			const data = await customFetch(
				`billing/payment/info/client?page=${page}&&count=${count}&&from=${datequery.from}&&to=${datequery.to}`
			);
			if (data.status === "success" && data.statusCode === 200) {
				return { result: data.result, error: false }
			}
			return { result: [], error: false }
		} catch (error) {
			console.error("Error fetching transactions:", error);
			return { result: [], error: true }
		}

	}



	return (
		<div>
			<div className="d-flex justify-content-end col-12 my-2">
				<div className="col-2 d-flex ">
					<input type="date" className="custom-input" onChange={(ev) => { setDatequery({ from: ev.target.value, to: ev.target.value }) }} />
					<button className="btn btn-outline-secondary btn-sm mx-2" onClick={(ev) => { handleDatePicker({ branchid, date: datequery.from }) }}>
						<Search />
					</button>
				</div>
			</div>
			<PrimeTable
				column={columns}
				styling="ttable table"
				data={data || []}
				serverSideFiltering={true}
				handleSeverSideProcessing={handleSeverSideProcessing}
			/>
		</div>
	);
}