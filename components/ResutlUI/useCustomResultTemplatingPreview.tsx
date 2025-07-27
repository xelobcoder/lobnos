import ResultViewHtmlGenerator from "../Auth/ResultViewHtmlGenerator";

export default function UseCustomResultTemplatingPreview({  test, records,isResultView=true,resultsettings }) {
	if (!Array.isArray(records) || records.length == 0) return null;
	return (
		<div >
			<h5 className="text-uppercase ui text-center border-bottom  border-2 border-secondary" style={{backgroundColor: resultsettings?.testnameBackgroundColor || 'royalblue', color: resultsettings?.testnameColor || 'black', }}>
				<span className="text-uppercase" >
					{test}
				</span>
			</h5>
			<table className={isResultView ? "alpha-result-table  table table-borderless table-sm borderless " : "table billing-cart-table"} >
				<thead style={{ backgroundColor: resultsettings?.testTableHeaderBackgroundColor || 'orange', color: resultsettings?.testTableHeaderTextColor || 'black', fontSize: resultsettings?.testTableHeaderFontSize || '0.8rem' }}>
					<tr>
						<th scope="col" >Test</th>
						<th scope="col">Value</th>
						<th scope="col">Units</th>
						<th scope="col">References</th>
						<th scope="col">Flags</th>
					</tr>
				</thead>
				<tbody >
					{Array.isArray(records) &&  records.map((item, index) => {
						return <ResultViewHtmlGenerator index={index} field={item} key={index} resultsettings={resultsettings}/>
					})}
				</tbody>
			</table>
		</div>
	)
}