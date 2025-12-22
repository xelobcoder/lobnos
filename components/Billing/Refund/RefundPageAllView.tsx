"use client"
import React, { useState } from "react";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { customFetch, currencyFormatter, customPost } from "../../Auth/customFetch";
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


	const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newStatus = e.target.value;
		setStatus(newStatus);
		setLoading(true);
		try {
			const response = await customFetch(
				`billing/refund/details/status?status=${newStatus}&&employeeid=${employeeid}&&page=1&&count=10`
			);
			if (response && Array.isArray(response?.result)) {
				setData(response.result);
			} else {
				setData([]);
				toast.error("No data found");
			}
		} catch (error) {
			setData([]);
			toast.error("Error fetching data");
		} finally {
			setLoading(false);
		}
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
			const numericEmployeeId = Number(employeeid);
			const { witnesses } = currentRefund;
			let currentWitnessMatch: Witness | undefined = undefined;
			if (Array.isArray(witnesses)) {
				if (witnesses.length > 0) {
					currentWitnessMatch = witnesses.find((item: Witness) => item.employeeid === numericEmployeeId);
					if (currentWitnessMatch) {
						currentWitnessMatch.message = witnessMessage;
					} else {
						currentWitnessMatch = { employeeid: numericEmployeeId, message: witnessMessage, name: '', witness: 'to be determined' };
					}
				} else {
					currentWitnessMatch = { employeeid: numericEmployeeId, message: witnessMessage, name: '', witness: 'to be determined' };
				}
			}

			let requestData = {
				...currentRefund,
				employeeid: numericEmployeeId,
				witnesses: currentWitnessMatch ? [currentWitnessMatch] : [],
			};

			const response = await customPost(`billing/previous/refund/update/previous`, 'POST', requestData);
			const { status, message } = response;
			status === true
				? toast.success("action successsfull")
				: toast.error(message || "action failed");
			setShowModal(false);
		}
	};

	const columns = [
		{
			Header: "billingid (Category)",
			accessor: "serviceCategory",
			Cell: ({ row, value }) => (
				<div>
					<span>{row.original.billingid}</span>
					<br />
					<span>({value})</span>
				</div>
			)
		},
		{
			Header: `${status === "completed" ? "My Witness Note" : "Witness Message"}`,
			accessor: "witnesses",
			Cell: ({ row }: { row: any }) => {
				const { witnesses } = row.original;
				const numericEmployeeId = Number(employeeid);
				const currentWitness = witnesses.find((w: any) => w.employeeid === numericEmployeeId);
				if (currentWitness && currentWitness.message) {
					return (
						<div className="d-flex align-items-center gap-2">
							<span>{currentWitness.message}</span>
							<Button
								variant="outline-info"
								size="sm"
								onClick={() => {
									setModalTitleHeader("View Witness Note");
									setWitnessMessage(currentWitness.message);
									setShowModal(true);
								}}
							>
								View
							</Button>
						</div>
					);
				}
				return <span className="text-muted">No message</span>;
			}
		},
		{ Header: 'Service/test Name', accessor: "serviceName" },
		{
			Header: "Cost",
			accessor: "cost",
			Cell: ({ value }: { value: number }) => currencyFormatter.format(value)
		},
		{
			Header: "Amount Due to Tax",
			accessor: "amountIncurredDueTax",
			Cell: ({ value }: { value: number }) => currencyFormatter.format(value)
		},
		{
			Header: "Billed By",
			accessor: "billedby"
		},
		{
			Header: "Add Witness",
			accessor: "addWitness",
			Cell: ({ row }: { row: any }) => {
				if (status === "completed") {
					return <div className="text-muted">No action available</div>;
				}
				const { witnesses, canEdit } = row.original;
				const isAlreadyWitness = witnesses.some((w: Witness) => w.employeeid === employeeid);
				const hasEmptySlot = witnesses.some((w: Witness) => w.employeeid === null);
				return (
					<div>
						{!isAlreadyWitness && hasEmptySlot && (
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
						{!canEdit && (!hasEmptySlot || isAlreadyWitness) && <div>No action available</div>}
					</div>
				);
			}
		}
	];

	const handleGetRefundServiceWithId = async (value: number | string) => {
		const result = await filteringRefundsUsingServiceId(value, employeeid);
		setData(result)
	}

	return (
		<div>
			<ToastContainer position="top-center" className={'text-sm'} theme="colored" />
			<section className="d-flex justify-content-between mb-3">
				<div className="col-2">
					<select className="form-select form-select-sm" value={status} onChange={handleStatusChange}>
						<option value="pending">Pending Refund</option>
						<option value="completed">Completed Refund</option>
					</select>
				</div>
				<div className="col-1 d-flex">
					<input className="form-control form-control-sm" type="number" onChange={(ev) => { setSearch(ev.target.value) }} placeholder="serviceid" />
					<button type="button" onClick={(ev) => { handleGetRefundServiceWithId(search) }} className="btn btn-outline-secondary btn-sm">
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
