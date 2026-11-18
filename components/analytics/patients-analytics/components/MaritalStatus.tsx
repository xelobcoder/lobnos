"use client";

import React from 'react';
import PatientDistributionReport from './PatientDistributionReport';

const normalizeStatus = (value: string | null) => {
	const status = value?.trim();
	return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown';
};

const MaritalStatus: React.FC = () => (
	<PatientDistributionReport
		title="Marital status"
		description="Review the distribution of recorded marital status across registered patients."
		endpoint="patient-analytics/marital-status"
		categoryName="marital_status"
		normalize={normalizeStatus}
	/>
);

export default MaritalStatus;
