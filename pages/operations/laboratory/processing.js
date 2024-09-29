import { useEffect, useState } from "react"
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import { Info } from "@mui/icons-material";
import { customFetch } from "../../../components/Auth/customFetch";
import DatePickerRange from "../../../components/accessories/DatePickerRange";
import moment from "moment/moment";


export default function AscensionProcessingStage() {
	const [isLoading, setLoading] = useState(true);
	const [date, setDate] = useState({ _dateFrom: new Date(), _dateEnd: new Date() })
	const [testCollection, setCollection] = useState([]);

	async function getAscensionData() {
		try {
			setLoading(true);
			const result = await customFetch(`operations/ascension/staging?operationsStaging=PROCESSING&&dateFrom=${date._dateFrom}&&dateEnd=${date._dateEnd}`);
			setCollection(result);
		} catch (err) {
			setCollection([]);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		getAscensionData();
	}, [])


	const updateDateValues = (values) => {
		const [start, end] = values;
		setDate({ _dateFrom: start, _dateEnd: end });
	}

	console.log(moment().add(4, 'days').format())
	if (isLoading) return <LaboratoryLayout><div>Loading .......................</div></LaboratoryLayout>

	if (testCollection.length == 0 && !isLoading) {
		return (
			<LaboratoryLayout>
				<div className="p-3 alert col-3 alert-info text-sm">
					<span className="mx-2">
						<Info />
					</span>
					<span>
						No test found in processing Stage.
					</span>
				</div>
			</LaboratoryLayout>
		)
	}


	return (
		<LaboratoryLayout>
			<div className="container-fluid  d-lg-flex my-2">
				<div className="col-12-sm ">
					<DatePickerRange
						start={date._dateFrom}
						end={date._dateEnd}
						getRange={updateDateValues}
					/>
				</div>
				<div className="col-6  mx-3">
					<input className="form-control text-sm  fw-medium p-3 text-uppercase" placeholder="type in your search here " />
				</div>
				<div className="mx-3 ">
					<button className="btn btn-primary btn-sm  p-3 px-5 text-uppercase">
						{"<"}Load Data{"/>"}
					</button>
				</div>
			</div>
			<div className="container-fluid" >
				<table className="table text-sm"  >
					<thead className="table-secondary position-static">
						<tr>
							<th style={{ width: '2%', fontSize: '15px' }} className="">#</th>
							<th style={{ fontSize: '15px' }}>CustomerId</th>
							<th style={{ fontSize: '15px' }} className="px-3">Name</th>
							<th style={{ fontSize: '15px' }} className="px-3">Age</th>
							<th style={{ fontSize: '15px' }} className="px-3">Test Name</th>
							<th style={{ fontSize: '15px' }} className="px-3">Initiated on</th>
							<th style={{ fontSize: '15px' }} className="px-3">Concluded on</th>
							<th style={{ fontSize: '15px' }} className="px-3">Action</th>
						</tr>
					</thead>
					<tbody>
						{
							testCollection.map((item, index) => {
								return <tr key={index}
									className={`${item.clientstatus == "urgent" ? "table-danger" : 'table-white'}`}>
									<td >
										<input type="checkbox" />
									</td>
									<td>{item.patientid}</td>
									<td className="p-3 text-uppercase fw-bold">{item.fullname}</td>
									<td className="p-3">{item.age}</td>
									<td className="p-3">{item.name}</
									td>
									<td>{moment().format()}</td>
									<td>{moment().subtract(4, 'days').format()}</td>
									<td>
										<div >
											<button className="btn btn-success btn-sm">start processing</button>
											<button className="mx-2 btn btn-danger btn-sm">
												processing concluded
											</button>
										</div>
									</td>
								</tr>
							})
						}
					</tbody>
					<tfoot className="bg-secondary">
						<tr>
							<td>Rows Count: 2000</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</LaboratoryLayout>
	)
}