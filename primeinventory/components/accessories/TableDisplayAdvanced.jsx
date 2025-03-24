import React, { useState } from 'react'
import TableDisplay from './TableDisplay';

export default function TableDisplayAdvanced({ handleSeverSideProcessing, serverSideFiltering, data, columns }) {
	const [queryParams, setQueryParams] = useState({ count: 10, page: 1 });
	const [filteredData, setFilteredData] = useState(data);

	const RunServerAction = async function (currentPage, currentCount) {
		if (typeof handleSeverSideProcessing === "function" && serverSideFiltering == true) {
			setIsLoading(true);
			const processedResponse = await handleSeverSideProcessing(currentCount, currentPage);

			if (processedResponse) {
				const { result, error } = processedResponse;
				setTimeout(() => {
					if (result) {
						setFilteredData(result);
					} else {
						alert(error);
					}
					setIsLoading(false);
				}, 300);
			}
		}
	}


	const handlePagination = async (value) => {
		let currentPage = queryParams.page;
		if (typeof value === "number") {
			currentPage = value;
		}

		if (typeof value === "string" && ['Next', 'Previous'].includes(value)) {
			const nextPage = value === "Next" ? currentPage + 1 : (currentPage > 0 ? currentPage - 1 : 0);
			currentPage = nextPage;
		}
		setQueryParams({ ...queryParams, page: currentPage });
		await RunServerAction(currentPage, queryParams.count);
	}

	return (
		<div>
			<TableDisplay
				handleSeverSideProcessing={handleSeverSideProcessing}
				data={filteredData}
				column={columns}
				serverSideFiltering={true}
				RunServerAction={RunServerAction}
				handlePagination={handlePagination}
				setQueryParams={setQueryParams}
				queryParams={queryParams}
			/>
		</div>
	)
}
