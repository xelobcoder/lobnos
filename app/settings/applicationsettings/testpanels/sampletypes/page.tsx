"use client"
import React, { useEffect, useMemo, useState } from "react";
import { customPost, getSampleTypeList } from "../../../../../components/Auth/customFetch";
import PrimeTable from "../../../../../components/accessories/Datatables/PrimeTable";
import { toast } from "react-toastify";
import {
	RiFlaskLine, RiWaterFlashLine, RiDropLine, RiTestTubeLine,
	RiBugLine, RiBrainLine, RiForbid2Line, RiDeleteBinLine, RiAddLine, RiLayoutGridLine, RiTableLine
} from '@remixicon/react';

interface SampleType {
	id: number;
	name: string;
	addedon: string;
}

const getSampleIconDetails = (name: string): { Icon: React.ElementType, colorClass: string } => {
	const lowerCaseName = name.toLowerCase();
	if (lowerCaseName.includes('urine')) return { Icon: RiWaterFlashLine, colorClass: 'text-warning bg-warning-light' };
	if (lowerCaseName.includes('blood')) return { Icon: RiDropLine, colorClass: 'text-danger bg-danger-light' };
	if (lowerCaseName.includes('serum')) return { Icon: RiTestTubeLine, colorClass: 'text-info bg-info-light' };
	if (lowerCaseName.includes('stool') || lowerCaseName.includes('faeces')) return { Icon: RiBugLine, colorClass: 'text-success bg-success-light' };
	if (lowerCaseName.includes('cerebrospinal') || lowerCaseName.includes('csf')) return { Icon: RiBrainLine, colorClass: 'text-secondary bg-secondary-light' };
	if (lowerCaseName.includes('none')) return { Icon: RiForbid2Line, colorClass: 'text-muted bg-light' };
	return { Icon: RiFlaskLine, colorClass: 'text-primary bg-primary-light' };
};

