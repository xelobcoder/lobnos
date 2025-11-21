import React from 'react';
import Loader from '../../components/accessories/Loader';
import Image from 'next/image';
import { currencyFormatter } from '../../components/Auth/customFetch';
import { RiListOrdered } from '@remixicon/react';

const ExpenseDetail = ({ detail, imagefull, setImageFull, selectedLoading }) => {
	if (selectedLoading) return <Loader />;

	return (
		<div className="container-fluid">

			<div className="mb-3">
				<div className="border rounded p-2">
					<div className="row g-2">
						<div className="col-md-4 col-6">
							<small className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>Title</small>
							<small className="text-capitalize d-block fw-semibold" style={{ fontSize: '0.85rem' }}>{detail?.name}</small>
						</div>
						<div className="col-md-4 col-6">
							<small className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>ID</small>
							<small className="d-block fw-semibold" style={{ fontSize: '0.85rem' }}>EXP{detail?.id}</small>
						</div>
						<div className="col-md-4 col-6">
							<small className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>Amount</small>
							<small className="fw-bold text-success d-block" style={{ fontSize: '0.95rem' }}>{currencyFormatter.format(detail?.amount)}</small>
						</div>
						<div className="col-md-4 col-6">
							<small className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>Date</small>
							<small className="d-block fw-semibold" style={{ fontSize: '0.85rem' }}>{new Date(detail?.date).toLocaleDateString()}</small>
							<small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{new Date(detail?.date).toLocaleTimeString()}</small>
						</div>
						<div className="col-md-4 col-6">
							<small className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>Logged on</small>
							<small className="d-block fw-semibold" style={{ fontSize: '0.85rem' }}>{new Date(detail?.createdon).toLocaleDateString()}</small>
							<small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{new Date(detail?.createdon).toLocaleTimeString()}</small>
						</div>
						<div className="col-md-4 col-6">
							<small className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>Approved On</small>
							<small className="d-block fw-semibold" style={{ fontSize: '0.85rem' }}>
								{detail?.approved === 1 ? <span className="text-success">{detail.approvedon}</span> : <span className="text-muted">N/A</span>}
							</small>
						</div>
						<div className="col-12">
							<small className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>Description</small>
							<small className="d-block" style={{ fontSize: '0.85rem' }}>{detail?.description || <span className="text-muted">No description provided.</span>}</small>
						</div>
					</div>
				</div>
			</div>

			{detail?.approved === 2 && (
				<div className="row mb-3">
					<div className="col-12">
						<div className="card border-danger shadow-sm">
							<div className="card-body">
								<h6 className="card-title text-danger mb-2">Rejection Message</h6>
								<p className="bg-danger-subtle rounded p-3 mb-0">{detail?.rejectionmessage || <span className="text-muted">No message provided.</span>}</p>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="row mb-3">
				<div className="col-12">
					<div className="d-flex justify-content-between align-items-center mb-2">
						<h6 className="mb-0">Receipts</h6>
						<button
							className="btn btn-outline-secondary d-flex align-items-center"
							onClick={() => setImageFull(!imagefull)}
							style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
						>
							<RiListOrdered size={14} className="me-1" /> {imagefull ? 'Grid View' : 'Full View'}
						</button>
					</div>
					{detail?.images && detail?.images.length === 0 && <div className="text-muted">No receipts uploaded</div>}
					{detail?.images && detail.images.length > 0 && (
						<div className={imagefull ? "row" : "row row-cols-2 row-cols-md-3 g-2"}>
							{detail.images.map((item, index) => {
								const url = `${process.env.BASEURL}/expenses/receipt/upload/images?imageid=${item}`;
								return (
									<div className="col mb-2" key={index}>
										<Image
											alt="expense receipt"
											className="rounded shadow-sm receipt-img"
											height={imagefull ? 400 : 200}
											width={imagefull ? 600 : 300}
											src={url}
											onClick={() => window.open(url)}
											style={{ cursor: 'pointer', objectFit: 'cover', width: '100%' }}
										/>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ExpenseDetail;
