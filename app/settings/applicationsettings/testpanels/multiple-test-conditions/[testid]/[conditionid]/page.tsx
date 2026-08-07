import React from 'react';
import MultiFieldSelectConditions from '../../../../../../../components/settingsComponents/FieldsCreation/MultiFieldConditions';
import { customFetch } from '../../../../../../../components/Auth/customFetch';

type TestCondition = {
	id: number;
	testId: number;
	parameter: string;
	conditionId: number;
	target: string;
	inRange: boolean | number;
	createdBy: number | null;
	updatedOn: string;
	conditionConstraint: string;
};

type Condition = {
	fieldConstraints: TestCondition[] | [];
	conditionName: string;
	testid: number;
	conditionId: number | null;
};

export default async function MultipleTestConditionPage({ params }: { params: { testid: number, conditionid: number } }) {
	const { testid, conditionid } = params;
	let fields: any[] = [];
	let condition: Condition = {
		fieldConstraints: [],
		conditionName: '',
		testid,
		conditionId: conditionid
	};

	if (!conditionid) {
		throw new Error('Condition ID is null or undefined');
	}

	try {
		if (testid) {
			const [response, conditionDefinition, contraintsChecker] = await Promise.all([
				customFetch(`testpanel/list/customtestrule?testid=${testid}`),
				customFetch(`multi/definition/${conditionid}`),
				customFetch(`multi/definition/conditions/${conditionid}`)
			]);

			console.log([response, conditionDefinition, contraintsChecker])

			if (conditionDefinition && Array.isArray(conditionDefinition) && conditionDefinition.length > 0) {
				condition.conditionName = conditionDefinition[0]['conditionName'];
				condition.conditionId = conditionDefinition[0]['id'];
			}

			const { result } = contraintsChecker;

			if (result && Array.isArray(result)) {
				condition.fieldConstraints = result;
			}

			if (response && Array.isArray(response)) {
				fields = response;
			}
		}
	} catch (error) {
		console.error('Error fetching data:', error);
		throw new Error('Failed to fetch data');
	}

	return (
		<div className="container-fluid px-3 py-3">
			<div className="row g-3">
				<div className="col-12 col-lg-4">
					<div className="border rounded p-3 bg-body h-100">
						<h6 className="fw-semibold mb-2">Condition Setup</h6>
						<p className="text-muted mb-3 small">
							Configure and review validators for this test condition.
						</p>
						<div className="d-flex flex-column gap-2 small">
							<div className="d-flex justify-content-between">
								<span className="text-muted">Condition</span>
								<span className="fw-semibold text-capitalize">{condition.conditionName || "N/A"}</span>
							</div>
							<div className="d-flex justify-content-between">
								<span className="text-muted">Available Fields</span>
								<span className="fw-semibold">{fields.length}</span>
							</div>
							<div className="d-flex justify-content-between">
								<span className="text-muted">Current Validators</span>
								<span className="fw-semibold">{condition.fieldConstraints.length}</span>
							</div>
						</div>
					</div>
				</div>

				<div className="col-12 col-lg-8">
					<div className="border rounded p-3 bg-body">
						<MultiFieldSelectConditions fields={fields as any} testid={testid} conditionInitData={condition} />
					</div>
				</div>
			</div>
		</div>
	);
}