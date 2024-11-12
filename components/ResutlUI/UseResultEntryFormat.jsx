import React, { useEffect, useState } from "react";
import { customFetch } from "../Auth/customFetch";
import Loader from "../accessories/Loader";

export default function UseResultEntryScientist({ testid, billingid, ascensionId }) {
	const [isLoading, setLoading] = useState(true);
	const [data, setData] = useState({ lastupdatedon: "", resultentry: "", validators: [] });

	useEffect(() => {
		if (billingid && testid) {
			setLoading(true);
			customFetch(`result/preview/entry/scientist?billingid=${billingid}&&testid=${testid}&&ascensionid=${ascensionId}`)
				.then((response) => setData(response))
				.catch((err) => console.log(err))
				.finally(() => setLoading(false));
		}
	}, [billingid, testid, ascensionId]);

	if (isLoading) return <Loader />;

	const { resultentry, validators, lastupdatedon ,enteredOn} = data;

	return (
		<div className="report-container">
			<div className="grid-30-30-30 text-sm">
				<span>Entry By:</span>
				<span> {resultentry}</span>
				<p>{new Date(enteredOn).toLocaleString()}</p>
			</div>
			{validators.map((validator) => (
				<div key={validator.employeeid} className="text-sm grid-30-30-30">
					<span>Validation By:</span>
					<span> {validator.username}</span>
					<p>{new Date(lastupdatedon).toLocaleString()}</p>
				</div>
			))}
		</div>
	);
}
