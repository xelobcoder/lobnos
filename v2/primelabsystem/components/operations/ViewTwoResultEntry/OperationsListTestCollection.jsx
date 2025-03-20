import { Forward } from "@mui/icons-material";
import { useState } from "react";
import ResultEntryComponent from "./ResultEntryComponent";

export default function OperationsListTestCollection({ operations }) {
	const { testList } = operations;
	const [selectedTest, setSelected] = useState(null);


	const handleTestCollectionSingle = (item) => {
		setSelected(item)
		const confirmation = confirm("Do you want to enter test results for this test? This action will log the time.");
		if (!confirmation) return;
		window.scrollTo(0, 0);
	};

	return (
		<div className="d-flex">
			<div className="col-3">
				{Array.isArray(testList) && testList.length > 0 && (
					<div className="list-group">
						{testList.map((item, index) => (
							<div
								key={index}
								className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center p-2 mb-2 rounded shadow-sm  pls-color ${selectedTest?.testid === item.testid ? "border-primary border-2" : "border"
									}`}
								style={{ cursor: "pointer" }}
								onClick={() => handleTestCollectionSingle(item)}
							>
								<span className="fw-bold text-uppercase">{item.name}</span>
								<button
									type="button"
									className={`btn btn-sm ${selectedTest?.testid === item.testid ? "btn-primary" : "btn-outline-primary"
										}`}
									onClick={(e) => {
										e.stopPropagation();
										handleTestCollectionSingle(item);
									}}
								>
									<Forward fontSize="small" />
								</button>
							</div>
						))}
					</div>
				)}
			</div>
			<div className="col-9">
				{selectedTest && <ResultEntryComponent operations={{ ...operations, testid: selectedTest?.testid, uiLayout: 3,ascensionid: selectedTest?.ascensionid }} />}
			</div>
		</div>
	);
}