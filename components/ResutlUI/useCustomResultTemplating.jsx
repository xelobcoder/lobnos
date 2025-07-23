import { useEffect, useState } from "react"
import { customFetch } from "../Auth/customFetch"
import Loader from "../accessories/Loader"
import HasLimitReference from "./hasLimitsReference"
import ResultViewHtmlGenerator from "../Auth/ResultViewHtmlGenerator";

export default function UseCustomResultTemplating({ billingid, testid, test, patientid, isResultView = true }) {
	const [testname, setTestname] = useState('');
	const [result, setResult] = useState([])
	const [isloading, setLoading] = useState(true)

	useEffect(() => {
		try {
			async function getData() {
				if (billingid && testid) {
					setLoading(true)
					const response = await customFetch(`result/preview?billingid=${billingid}&&testid=${testid}&&test=${test}`)
					const { result } = response;
					result?.result && setResult(result?.result || [])
					result?.testname && setTestname(result?.testname);
					setLoading(false)
				}
			}
			getData()
		} catch (err) {
			setResult([])

			setLoading(false)
		}
	}, [billingid, test, testid, patientid])

	if (isloading) return <Loader />;

	if (Array.isArray(result) === false || result.length == 0) return <h4>No data provided</h4>


	return (
		<div >
			<h5 className="text-uppercase ui text-center border-bottom  border-2 border-secondary">
				<span className="fw-bold">
					{testname}
				</span>
			</h5>
			<table className={isResultView ? "alpha-result-table" : "table billing-cart-table"} >
				<thead className="table-warning">
					<tr>
						<th scope="col" >Parameter</th>
						<th scope="col">Value</th>
						<th scope="col">Units</th>
						<th scope="col">References</th>
						<th>Flags</th>
					</tr>
				</thead>
				<tbody >
					{result.map((item, index) => {
						return <ResultViewHtmlGenerator index={index} field={item} key={index} />
					})}
				</tbody>
			</table>
		</div>
	)
}