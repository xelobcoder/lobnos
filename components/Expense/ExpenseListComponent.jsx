import React from 'react';
import { currencyFormatter } from '../../components/Auth/customFetch';

const ExpenseList = ({ expenses, setSelected, selected }) => {
	return (
		<div>
			{expenses.length === 0 ? (
				<div className="bg-secondary-subtle p-3 br-5">
					<h4>No Data Found</h4>
				</div>
			) : (
				expenses.map((item, index) => (
					<div
						onClick={() => setSelected(item?.id)}
						key={index}
						className={`border-bottom p-3 pointer ${selected === item?.id ? "expense-admin-li" : ""}`}
					>
						<div className="d-flex justify-content-between">
							<span className="text-capitalize" style={{ fontSize: "18px" }}>
								{item?.name}
							</span>
							<span className="text-secondary text-lead">{currencyFormatter.format(item.amount)}</span>
						</div>
						<div className="mt-2 d-flex justify-content-between">
							<div className="text-capitalize">
								Requested By:
								<span className="mx-2">{item.username}</span>
							</div>
							<div>
								{item.approved === 0 && <span className="text-warning border-warning border"> PENDING</span>}
								{item.approved === 2 && <span className="text-danger border-danger border">REJECTED</span>}
								{item.approved === 1 && <span className="text-success border-success border">APPROVED</span>}
							</div>
						</div>
					</div>
				))
			)}
		</div>
	);
};

export default ExpenseList;
