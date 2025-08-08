"use client";
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../../../../components/Auth/customFetch';
import CreateTestFields from '../../../../../../components/settingsComponents/FieldsCreation/createfieldsComponent';

export default function CreateSingleFieldPage({ searchParams }: { searchParams: { testid: number, testname: string } }) {
	const { testid, testname } = searchParams;
	const [testdata, setTestdata] = useState<any>(null);
	const [fieldConstraintsCategorization, setFieldConstraintsCategorization] = useState<any>(null);
	const [testRules, setTestRules] = useState<any>(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		async function fetchData() {
			if (!testid) {
				setError(true);
				return;
			}
			try {
				const [td, fc, tr] = await Promise.all([
					customFetch(`gettestpanel/edit?id=${testid}`),
					customFetch(`test/fields/category/test/${testid}`),
					customFetch(`testpanel/list/customtestrule?testid=${testid}`)
				]);
				setTestdata(td);
				setFieldConstraintsCategorization(fc);
				setTestRules(tr);
			} catch (err) {
				setError(true);
			}
		}
		fetchData();
	}, [testid]);

	if (error || !testid) {
		return <div className='bg-danger-subtle pls-label p-3 col-4 br-5 plas-color'>Test Not recognized</div>;
	}

	return (
		<div>
			<CreateTestFields
				fieldConstraintsCategorization={fieldConstraintsCategorization}
				testRules={testRules}
				testdata={testdata}
				testname={testname}
				testid={testid}
			/>
		</div>
	);
}