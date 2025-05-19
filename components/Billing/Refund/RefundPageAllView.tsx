"use client"
import React, { useState } from "react";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { customFetch, currencyFormatter, customPost } from "../../Auth/customFetch";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import WitnessModalComp from "./WitnessModalComp";
import { Button } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { filteringRefundsUsingServiceId, handleRefundServerSideProcessing } from "../../serverActions/ActionFiltering";
import { RiSearchLine } from "@remixicon/react";

type Witness = {
	witness: string;
	name: string;
	message: string;
	employeeid: number;
};

type RefundItem = {
	refundid: number;
	serviceCategory: string;
	witnesses: Witness[];
	cost: number;
	amountIncurredDueTax: number;
	billedby: string;
	canwitness: boolean;
	canEdit: boolean;
	serviceid: number;
};

export default function RefundPageAllView({ initData, employeeid }) {
	const [search, setSearch] = useState<string>("");
	const [status, setStatus] = useState<string>("pending");
	const [data, setData] = useState<RefundItem[] | []>(initData);
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null);
	const [showModal, setShowModal] = useState<boolean>(false);
	const [currentRefund, setCurrentRefund] = useState<null | Partial<RefundItem>>(null);
	const [witnessMessage, setWitnessMessage] = useState<string>("");
	const [modalTitleHeader, setModalTitleHeader] = useState<string>("");


	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setStatus(e.target.value);
	};

	const handleWitness = (item: any) => {
		setCurrentRefund(item);
		setModalTitleHeader("Add Witness Note");
		setWitnessMessage("");
		setShowModal(true);
	};

	const handleEditWitnessNote = (item: RefundItem) => {
		setModalTitleHeader("Edit Previous Witness Note");
		setCurrentRefund(item);
		const currentWitness = item.witnesses.find(
			(witness) => witness.employeeid === employeeid
		);
		setWitnessMessage(currentWitness ? currentWitness.message : "");
		setShowModal(true);
	};

	const handleSubmitWitness = async () => {
		if (witnessMessage.trim().length > 3 && currentRefund) {
			const { witnesses } = currentRefund;
			let currentWitnessMatch: Witness | undefined = undefined;
			if (Array.isArray(witnesses)) {
				if (witnesses.length > 0) {
					currentWitnessMatch = witnesses.find((item: Witness) => item.employeeid === employeeid);
					if (currentWitnessMatch) {
						currentWitnessMatch.message = witnessMessage;
					}
				} else {
					currentWitnessMatch = { employeeid, message: witnessMessage, name: '', witness: 'to be determined' };
				}

				let requestData = {
					...currentRefund,
					employeeid,
					witnesses: currentWitnessMatch ? [currentWitnessMatch] : [],
				};

				const response = await customPost(`billing/previous/refund/update/previous`, 'POST', requestData);
				const { status, message } = response;
				status ===
					true
					? toast.success("action successsfull")
					:
					toast.error(message || "action failed");
				setShowModal(false);
			}
		}
	};

	const columns = [
		{
			Header: "billingid (Category)",
			accessor: "serviceCategory",
			Cell: ({ row, value }) => {
				return (<div>
					<span>{row.original.billingid}</span>
					<br />
					<span>({value})</span>
				</div>)
			}
		},
		{
			Header: `${status === "completed" ? "My Witness Note" : "Witness Message"}`,
			accessor: "witnesses",
			Cell: ({ row }: { row: any }) => {
				const { witnesses } = row.original;

				if (status === "completed") {
					return <div>{witnesses[0]?.message}</div>;
				} else if (status === "pending") {
					const currentWitness = witnesses.find(
						(witness: any) => witness.employeeid === employeeid
					);

					if (currentWitness && currentWitness.message) {
						return <div>{currentWitness.message}</div>;
					}
					return null;
				}
			},
		},
		{ Header: 'Service/test Name', accessor: "serviceName" },
		{
			Header: "Cost",
			accessor: "cost",
			Cell: ({ value }: { value: number }) => currencyFormatter.format(value),
		},
		{
			Header: "Amount Due to Tax",
			accessor: "amountIncurredDueTax",
			Cell: ({ value }: { value: number }) => currencyFormatter.format(value),
		},
		{
			Header: "Billed By",
			accessor: "billedby",
		},
		{
			Header: "Add Witness",
			accessor: "addWitness",
			Cell: ({ row }: { row: any }) => {
				const { canwitness, canEdit } = row.original;
				return (
					<div>
						{canwitness && (
							<Button
								variant="primary"
								size="sm"
								onClick={() => handleWitness(row.original)}
							>
								Add Witness
							</Button>
						)}
						{canEdit && (
							<Button
								variant="primary"
								size="sm"
								onClick={() => handleEditWitnessNote(row.original)}
							>
								Edit Witness Note
							</Button>
						)}
						{!canwitness && !canEdit && <div>No action available</div>}
					</div>
				);
			},
		},
	];

	const handleServerSideProcessing = async (values: { count: number; page: number }) => {
		const { count, page } = values;
		try {
			const data = await customFetch(
				`billing/refund/details/status?status=${status}&&employeeid=${employeeid}&&page=${page}&&count=${count}`
			);
			return { result: data.result };
		} catch (err) {
			return { error: "Something went wrong loading page data" };
		}
	};
	const handleGetRefundServiceWithId = async (value: number | string) => {
		const result = await filteringRefundsUsingServiceId(value, employeeid);
		setData(result)
	}


	return (
		<div>
			<ToastContainer position="top-center" className={'text-sm'} theme="colored" />
			<section className="d-flex justify-content-between mb-3">
				<div className="col-2">
					<select className="custom-select" value={status} onChange={handleStatusChange}>
						<option value="pending">Pending Refund</option>
						<option value="completed">Completed Refund</option>
					</select>
				</div>
				<div className="col-1 d-flex">
					<input className="custom-input" type="number" onChange={(ev) => { setSearch(ev.target.value) }} placeholder="serviceid" />
					<button type="button" onClick={(ev) => { handleGetRefundServiceWithId(search) }} className="btn btn-secondary-outline btn-sm">
						<RiSearchLine scale={24} />
					</button>
				</div>
			</section>

			<section>
				<h4>{status.charAt(0).toUpperCase() + status.slice(1)} List</h4>
				{loading && <div className="p-3 bg-secondary-subtle">Loading......</div>}
				<div>
					{data.length > 0 && (
						<PrimeTable
							column={columns}
							data={data}
							filtering={false}
							urlparams={{ employeeid, status }}
							serverSideFiltering={true}
							handleSeverSideProcessing={handleRefundServerSideProcessing}
						/>
					)}
				</div>
			</section>

			<WitnessModalComp
				showModal={showModal}
				modalTitleHeader={modalTitleHeader}
				witnessMessage={witnessMessage}
				setWitnessMessage={setWitnessMessage}
				handleSubmitWitness={handleSubmitWitness}
				setShowModal={setShowModal}
			/>
		</div>
	);
}
