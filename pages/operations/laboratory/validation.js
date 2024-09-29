import { useEffect, useState } from "react"
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import { Info } from "@mui/icons-material";
import { customFetch } from "../../../components/Auth/customFetch";
import { Table } from "react-bootstrap";

export default function AscensionValidationStage() {
	const [isLoading, setLoading] = useState(false);
	const [testCollection, setCollection] = useState([]);




	useEffect(() => {
		setLoading(true)
		customFetch(`operations/ascension/staging?operationsStaging=VALIDATION`)
			.then((data) => { setCollection(data) })
			.catch((err) => console.log(err))
		setLoading(false);
	}, [])


	if (isLoading) {
		return (<LaboratoryLayout>
			<div>Loading .......................</div>
		</LaboratoryLayout>)
	}

	if (testCollection.length == 0) {
		return (
			<LaboratoryLayout>
				<div className="p-3 alert col-5 alert-info text-sm">
					<span className="mx-2">
						<Info />
					</span>
					<span>
						No test found in completed Stage and result not entered.
					</span>
				</div>
			</LaboratoryLayout>
		)
	}


	return (
		<LaboratoryLayout>
			<div>
				<Table style={{ fontSize: '14px' }}>
					<thead className="table-secondary">
						<tr>
							<th>Name</th>
							<th>Age</th>
							<th>Test Name</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{
							testCollection.map((item, index) => {
								return <tr key={index}
									className={`${item.clientstatus == "urgent" ? "table-danger" : 'table-light'}`}>
									<td className="p-3 text-uppercase fw-bold">{item.fullname}</td>
									<td className="p-3">{item.age}</td>
									<td className="p-3">{item.name}</
									td>
									<td>
										<div >
											<button className="btn btn-success btn-sm">Result Entry</button>
										</div>
									</td>
								</tr>
							})
						}
					</tbody>
				</Table>
			</div>
		</LaboratoryLayout>
	)
}