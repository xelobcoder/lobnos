import { useEffect, useState } from "react";
import { customFetch } from "../Auth/customFetch";

export default function ResultEntryDrugsForm() {
	const [data, setData] = useState([]);
	const [isLoading, setLoading] = useState(true);

	const loadDrugsIfHasDrugs = async (testid) => {
		if (!testid) return [];
		const result = await customFetch(`drugs`);
		return result;
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const drugs = await loadDrugsIfHasDrugs(1);
				setData(drugs);
			} catch (error) {
				console.error("Error fetching drugs:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleSensitivityChange = (id, value) => {
		setData((prevData) =>
			prevData.map((item) =>
				item.id === id ? { ...item, sensitivity: value } : item
			)
		);
	};

	if (isLoading) {
		return <div className="text-center p-3">Loading Data...</div>;
	}

	return (
		<div className="mt-3">
			<h6>Drugs Sensitivity Test</h6>
			<table className="table pls-color ttable">
				<thead>
					<tr>
						<th>Drug Name</th>
						<th>Sensitivity</th>
					</tr>
				</thead>
				<tbody>
					{data.map((item, index) => (
						<tr key={item.id}>
							<td>{item.drug}</td>
							<td>
								<select
									className="form-select form-select-sm"
									value={item.sensitivity || ""}
									onChange={(e) =>
										handleSensitivityChange(
											item.id,
											e.target.value
										)
									}
								>
									<option value="">Select</option>
									<option value="Resistant">Resistant</option>
									<option value="Sensitive">Sensitive</option>
								</select>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