export default function Sampletypes() {
	const [sampletype, setSample] = useState<string>("");
	const [source, setSource] = useState<SampleType[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

	const addList = async function () {
		if (!sampletype.trim()) {
			toast.warn("Please enter a sample type name.");
			return;
		}
		try {
			const currentSampleType = sampletype;
			setSample("");
			const postRequest = await customPost("sampletype", "POST", { name: currentSampleType });
			const { statusCode, status, message } = postRequest;
			if (statusCode === 201 && status === "success") {
				toast.success(`"${currentSampleType}" added successfully!`);
				fetchSampleTypes();
			} else {
				setSample(currentSampleType);
				toast.error(message || "Failed to add sample type.");
			}
		} catch (error) {
			toast.error("An error occurred while adding the sample type.");
			setSample(sampletype);
		}
	};

	const deleteSpecific = async function (id: number) {
		if (!window.confirm("Are you sure you want to delete this sample type?")) {
			return;
		}
		try {
			const deleteItem = await customPost(`sampletype?id=${id}`, "DELETE", {});
			const { message, statusCode, status } = deleteItem;
			if (statusCode === 200 && status === "success") {
				toast.success(message || "Sample type deleted successfully.");
				fetchSampleTypes();
			} else {
				toast.error(message || "Failed to delete sample type.");
			}
		} catch (error) {
			toast.error("An error occurred while deleting the sample type.");
		}
	};

	const fetchSampleTypes = async () => {
		setIsLoading(true);
		try {
			await getSampleTypeList(setSource);
		} catch (error) {
			toast.error("Failed to load sample types.");
			setSource([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSampleTypes();
	}, []);

	const tableColumns = useMemo(
		() => [
			{
				Header: "Sample Type",
				accessor: "name",
				Cell: ({ row }: { row: { original: SampleType } }) => {
					const details = getSampleIconDetails(row.original.name);
					const Icon = details.Icon;
					return (
						<div className="d-inline-flex align-items-center gap-2">
							<span className={`rounded-circle d-inline-flex align-items-center justify-content-center ${details.colorClass}`} style={{ width: 28, height: 28 }}>
								<Icon size={15} />
							</span>
							<span className="fw-semibold text-capitalize">{row.original.name}</span>
						</div>
					);
				},
			},
			{
				Header: "Added On",
				accessor: "addedon",
				Cell: ({ value }: { value: string }) => new Date(value).toLocaleDateString(),
			},
			{
				Header: "Action",
				accessor: "id",
				Cell: ({ row }: { row: { original: SampleType } }) => (
					<button
						type="button"
						onClick={() => deleteSpecific(row.original.id)}
						className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
						title={`Delete ${row.original.name}`}
					>
						<RiDeleteBinLine size={14} />
						<span>Delete</span>
					</button>
				),
			},
		],
		[],
	);

	return (
		<div className="container-fluid px-0 py-2">
			<div className="d-flex flex-wrap align-items-center gap-2 p-3 border rounded bg-body-tertiary">
				<input
					className="form-control flex-grow-1"
					onChange={(e) => setSample(e.target.value)}
					value={sampletype}
					placeholder="Enter a new sample type..."
					onKeyDown={(e) => e.key === 'Enter' && addList()}
					aria-label="Sample type name"
				/>
				<button
					onClick={addList}
					className="btn btn-success btn-sm d-inline-flex align-items-center justify-content-center gap-1 px-3"
				>
					<RiAddLine size={16} />
					<span>Add</span>
				</button>
				<div className="btn-group ms-auto" role="group" aria-label="Sample type view selector">
					<button
						type="button"
						className={`btn btn-sm d-inline-flex align-items-center justify-content-center gap-1 ${viewMode === "cards" ? "btn-primary" : "btn-outline-secondary"}`}
						onClick={() => setViewMode("cards")}
					>
						<RiLayoutGridLine size={15} />
						<span>Cards</span>
					</button>
					<button
						type="button"
						className={`btn btn-sm d-inline-flex align-items-center justify-content-center gap-1 ${viewMode === "table" ? "btn-primary" : "btn-outline-secondary"}`}
						onClick={() => setViewMode("table")}
					>
						<RiTableLine size={15} />
						<span>Table</span>
					</button>
				</div>
			</div>

			<div className="mt-4">
				{isLoading ? (
					<div className="text-center p-5">Loading sample types...</div>
				) : source.length === 0 ? (
					<div className="text-center p-5 text-muted">No sample types found. Add one above!</div>
				) : viewMode === "table" ? (
					<PrimeTable
						column={tableColumns}
						data={source}
						filtering={true}
						handleSeverSideProcessing={() => { }}
					/>
				) : (
					<div className="row g-3">
						{source.map((sample) => {
							const { Icon, colorClass } = getSampleIconDetails(sample.name);
							return (
								<div key={sample.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
									<div className="border rounded h-100 bg-body position-relative">
										<button
											onClick={() => deleteSpecific(sample.id)}
											className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center position-absolute top-0 end-0 m-2 p-1 lh-1 rounded-circle"
											title={`Delete ${sample.name}`}
											style={{ zIndex: 1 }}
										>
											<RiDeleteBinLine size={16} />
										</button>

										<div className="p-3 text-center d-flex flex-column align-items-center">
											<div className={`icon-circle rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${colorClass}`} style={{ width: '52px', height: '52px' }}>
												<Icon size={24} />
											</div>
											<h6 className="mb-1 fw-semibold text-truncate w-100" title={sample.name}>
												{sample.name}
											</h6>
											<small className="text-muted">
												Added: {new Date(sample.addedon).toLocaleDateString()}
											</small>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
			<style jsx global>{`
        .bg-primary-light { background-color: rgba(var(--bs-primary-rgb), 0.1); }
        .bg-warning-light { background-color: rgba(var(--bs-warning-rgb), 0.1); }
        .bg-danger-light { background-color: rgba(var(--bs-danger-rgb), 0.1); }
        .bg-info-light { background-color: rgba(var(--bs-info-rgb), 0.1); }
        .bg-success-light { background-color: rgba(var(--bs-success-rgb), 0.1); }
        .bg-secondary-light { background-color: rgba(var(--bs-secondary-rgb), 0.1); }
      `}</style>
		</div>
	);
}
