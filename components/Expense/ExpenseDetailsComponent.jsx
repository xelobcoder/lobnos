import React from 'react';
import Loader from '../../components/accessories/Loader';
import Image from 'next/image';
import { currencyFormatter } from '../../components/Auth/customFetch';
import { RiListOrdered, RiFileList2Line, RiMoneyDollarCircleLine, RiCalendarEventLine, RiCheckDoubleFill, RiCloseCircleFill } from '@remixicon/react';

const statusMap = {
	0: { label: 'Awaiting Approval', color: 'warning', icon: <RiFileList2Line className="me-1" /> },
	1: { label: 'Expense Approved', color: 'success', icon: <RiCheckDoubleFill className="me-1" /> },
	2: { label: 'Expense Rejected', color: 'danger', icon: <RiCloseCircleFill className="me-1" /> },
};

const ExpenseDetail = ({ detail, imagefull, setImageFull, selectedLoading, onReject }) => {
	if (selectedLoading) return <Loader />;

	const status = statusMap[detail?.approved] || { label: 'Unknown', color: 'secondary', icon: null };

	return (
		<div className="container-fluid">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4 className="mb-0">Expense Details</h4>
				<span className={`badge bg-${status.color} fs-6 px-3 py-2 d-flex align-items-center`}>
					{status.icon}
					{status.label}
				</span>
			</div>

			<div className="row g-3 mb-3">
				<div className="col-md-6">
					<div className="card shadow-sm border-0">
						<div className="card-body">
							<h6 className="card-title text-primary mb-2">General Info</h6>
							<div className="table-responsive">
								<table className="table table-borderless table-sm mb-0 align-middle">
									<tbody>
										<tr>
											<td className="fw-bold text-secondary">Title</td>
											<td className="text-capitalize">{detail?.name}</td>
										</tr>
										<tr>
											<td className="fw-bold text-secondary">ID</td>
											<td>EXP{detail?.id}</td>
										</tr>
										<tr>
											<td className="fw-bold text-secondary"><RiCalendarEventLine className="me-1 text-secondary" /> Date</td>
											<td>{new Date(detail?.date).toLocaleDateString()} <span className="text-muted">{new Date(detail?.date).toLocaleTimeString()}</span></td>
										</tr>
										<tr>
											<td className="fw-bold text-secondary">Logged on</td>
											<td>{new Date(detail?.createdon).toLocaleDateString()} <span className="text-muted">{new Date(detail?.createdon).toLocaleTimeString()}</span></td>
										</tr>
										<tr>
											<td className="fw-bold text-secondary"><RiMoneyDollarCircleLine className="me-1 text-success" /> Amount</td>
											<td className="fw-bold text-success">{currencyFormatter.format(detail?.amount)}</td>
										</tr>
										<tr>
											<td className="fw-bold text-secondary">Approved On</td>
											<td>{detail?.approved === 1 ? <span className="text-success fw-semibold">{detail.approvedon}</span> : <span className="text-muted">N/A</span>}</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
				<div className="col-md-6">
					<div className="card shadow-sm border-0 h-100">
						<div className="card-body">
							<h6 className="card-title text-primary mb-2">Description</h6>
							<p className="bg-light rounded p-3 mb-0">{detail?.description || <span className="text-muted">No description provided.</span>}</p>
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
						<button className="btn btn-outline-secondary btn-sm d-flex align-items-center" onClick={() => setImageFull(!imagefull)}>
							<RiListOrdered className="me-1" /> {imagefull ? 'Grid View' : 'Full View'}
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

			<div className="d-flex justify-content-end mt-4 gap-2">
				{detail?.approved === 0 && (
					<button className="btn btn-danger" onClick={() => onReject()}>
						Reject Expense
					</button>
				)}
			</div>
		</div>
	);
};

export default ExpenseDetail;
