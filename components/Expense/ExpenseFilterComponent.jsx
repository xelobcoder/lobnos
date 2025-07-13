import React, { useState } from 'react';
import { RiCalendarEventLine, RiFilter3Line, RiRefreshLine, RiSearchLine } from '@remixicon/react';

const ExpenseFilter = ({ filter, setFilter, handleFilters }) => {
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

	return (
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
	);
};

export default ExpenseFilter;
