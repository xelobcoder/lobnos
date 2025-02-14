import React, { useState, useEffect } from "react";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { customFetch, currencyFormatter, customPost } from "../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import FrontDeskLayout from "../../../components/Layout/FrontDeskLayout";
import WitnessModalComp from "../../../components/Billing/Refund/WitnessModalComp";
import { Button } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import PrimeLayout from "../../../components/Layout/PrimeLayout";

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

export default function RefundPageAllView() {
	const [status, setStatus] = useState<string>("pending");
	const [data, setData] = useState<RefundItem[] | []>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [showModal, setShowModal] = useState<boolean>(false);
	const [currentRefund, setCurrentRefund] = useState<null | Partial<RefundItem>>(null);
	const [witnessMessage, setWitnessMessage] = useState<string>("");
	const [modalTitleHeader, setModalTitleHeader] = useState<string>("");

	const employeeid = useApplicationSettings().applicationsettings.user.employeeid;

	useEffect(() => {
		const fetchData = async () => {
			if (status && employeeid) {
				try {
					setLoading(true);
					const response = await customFetch(
						`billing/refund/details/status?status=${status}&&employeeid=${employeeid}&&page=1&&count=10`
					);
					setData(response?.result || []);
					setLoading(false);
				} catch (err) {
					setError("Error fetching data");
					setLoading(false);
				}
			}
		};

		fetchData();
	}, [status]);

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

	return (
		<PrimeLayout>
			<ToastContainer position="top-center" className={'text-sm'} theme="colored" />
			<section className="d-flex justify-content-between mb-3">
				<div className="col-2">
					<select
						className="custom-select"
						value={status}
						onChange={handleStatusChange}
					>
						<option value="pending">Pending Refund</option>
						<option value="completed">Completed Refund</option>
					</select>
				</div>
				<div className="col-3">
					<input
						className="custom-input"
						placeholder="Select a billing section here"
					/>
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
							serverSideFiltering={true}
							urlparams={`billing/refund/details/status?status=${status}&&employeeid=${employeeid}`}
							handleSeverSideProcessing={handleServerSideProcessing}
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
		</PrimeLayout>
	);
}
