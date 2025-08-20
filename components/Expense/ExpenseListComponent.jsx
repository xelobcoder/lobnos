import React, { useState } from 'react';
import { currencyFormatter } from '../../components/Auth/customFetch';
import { RiMoneyDollarCircleLine, RiUser3Line, RiCheckDoubleFill, RiCloseCircleFill, RiFileList2Line, RiInboxArchiveLine, RiCalendarEventLine, RiFilter3Line, RiRefreshLine, RiSearchLine } from '@remixicon/react';
import PrimeTable from '../accessories/Datatables/PrimeTable';

const statusMap = {
	0: { label: 'Pending', color: 'warning', icon: <RiFileList2Line className="me-1" /> },
	1: { label: 'Approved', color: 'success', icon: <RiCheckDoubleFill className="me-1" /> },
	2: { label: 'Rejected', color: 'danger', icon: <RiCloseCircleFill className="me-1" /> },
};

const ExpenseList = ({ expenses, setSelected, selected, filter, setFilter, handleFilters }) => {
	const [localFilter, setLocalFilter] = useState({ ...filter });

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setLocalFilter((prev) => ({ ...prev, [name]: value }));
	};

	const handleStatusChange = (e) => {
		setLocalFilter((prev) => ({ ...prev, status: e.target.value }));
	};

	const handleSearch = () => {
		setFilter(localFilter);
		handleFilters();
	};

	const handleClear = () => {
		const cleared = { from: '', to: '', status: '' };
		setLocalFilter(cleared);
		setFilter(cleared);
		handleFilters();
	};
	if (Array.isArray(expenses) && expenses.length === 0) {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center bg-light-subtle rounded-3 py-5 my-4 border border-0 shadow-sm" style={{ minHeight: 220 }}>
				<RiInboxArchiveLine size={48} className="mb-3 text-secondary" />
				<h4 className="text-secondary mb-1">No Expenses Found</h4>
				<p className="text-muted">Try adjusting your filters or add a new expense.</p>
			</div>
		)
	}

	const columns = [
	
		{
			Header: 'Expense Name',
			accessor: 'name',
			Cell: ({ cell: { value }, row }) => (
				<span
					className="fw-bold text-capitalize"
					style={{ cursor: 'pointer' }}
					onClick={() => setSelected(row.original)}
				>
					{value}
				</span>
			)
		},
		{
			Header: 'Amount',
			accessor: 'amount',
			Cell: ({ cell: { value }, row }) => (
				<span
					className="d-flex align-items-center text-secondary"
					style={{ cursor: 'pointer' }}
					onClick={() => setSelected(row.original)}
				>
					<RiMoneyDollarCircleLine className="me-1 text-success" />
					{currencyFormatter.format(value)}
				</span>
			)
		},
		{
			Header: 'Status',
			accessor: 'approved',
			Cell: ({ cell: { value }, row }) => {
				const status = statusMap[value] || { label: 'Unknown', color: 'secondary', icon: null };
				return (
					<span
						className={`badge bg-${status.color} d-flex align-items-center`}
						style={{ cursor: 'pointer' }}
						onClick={() => setSelected(row.original)}
					>
						{status.icon}{status.label}
					</span>
				);
			}
		},
		{
			Header: 'Requested By',
			accessor: 'username',
			Cell: ({ cell: { value }, row }) => (
				<span
					className="d-flex align-items-center"
					style={{ cursor: 'pointer' }}
					onClick={() => setSelected(row.original)}
				>
					<RiUser3Line className="me-1 text-primary" />
					{value}
				</span>
			)
		},
		{
			Header: 'Date',
			accessor: 'date',
			Cell: ({ cell: { value }, row }) => (
				<span
					style={{ cursor: 'pointer' }}
					onClick={() => setSelected(row.original)}
				>
					{new Date(value).toLocaleDateString()}
				</span>
			)
		},
			{
			Header: 'Description',
			accessor: 'description',
			Cell: ({ cell: { value }, row }) => (
				<span
					className="text-secondary"
					style={{ cursor: 'pointer' }}
					onClick={() => setSelected(row.original)}
				>
					{value}
				</span>
			)
		},
		{
			Header: 'Merchant',
			accessor: 'merchant_name',
			Cell: ({ cell: { value }, row }) => (
				<span
					className="text-capitalize"
					style={{ cursor: 'pointer' }}
					onClick={() => setSelected(row.original)}
				>
					{value}
				</span>
			)
		},

	];

	return (
		<div>
			{/* Filter Section */}
			<div className="card shadow-sm border-0 mb-4">
				<div className="card-body">
					<div className="d-flex align-items-center mb-3">
						<RiFilter3Line className="me-2 text-primary" size={24} />
						<h5 className="mb-0">Filter Expenses</h5>
					</div>
					<div className="row g-2 align-items-end">
						<div className="col-12 col-md-3">
							<label htmlFor="from-date" className="form-label small mb-1">
								<RiCalendarEventLine className="me-1" />From
							</label>
							<input
								id="from-date"
								name="from"
								value={localFilter.from}
								onChange={handleInputChange}
								type="date"
								className="form-control"
							/>
						</div>
						<div className="col-12 col-md-3">
							<label htmlFor="to-date" className="form-label small mb-1">
								<RiCalendarEventLine className="me-1" />To
							</label>
							<input
								id="to-date"
								name="to"
								value={localFilter.to}
								onChange={handleInputChange}
								type="date"
								className="form-control"
							/>
						</div>
						<div className="col-12 col-md-3">
							<label htmlFor="status-select" className="form-label small mb-1">Status</label>
							<select
								id="status-select"
								className="form-select"
								onChange={handleStatusChange}
								value={localFilter.status || 'all'}
							>
								<option value="all">All</option>
								<option value="approved">Approved</option>
								<option value="rejected">Rejected</option>
								<option value="pending">Pending</option>
							</select>
						</div>
						<div className="col-12 col-md-3 d-flex gap-2">
							<button type="button" onClick={handleSearch} className="btn btn-primary w-100 d-flex align-items-center justify-content-center">
								<RiSearchLine className="me-1" /> Search
							</button>
							<button
								onClick={handleClear}
								className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
								type="button"
							>
								<RiRefreshLine className="me-1" /> Clear
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Expenses Table */}
			<PrimeTable
				column={columns}
				data={expenses}
				filtering={true}
			/>
		</div>
	);
};

export default ExpenseList;
