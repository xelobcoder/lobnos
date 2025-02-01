"use client";

import React, { useState } from 'react';
import SampleAssessmentModal from '../accessories/SampleAssessmentModal/SampleAssessmentModal';
import PrimeTable from '../accessories/Datatables/PrimeTable';

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
			Header: "billing date",
			accessor: "date",
			Cell: function ({ value }) {
				return <div>{new Date(value).toLocaleDateString()}</div>;
			},
		},
		{ Header: "fullname", accessor: "fullname" },
		{ Header: "billingid", accessor: "billingid" },
		{
			Header: "action",
			accessor: "action",
			Cell: function ({ row }) {
				const item = row.original;
				return (
					<div>
						<button
							className="btn btn-primary btn-sm"
							onClick={(ev) => {
								setTarget(item?.billingid);
								openModal();
							}}>
							validate sample
						</button>
					</div>
				);
			},
		},
	];

	return (
		<div className="container mx-2 text-sm">
			<h6 className='p-3 bg-secondary-subtle br-5'>Sample Validation</h6>
			<div className="col-sm-12 col-md-6 col-lg-4 col-xl-3">
				{data.length > 0 && (
					<div className="alert alert-info p-3 my-2">
						<strong>Note:</strong> Please check the sample before validating. Click on the assess button to view the sample.
					</div>
				)}
			</div>
			<div className="my-2">
				<section>
					<PrimeTable column={columns} data={data} filtering={false} serverSideFiltering={true} />
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