import { currencyFormatter, customFetch } from "../../../Lib/fetcher";
import { GeneralLosessSummaryType } from "../../../components/interfaces/departmentInterface";
import { getWastageSummary } from "../../../components/inventory/Util";
import GeneralLosessSummary from "../../../components/inventory/stocks/wastages/GeneralLosessSummary";
import WastageChartGrouper from "../../../components/inventory/stocks/wastages/WastageChartGrouper";

interface InventoryWastagesProps {
	searchParams:Promise< {
		expandedTarget: (number | string),
		departmentid: number,
		activestate: number,
		isChart: boolean,
		count: number,
		page: number
	}>
}

export default async function InventoryWastages({ searchParams }: InventoryWastagesProps) {
	const { departmentid, activestate, count, page } = await searchParams;

	const summaryEndpoint = `inventory/wastages/summary${departmentid ? `?departmentid=${departmentid}` : ''}`;
	const quarterlyEndpoint = `inventory/wastages/data/quarters?quarters=${activestate}&&count=${count}&&page=${page}${departmentid ? `&&departmentid=${departmentid}` : ''}`;
	let wastedDataProduct = `inventory/wastages/data/quarters/summary?quarters=${activestate}&&departmentid=${departmentid}`;

	if (page && count) {
		wastedDataProduct += `&&page=${page}&&count=${count}`;
	}

	let summaryResponse, quarterlyResponse, wastedDataProductList;
	let quarterlyData = [];
	let isLoading = true;
	let loadingDetails = false;
	let errorMessage = '';

	try {
		[summaryResponse, quarterlyResponse, wastedDataProductList] = await Promise.all([
			getWastageSummary(summaryEndpoint),
			customFetch(quarterlyEndpoint),
			customFetch(wastedDataProduct)
		]);

		const { data, isLoading: summaryLoading }: { data: GeneralLosessSummaryType, isLoading: boolean } = summaryResponse;
		isLoading = summaryLoading;

		if (quarterlyResponse?.status === "success") {
			quarterlyData = quarterlyResponse.result;
		} else {
			loadingDetails = true;
		}



		if (wastedDataProductList?.result && Array.isArray(wastedDataProductList.result) && wastedDataProductList.result.length > 0) {
			wastedDataProductList = wastedDataProductList.result
		} else {
			wastedDataProductList = []
		}


	} catch (error) {
		errorMessage = 'An error occurred while fetching data. Please try again later.';
		console.error(error);
	}


	return (
		<div className="">
			<div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
				<h5 className="text-decoration-underline text-uppercase mb-2 mb-md-0">
					{departmentid ? "Department Wastages" : "General/Main Store Losses (Wastages) Summary"}
				</h5>
				<h5 className="border border-danger border-2 p-2 mx-2">
					Total Wastage  {currencyFormatter.format(summaryResponse?.data?.totalWastage || 0)}
				</h5>
			</div>

			<GeneralLosessSummary
				endpoint={summaryEndpoint}
				generalSummary={summaryResponse?.data || {}}
				isLoading={isLoading}
				active={activestate}
			/>
			<WastageChartGrouper active={activestate}
				generalSummary={summaryResponse?.data}
				quarterlyData={quarterlyData}
				wastedDataProductList={wastedDataProductList}
				departmentid={departmentid} />
		</div>
	);
}
