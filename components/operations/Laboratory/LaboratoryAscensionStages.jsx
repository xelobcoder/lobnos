import { useEffect, useState } from "react";
import LaboratoryAscensionFiltering from "./LaboratoryAscensionFiltering";
import { getAscensionData } from "./Lib";


export default function LaboratoryAscensionStages({ ascension_stage, fnReceiveData ,setLoading}) {
	const [searchString, setSearchString] = useState("");
	const [queryParams, setQueryParams] = useState({ _dateFrom: new Date(), _dateEnd: new Date(), searchQuery: '' })


	const _getAscensionData = function () {
		getAscensionData(ascension_stage,fnReceiveData, queryParams, searchString, setLoading);
	}


	useEffect(() => {
		_getAscensionData();
	}, [])


	const updateDateValues = (values) => {
		const [start, end] = values;
		setQueryParams({ _dateFrom: start, _dateEnd: end });
	}



	return (
		<div>
			<LaboratoryAscensionFiltering
				updateDateValues={updateDateValues}
				queryParams={queryParams}
				searchString={searchString}
				setSearchString={setSearchString}
				getAscensionData={_getAscensionData}
			/>
		</div>
	)
}


