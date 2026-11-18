"use client";

import React from 'react';
import PatientDistributionReport from './PatientDistributionReport';

const normalizeGender = (value: string | null) => {
	const normalized = value?.trim().toLowerCase();
	return normalized === 'male' ? 'Male' : normalized === 'female' ? 'Female' : 'Unknown';
};

const GenderDistribution: React.FC = () => (
	<PatientDistributionReport
		title="Gender distribution"
		description="Understand the recorded gender profile of patients in your laboratory."
		endpoint="patient-analytics/gender-distribution"
		categoryName="gender"
		normalize={normalizeGender}
	/>
);

export default GenderDistribution;
