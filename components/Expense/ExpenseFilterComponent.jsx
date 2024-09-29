import React from 'react';

const ExpenseFilter = ({ filter, setFilter, handleFilters }) => {
	return (
		<div className="d-block p-1">
			<input
				value={filter.from}
				onChange={(ev) => setFilter((prev) => ({ ...prev, from: ev.target.value }))}
				name="from"
				type="date"
				className="custom-input"
			/>
			<input
				value={filter.to}
				onChange={(ev) => setFilter((prev) => ({ ...prev, to: ev.target.value }))}
				type="date"
				name="to"
				className="custom-input mt-2"
			/>
			<select
				className="custom-select mt-2"
				onChange={(ev) => setFilter((prev) => ({ ...prev, status: ev.target.value }))}
			>
				<option value="all">all</option>
				<option value="approved">approved</option>
				<option value="rejected">rejected</option>
				<option value="pending">pending</option>
			</select>
			<button type="button" onClick={handleFilters} className="btn btn-primary btn-sm mt-2">
				search
			</button>
			<button
				onClick={() => setFilter({ from: "", to: "", status: "" })}
				className="btn btn-secondary btn-sm mt-2 mx-2"
			>
				clear
			</button>
		</div>
	);
};

export default ExpenseFilter;
