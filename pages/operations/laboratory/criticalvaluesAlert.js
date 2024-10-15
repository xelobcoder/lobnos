import { useEffect, useState } from "react";
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import { customFetch } from "../../../components/Auth/customFetch";
import Pagination from '../../../components/accessories/pagination'
export default function CriticalValuesAlert() {
	const [criticalValues, setCriticalValues] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const [loadQuery, setLoadQuery] = useState({ page: 1, count: 10 });
	const [load, setLoad] = useState(false);


	const getCriticaValues = async () => {
		customFetch(`result/criticalvalues/unseen?count=${loadQuery.count}&&page=${loadQuery.page}`)
			.then((criticalValues) => { setCriticalValues(criticalValues) })
			.catch((err) => console.log(err));
	}

	useEffect(() => {
		getCriticaValues();
	}, [loadQuery])




	const CriticalTable = (data = [], date, fullname, billingid) => {
		return (
			<div>
				<h5 className="fw-bold heightedBorder p-2 pls-color bg-body-secondary grid-50"><span>
					Critical Values for {fullname}
				</span>
					<span className="m-0">{"<"} TransactionId {billingid}  {">"} </span></h5 >
				<div className="list-group-item">
					<table className="table billing-cart-table ttable">
						<thead>
							<tr>
								<th style={{ width: '15%' }}>Date</th>
								<th>Remarks</th>
							</tr>
						</thead>
						<tbody >
							{data.map((tr, index) => {
								return (
									<tr>
										<td>
											{new Date(date).toLocaleDateString()}
										</td>
										<td className="table-warning">
											{tr}
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			</div>
		)
	}


	const updatePagination = (value) => { setLoadQuery({ ...loadQuery, page: value }) }

	if (isLoading) {
		return (
			<LaboratoryLayout>
				<div className=" heightedBorder fw-bold bg-body-secondary pls-color d-flex justify-content-center p-2">{"<"}Loading data {">"}</div>
			</LaboratoryLayout>
		)
	}

	if (criticalValues.length === 0) {
		return (
			<LaboratoryLayout>
				<div className=" heightedBorder fw-bold bg-body-secondary pls-color d-flex justify-content-centerp-2">{"<"}No data Available {">"}</div>
			</LaboratoryLayout>
		)
	}

	return (
		<LaboratoryLayout>


			<div className="col-1 my-2">
				<select className="custom-select" value={loadQuery.count}>
					<option>select opt</option>
					{[10, 20, 30, 40, 50].map((m, i) => <option value={m}>{m}</option>)}
				</select>
			</div>
			<div>
				{criticalValues.map((item, index) => {
					const { fullname, constraints, createdon, billingid } = item;
					return CriticalTable(constraints, createdon, fullname, billingid);
				})}
				<div className="d-flex justify-content-center">
					<Pagination page={loadQuery.page} load={setLoad} updateFunction={updatePagination} />
				</div>
			</div>
		</LaboratoryLayout>
	)
}

