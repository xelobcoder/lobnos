import { Info } from "@mui/icons-material"

export default function AscenstionProcessingTable({ isLoading, testCollection, handleProcessing }) {

	if (isLoading) return <div>Loading .......................</div>

	if (testCollection.length == 0 && !isLoading) {
		return (<div className="p-3 alert col-3 alert-info text-sm">
			<span className="mx-2">
				<Info />
			</span>
			<span>
				No test found in processing Stage.
			</span>
		</div>)
	}


	return (
		<div className="container-fluid" >
			<table className="table text-sm"  >
				<thead className="table-secondary position-static">
					<tr>
						<th style={{ width: '2%', fontSize: '15px' }} className="">#</th>
						<th>Ascension Date</th>
						<th style={{ fontSize: '15px' }}>CustomerId</th>
						<th>BillID</th>
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
								<td>
									{new Date(item.ascension_date).toLocaleDateString()}
								</td>
								<td className="p-3">{item.patientid}</td>
								<td>{item.billingid}</td>
								<td className="p-3 text-uppercase fw-bold">{item.fullname}</td>
								<td className="p-3">{item.age}</td>
								<td className="p-3">{item.name}</
								td>
								<td>{item.processingStartDate ? new Date(item.processingStartDate).toLocaleDateString() : ""}</td>
								<td>{item.processingEndDate ? new Date(item.processingEndDate).toLocaleDateString() : ""}</td>
								<td>
									<div >
										<button onClick={(ev) => { handleProcessing(item, 'start') }} className="btn btn-success btn-sm">start processing</button>
										<button
											onClick={(ev) => { handleProcessing(item, 'stop') }}
											className="mx-2 btn btn-danger btn-sm">
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
	)
}