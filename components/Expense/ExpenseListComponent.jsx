import React, { useState } from 'react';
import { currencyFormatter } from '../../components/Auth/customFetch';
import { RiMoneyDollarCircleLine, RiUser3Line, RiCheckDoubleFill, RiCloseCircleFill, RiFileList2Line, RiTable2, RiLayoutGridFill, RiInboxArchiveLine } from '@remixicon/react';

const statusMap = {
	0: { label: 'Pending', color: 'warning', icon: <RiFileList2Line className="me-1" /> },
	1: { label: 'Approved', color: 'success', icon: <RiCheckDoubleFill className="me-1" /> },
	2: { label: 'Rejected', color: 'danger', icon: <RiCloseCircleFill className="me-1" /> },
};

const ExpenseList = ({ expenses, setSelected, selected }) => {
	const [view, setView] = useState('card'); 
	console.log('ExpenseList rendered with view:', view,expenses);
	if (Array.isArray(expenses) && expenses.length === 0) {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center bg-light-subtle rounded-3 py-5 my-4 border border-0 shadow-sm" style={{ minHeight: 220 }}>
				<RiInboxArchiveLine size={48} className="mb-3 text-secondary" />
				<h4 className="text-secondary mb-1">No Expenses Found</h4>
				<p className="text-muted">Try adjusting your filters or add a new expense.</p>
			</div>
		)
	}

	return (
		<div>
			<div className="d-flex justify-content-end mb-3 gap-2">
				<button
					onClick={() => setView('card')}
					className={`btn btn-outline-primary btn-sm d-flex align-items-center${view === 'card' ? ' active' : ''}`}
					type="button"
				>
					<RiLayoutGridFill className="me-1" /> Card View
				</button>
				<button
					onClick={() => setView('table')}
					className={`btn btn-outline-primary btn-sm d-flex align-items-center${view === 'table' ? ' active' : ''}`}
					type="button"
				>
					<RiTable2 className="me-1" /> Table View
				</button>
			</div>

			{view === 'card' ? (
				<div className="row g-3">
					{Array.isArray(expenses) && expenses.length > 0 && expenses.map((item, index) => {
						const status = statusMap[item.approved] || { label: 'Unknown', color: 'secondary', icon: null };
						return (
							<div
								onClick={() => setSelected(item)}
								key={item.id || index}
								className={`col-12 col-md-6 col-lg-4`}
							>
								<div
									className={`card shadow-sm pointer h-100 expense-list-card ${selected && selected.id === item.id ? 'border-primary border-2' : 'border-0'}`}
									style={{ transition: 'box-shadow 0.2s', cursor: 'pointer' }}
								>
									<div className="card-body">
										<div className="d-flex justify-content-between align-items-center mb-2">
											<span className="text-capitalize fw-bold" style={{ fontSize: '1.1rem' }}>{item?.name}</span>
											<span className={`badge bg-${status.color} d-flex align-items-center`}>
												{status.icon}{status.label}
											</span>
										</div>
										<div className="d-flex justify-content-between align-items-center mb-2">
											<span className="text-secondary d-flex align-items-center">
												<RiMoneyDollarCircleLine className="me-1 text-success" />
												{currencyFormatter.format(item.amount)}
											</span>
											<span className="text-muted small">ID: EXP{item.id}</span>
										</div>
										<div className="d-flex justify-content-between align-items-center">
											<span className="text-capitalize d-flex align-items-center">
												<RiUser3Line className="me-1 text-primary" />
												Requested By: <span className="ms-1 fw-semibold">{item.username}</span>
											</span>
											<span className="text-muted small">{new Date(item.date).toLocaleDateString()}</span>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="table-responsive">
					<table className="table table-hover align-middle">
						<thead className="table-light">
							<tr>
								<th>Name</th>
								<th>Amount</th>
								<th>Status</th>
								<th>Requested By</th>
								<th>Date</th>
							</tr>
						</thead>
						<tbody>
							{expenses.map((item, index) => {
								const status = statusMap[item.approved] || { label: 'Unknown', color: 'secondary', icon: null };
								return (
									<tr
										key={item.id || index}
										onClick={() => setSelected(item)}
										className={`pointer ${selected && selected.id === item.id ? 'table-primary' : ''}`}
										style={{ cursor: 'pointer' }}
									>
										<td className="fw-bold text-capitalize">{item.name}</td>
										<td><span className="d-flex align-items-center text-secondary"><RiMoneyDollarCircleLine className="me-1 text-success" />{currencyFormatter.format(item.amount)}</span></td>
										<td><span className={`badge bg-${status.color} d-flex align-items-center`}>{status.icon}{status.label}</span></td>
										<td><span className="d-flex align-items-center"><RiUser3Line className="me-1 text-primary" />{item.username}</span></td>
										<td>{new Date(item.date).toLocaleDateString()}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default ExpenseList;
