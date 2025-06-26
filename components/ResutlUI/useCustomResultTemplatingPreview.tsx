import ResultViewHtmlGenerator from "../Auth/ResultViewHtmlGenerator";

export default function UseCustomResultTemplatingPreview({  test, records,isResultView=true }) {
	if (!Array.isArray(records) || records.length == 0) return null;
	return (
		<div >
			<h5 className="text-uppercase ui text-center border-bottom  border-2 border-secondary">
				<span className="fw-bold text-uppercase">
					{test}
				</span>
			</h5>
			<table className={isResultView ? "alpha-result-table  table table-borderless table-sm borderless " : "table billing-cart-table"} >
				<thead className={isResultView ? "table-warning table-sm" : "table-secondary"} >
					<tr>
						<th scope="col" >Test</th>
						<th scope="col">Value</th>
						<th scope="col">Units</th>
						<th scope="col">References</th>
						<th scope="col">Flags</th>
					</tr>
				</thead>
				<tbody >
					{records.map((item, index) => {
						return <ResultViewHtmlGenerator index={index} field={item} key={index} />
					})}
				</tbody>
			</table>
		</div>
	)
}