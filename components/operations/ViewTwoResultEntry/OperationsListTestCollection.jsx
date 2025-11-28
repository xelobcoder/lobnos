import { useState } from "react";
import ResultEntryComponent from "./ResultEntryComponent";
import { RiArrowRightLine } from '@remixicon/react';

export default function OperationsListTestCollection({ operations }) {
	const { testList } = operations;
	const [selectedTests, setSelectedTests] = useState([]);
	const [multiMode, setMultiMode] = useState(false);
	const [loaded, setLoaded] = useState(false);

	const handleCheckboxChange = (item) => {
		setSelectedTests((prev) => {
			if (prev.some((t) => t.testid === item.testid)) {
				return prev.filter((t) => t.testid !== item.testid);
			} else {
				return [...prev, item];
			}
		});
	};

	const handleTestCollectionSingle = (item) => {
		const confirmation = confirm("Do you want to enter test results for this test? This action will log the time.");
		if (!confirmation) return;
		window.scrollTo(0, 0);
	};

	const handleLoadAll = () => {
		setLoaded(true);
	};

	const handleMultiMode = () => {
		setMultiMode((prev) => !prev);
		setSelectedTests([]);
		setLoaded(false);
	};

	return (
		<div className="mb-3">
			<button className={`btn btn-sm btn-${multiMode ? "secondary" : "primary"}`} onClick={handleMultiMode}>
				{multiMode ? "Cancel Multi-Select" : "Load Multiple"}
			</button>
			{multiMode && (
				<button className="btn btn-sm btn-success ms-2" onClick={handleLoadAll} disabled={selectedTests.length === 0}>
					Load All
				</button>
			)}
			<div
				className="list-group mb-2 mt-2 responsive-grid"
			>
				{Array.isArray(testList) && testList.length > 0 && testList.map((item, index) => {
					const checked = selectedTests.some((t) => t.testid === item.testid);
					return (
						<div
							key={index} className={`list-group-item d-flex justify-content-between align-items-center p-2 mb-2 rounded shadow-sm pls-color ${checked ? "border-primary border-2" : "border"}`}
						>
							<input
								type="checkbox"
								checked={checked}
								disabled={!multiMode}
								onChange={() => handleCheckboxChange(item)}
								style={{ marginRight: 8 }}
							/>
							<span className="fw-bold text-uppercase" style={{ flex: 1 }} onClick={() => multiMode && handleCheckboxChange(item)}>{item.name}</span>
							{!multiMode && (
								<button
									type="button"
									className={`btn btn-sm btn-outline-primary`}
									onClick={(e) => {
										e.stopPropagation();
										if (multiMode) {
											if (!selectedTests.some((t) => t.testid === item.testid)) {
												setSelectedTests(prev => [...prev, item]);
											}
											setLoaded(true);
										} else {
											handleTestCollectionSingle(item);
										}
									}}
								>
									<RiArrowRightLine size={24} />
								</button>
							)}
						</div>
					);
				})}
			</div>
			{multiMode && loaded && selectedTests.length > 0 && (
				<div className={`mt-2 ${selectedTests.length > 1 ? "responsive-grid" : ""}`}>
					{Array.isArray(selectedTests) && selectedTests.length > 0 && selectedTests.map((test, idx) => (
						<div key={test.testid} style={{ minWidth: 0 }}>
							<ResultEntryComponent operations={{ ...operations, testid: test.testid, uiLayout: 3, ascensionid: test.ascensionid }} />
						</div>
					))}
				</div>
			)}
			<style jsx>{`
				.responsive-grid {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 16px;
				}
				@media (max-width: 768px) {
					.responsive-grid {
						grid-template-columns: 1fr;
						gap: 10px;
					}
					.list-group-item {
						font-size: 0.98rem;
						padding: 10px 8px;
					}
				}
			`}</style>
		</div>
	);
}