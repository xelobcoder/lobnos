"use client";

import React, { useState } from 'react';
import SampleAssessmentModal from '../accessories/SampleAssessmentModal/SampleAssessmentModal';
import PrimeTable from '../accessories/Datatables/PrimeTable';
import { handleServerSideProcessingSampleValidation } from '../serverActions/ActionFiltering';
import { RiInformationLine, RiCheckboxCircleLine } from '@remixicon/react';



export default function SampleValidationComponent({ data: initialData }) {
	const [data, setData] = useState(initialData);
	const [loading, setLoading] = useState(false);
	const [showAssesModal, setShowAssesModal] = useState(false);
	const [target, setTarget] = useState(null);

	const removeClientFromList = (id) => {
		if (!id) return;
		setLoading(true);
		setData((prev) => prev.filter((item) => item.billingid !== id));
		setLoading(false);
	};

	const openModal = (ev) => {
		setShowAssesModal(true);
	};

	const closeModal = (ev) => {
		setShowAssesModal(false);
	};

	const columns = [
		{
			Header: "Billing Date",
			accessor: "date",
			Cell: function ({ value }) {
				return <div className="text-nowrap">{new Date(value).toLocaleDateString()}</div>;
			},
		},
		{ 
			Header: "Full Name", 
			accessor: "fullname",
			Cell: function ({ value }) {
				return <div className="font-weight-medium">{value}</div>;
			}
		},
		{ 
			Header: "Billing ID", 
			accessor: "billingid",
			Cell: function ({ value }) {
				return <div className="text-monospace">{value}</div>;
			}
		},
		{
			Header: "Action",
			accessor: "action",
			Cell: function ({ row }) {
				const item = row.original;
				return (
					<div className="d-flex justify-content-end">
						<button
							className="btn btn-primary btn-sm d-flex align-items-center"
							onClick={(ev) => {
								setTarget(item?.billingid);
								openModal();
							}}>
							<RiCheckboxCircleLine className="me-1" />
							Validate Sample
						</button>
					</div>
				);
			},
		},
	];

	return (
		<div className="pls-color text-sm">
			<div className='d-flex justify-content-between'>
			<div className="d-flex align-items-center">
				<h6 className="p-3 bg-light rounded-3 d-flex align-items-center">
					<RiInformationLine className="me-2" />
					Sample Validation
				</h6>
			</div>
			
			{data.length > 0 && (
				<div className="alert alert-info p-2 my-2 d-flex align-items-center">
					<RiInformationLine className="me-2" />
					<div>
						<strong>Note:</strong> Please check the sample before validating. Click on the assess button to view the sample.
					</div>
				</div>
			)}
			</div>

			<div className="my-2">
				<section className="bg-white rounded-3 shadow-sm p-3">
					<PrimeTable 
						column={columns}
						handleSeverSideProcessing={handleServerSideProcessingSampleValidation}
						data={data} 
						filtering={false} 
						serverSideFiltering={true}
						className="table-striped table-hover"
					/>
				</section>
			</div>

			<SampleAssessmentModal
				show={showAssesModal}
				hide={closeModal}
				billingid={target}
				removeClient={removeClientFromList}
			/>
		</div>
	);
}