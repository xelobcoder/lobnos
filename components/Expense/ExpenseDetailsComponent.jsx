import React from 'react';
import Loader from '../../components/accessories/Loader';
import Image from 'next/image';
import { currencyFormatter } from '../../components/Auth/customFetch';
import { List } from '@mui/icons-material';

const ExpenseDetail = ({ detail, imagefull, setImageFull, selectedLoading, onReject }) => {
	if (selectedLoading) {
		return <Loader />;
	}

	return (
		<>
			<div className="d-flex justify-content-end mb-1 mx-2">
				{detail?.approved === 0 && (
					<span className="text-warning bg-warning text-white border-warning border p-2"> AWAITING APPROVAL</span>
				)}
				{detail?.approved === 2 && <span className="text-danger bg-danger text-white border-danger border p-2">EXPENSE REJECTED</span>}
				{detail?.approved === 1 && <span className="text-success p-2 border-success border">EXPENSE APPROVED</span>}
			</div>
			<div className="border border-secondary-subtle p-2 grid grid-50 mx-2">
				<span>Title: {detail?.name}</span>
				<span>ID: EXP{detail?.id}</span>
				<span>
					Expense date: {new Date(detail?.date).toLocaleDateString()} {new Date(detail?.date).toLocaleTimeString()}
				</span>
				<span>
					Logged on: {new Date(detail?.createdon).toLocaleDateString()} {new Date(detail?.createdon).toLocaleTimeString()}
				</span>
				<span>Amount: {currencyFormatter.format(detail?.amount)}</span>
				<span>Approved On: {detail?.approved === 1 ? detail.approvedon : "N/A"}</span>
			</div>
			<div className="mx-2 mt-2">
				<h6>Description</h6>
				<p className="bg-secondary-subtle br-5 p-3">{detail?.description}</p>
			</div>
			{detail?.approved === 2 && (
				<div className="mx-2 mt-21">
					<h6>Rejection Message</h6>
					<p className="bg-danger-subtle br-5 p-3">{detail?.rejectionmessage}</p>
				</div>
			)}
			<div className="mx-2">
				<div className="d-flex justify-content-between">
					<h6>Receipts</h6>
					<List fontSize="large" onClick={() => setImageFull(!imagefull)} />
				</div>
				{detail?.images && detail?.images.length === 0 && "No receipts uploaded"}
				{detail?.images && detail.images.length > 0 && (
					<div className={imagefull ? "grid" : "grid-30-30-30"}>
						{detail.images.map((item, index) => {
							const url = `${process.env.BASEURL}/expenses/receipt/upload/images?imageid=${item}`;
							return (
								<Image
									key={index}
									alt="expense receipt"
									className={imagefull ? "mb-3 container" : ""}
									height={imagefull ? "600" : "300"}
									onClick={() => window.open(url)}
									width={imagefull ? "1000" : "300"}
									src={url}
								/>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
};

export default ExpenseDetail;
