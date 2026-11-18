"use client";

import React from 'react';
import PatientDistributionReport from './PatientDistributionReport';

const normalizeOccupation = (value: string | null) => value?.trim() || 'Unknown';

const OccupationDistribution: React.FC = () => (
	<PatientDistributionReport
		title="Occupation distribution"
		description="Explore the most common occupations recorded for registered patients."
		endpoint="patient-analytics/occupation-distribution"
		categoryName="occupation"
		normalize={normalizeOccupation}
		topN={10}
	/>
);

export default OccupationDistribution;
