import ResultViewHtmlGenerator from "../Auth/ResultViewHtmlGenerator";
import { ResultSettings } from "../ResultView/result-settings";
import styles from '../../app/result/labreport/4/MDSLancet.Template.module.css';

export interface TestDetailCategory {
	categoryid: number;
	categoryname: string;
	testid: number;
	createdby: string;
	updatedby: string | null;
	created_at: string;
	updated_at: string;
	deleted: number;
}

interface UseCustomResultTemplatingPreviewProps {
	test: string;
	records: any[];
	isResultView?: boolean;
	resultsettings: ResultSettings
	testdetailcategory?: TestDetailCategory[];
	isScan?: boolean;
	testInfo?: {
		reportitle?: string;
	};
}

export default function UseCustomResultTemplatingPreview({ test, records, isResultView = true, isScan = false, resultsettings, testInfo, testdetailcategory }: UseCustomResultTemplatingPreviewProps) {
	if (!Array.isArray(records) || records.length === 0) return null;

	let reorganized: { [category: string]: any[] } = {};
	let uncategorized: any[] = [];
	if (records.length > 0 && testdetailcategory && testdetailcategory.length > 0) {
		const categoryMap = new Map(testdetailcategory.map(cat => [cat.categoryid, cat]));
		// Sort records by 'ordering' property in ascending order before reorganizing
		const sortedRecords = [...records].sort((a, b) => {
			const orderA = typeof a.ordering === 'number' ? a.ordering : Number(a.ordering) || 0;
			const orderB = typeof b.ordering === 'number' ? b.ordering : Number(b.ordering) || 0;
			return orderA - orderB;
		});

		reorganized = sortedRecords.reduce((acc, record) => {
			const category = categoryMap.get(record.categoryid);
			if (category) {
				if (!acc[category.categoryname]) {
					acc[category.categoryname] = [];
				}
				acc[category.categoryname].push(record);
			} else {
				uncategorized.push(record);
			}
			return acc;
		}, {} as { [category: string]: any[] });
	}

	const tableHeaderFontSize =  resultsettings?.testTableHeaderFontSize + 'px' || '13px';


	return (
		<div >
			<h5 className="text-uppercase ui text-center border-bottom  border-2 border-light"
				style={{ backgroundColor: resultsettings?.testnameBackgroundColor || 'royalblue', color: resultsettings?.testnameColor || 'black', }}>
				<span className="text-uppercase" style={{ fontSize: resultsettings?.testnameFontSize || '14px' }}>
					{testInfo && testInfo?.reportitle ? testInfo?.reportitle : test}
				</span>
			</h5>
			<table style={{ width: '100% !important', marginLeft: '0mm !important', marginRight: '0mm !important' }}
				className={isResultView ? `${styles.resulttable} table-borderless table-sm` : `table billing-cart-table`} >
				<thead style={{
					backgroundColor: resultsettings?.testTableHeaderBackgroundColor || 'orange',
					color: resultsettings?.testTableHeaderTextColor || 'black',
					width: '100% !important',
					padding: '10px !important',
					fontSize: tableHeaderFontSize,
				}}>
					<tr>
						<th style={{ width: '45%' }} >{resultsettings.testBody.trFirstColumnName || 'Test'}</th>
						<th style={{ width: '20%' }}>{resultsettings.testBody.trSecondColumnName || 'Value'}</th>
						<th style={{ width: '10%' }}>{resultsettings.testBody.trThirdColumnName || 'Units'}</th>
						<th style={{ width: '20%' }}>{resultsettings.testBody.trFourthColumnName || 'References'}</th>
						<th style={{ width: '5%' }}>{resultsettings.testBody.trFifthColumnName || 'Flags'}</th>
					</tr>
				</thead>
				<tbody>
					{testdetailcategory && testdetailcategory.length > 0 && Object.keys(reorganized).length > 0 ? (
						<>
							{Object.entries(reorganized).map(([catName, recs]) => [
								<tr key={catName + '-heading'}>
									<td colSpan={5} style={{ fontWeight: 600, fontSize: 15, background: '#f7f7fa', color: 'black', textDecoration: 'underline' }}>{catName}</td>
								</tr>,
								...recs.map((item, index) => (
									<ResultViewHtmlGenerator index={index} field={item} key={catName + '-' + index} resultsettings={resultsettings} />
								))
							])}
							{uncategorized.length > 0 && [
								<tr key="others-spacing-row"><td colSpan={5} style={{ height: 12, background: 'transparent', border: 'none' }}></td></tr>,
								<tr key="others-label-row">
									<td colSpan={5} style={{ fontWeight: 400, fontSize: 13, background: '#f7f7fa', color: '#555', fontStyle: 'italic', borderTop: '1px solid #eee' }}>Others</td>
								</tr>,
								...uncategorized.map((item, index) => (
									<ResultViewHtmlGenerator index={index} field={item} key={'uncategorized-' + index} resultsettings={resultsettings} />
								))
							]}
						</>
					) : (
						Array.isArray(records) && records.map((item, index) => (
							<ResultViewHtmlGenerator index={index} field={item} key={index} resultsettings={resultsettings} />
						))
					)}
				</tbody>
			</table>


		</div>
	)
}