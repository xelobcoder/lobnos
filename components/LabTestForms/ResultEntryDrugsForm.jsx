import { useEffect, useState } from "react";
import { customFetch } from "../Auth/customFetch";

export default function ResultEntryDrugsForm({ setModifiedDrugs, ascensionid, testid }) {
	const [data, setData] = useState([]);
	const [isLoading, setLoading] = useState(true);

	const loadDrugsIfHasDrugs = async () => {
		const result = await customFetch(`result/entry/customtest/drugs?ascensionid=${ascensionid}&&testid=${testid}`);
		return result;
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const drugs = await loadDrugsIfHasDrugs();
				if (drugs && Array.isArray(drugs)) {
					drugs.forEach((item, index) => {
						item.selected = ['Resistant', 'Sensitive'].includes(item.sensitivity);
					});
				}
				setData(drugs);
			} catch (error) {
				console.error("Error fetching drugs:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [ascensionid]);

	const handleSensitivityChange = (id, value) => {
		setData((prevData) =>
			prevData.map((item) =>
				item.id === id ? { ...item, sensitivity: value, selected: ['Resistant', 'Sensitive'].includes(value) } : item
			)
		);
	};


	useEffect(() => {
		setModifiedDrugs(data)
	}, [data])



	if (isLoading) {
		return <div className="text-center p-3">Loading Data...</div>;
	}

	return (
		<div className="mt-3">
			<h6 style={{ color: 'var(--bs-body-color)' }}>Drugs Sensitivity Test</h6>
			<table className="table pls-color ttable" style={{ backgroundColor: 'var(--theme-card-bg)', color: 'var(--bs-body-color)' }}>
				<thead style={{ backgroundColor: 'var(--bs-tertiary-bg)', color: 'var(--bs-body-color)' }}>
					<tr>
						<th style={{ backgroundColor: 'var(--bs-tertiary-bg)', color: 'var(--bs-body-color)' }}>Drug Name</th>
						<th style={{ backgroundColor: 'var(--bs-tertiary-bg)', color: 'var(--bs-body-color)' }}>Sensitivity</th>
					</tr>
				</thead>
				<tbody>
					{data.map((item, index) => (
						<tr key={item.id}>
							<td style={{ backgroundColor: 'var(--theme-card-bg)', color: 'var(--bs-body-color)' }}>{item.drug}</td>
							<td style={{ backgroundColor: 'var(--theme-card-bg)', color: 'var(--bs-body-color)' }}>
								<select
									className="form-select form-select-sm "
									style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
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
