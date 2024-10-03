import React from 'react';

export default function VitalSignFilterForm({ filterFrom, filterTo, handleFilterChange, handleFilterSubmit }) {
	return (
		<form onSubmit={handleFilterSubmit}>
			<div className="d-flex col-6">
				<div>
					<input
						className="custom-input h-100"
						type="date"
						placeholder="from"
						name="filterFrom"
						value={filterFrom}
						onChange={handleFilterChange}
					/>
				</div>
				<div>
					<input
						className="custom-input mx-2 h-100"
						type="date"
						placeholder="to"
						name="filterTo"
						value={filterTo}
						onChange={handleFilterChange}
					/>
				</div>
				<div>
					<button className="btn btn-secondary mx-3" type="submit">
						Filter
					</button>
				</div>
			</div>
		</form>
	);
}
