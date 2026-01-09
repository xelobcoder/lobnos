"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { customFetch } from '../../../../../../components/Auth/customFetch';
import CreateTestFields from '../../../../../../components/settingsComponents/FieldsCreation/createfieldsComponent';
import { Button } from 'react-bootstrap';

export default function CreateSingleFieldPage() {
	const searchParams = useSearchParams();
	const testid = searchParams?.get('testid') ? Number(searchParams.get('testid')) : undefined;
	const testname = searchParams?.get('testname') || '';
	const [testdata, setTestdata] = useState<any>(null);
	const [fieldConstraintsCategorization, setFieldConstraintsCategorization] = useState<any>(null);
	const [testRules, setTestRules] = useState<any>(null);
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		if (testid) {
			try {
				setLoading(true);
				const [td, fc, tr] = await Promise.all([
					customFetch(`gettestpanel/edit?id=${testid}`),
					customFetch(`test/fields/category/test/${testid}`),
					customFetch(`testpanel/list/customtestrule?testid=${testid}`)
				]);

				setTestdata(td);
				setFieldConstraintsCategorization(fc?.data || fc);
				setTestRules(tr?.data || tr);
				setLoading(false);
			} catch (err) {
				setError(true);
				setLoading(false);
			}
		} else {
			setError(true);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [testid]);




	if (loading) {
		return <div className='pls-label p-3 col-4 br-5 plas-color'>Loading...</div>;
	}

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
				onRefresh={fetchData}
			/>
		</div>
	);
}