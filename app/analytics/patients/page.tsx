"use client";

import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import { customFetch } from '../../../components/Auth/customFetch';

// Import all analytics components directly
import AgeDistribution from '../../../components/analytics/patients-analytics/components/AgeDistribution';
import GenderDistribution from '../../../components/analytics/patients-analytics/components/GenderDistribution';
import MaritalStatus from '../../../components/analytics/patients-analytics/components/MaritalStatus';
import PatientRegistrationOverTime from '../../../components/analytics/patients-analytics/components/PatientRegistrationOverTime';
import OccupationDistribution from '../../../components/analytics/patients-analytics/components/OccupationDistribution';
import MissingDataAnalysis from '../../../components/analytics/patients-analytics/components/MissingDataAnalysis';
import Dashboards from '../../../components/analytics/patients-analytics/components/Dashboards';

interface RouteOption {
	endpoint: string;
	description: string;
}

const Page: React.FC = () => {
	const [activeTab, setActiveTab] = useState('dashboards');

	return (
		<Container fluid className="py-4">

			<Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'dashboards')} className="mb-4">
				<Tab eventKey="dashboards" title="📊 Dashboards">
					{activeTab === 'dashboards' && (
						<div className="row g-4">
							<div className="col-12">
								<Dashboards />
							</div>
						</div>
					)}
				</Tab>

				<Tab eventKey="age-distribution" title="👶 Age Distribution">
					{activeTab === 'age-distribution' && (
						<div className="row g-4">
							<div className="col-12">
								<AgeDistribution />
							</div>
						</div>
					)}
				</Tab>

				<Tab eventKey="gender-distribution" title="🚹🚺 Gender Distribution">
					{activeTab === 'gender-distribution' && (
						<div className="row g-4">
							<div className="col-12">
								<GenderDistribution />
							</div>
						</div>
					)}
				</Tab>

				<Tab eventKey="marital-status" title="💍 Marital Status">
					{activeTab === 'marital-status' && (
						<div className="row g-4">
							<div className="col-12">
								<MaritalStatus />
							</div>
						</div>
					)}
				</Tab>

				<Tab eventKey="occupation-distribution" title="💼 Occupation Distribution">
					{activeTab === 'occupation-distribution' && (
						<div className="row g-4">
							<div className="col-12">
								<OccupationDistribution />
							</div>
						</div>
					)}
				</Tab>

				<Tab eventKey="patient-registration" title="📅 Patient Registration">
					{activeTab === 'patient-registration' && (
						<div className="row g-4">
							<div className="col-12">
								<PatientRegistrationOverTime />
							</div>
						</div>
					)}
				</Tab>


				<Tab eventKey="missing-data" title="❓ Missing Data Analysis">
					{activeTab === 'missing-data' && (
						<div className="row g-4">
							<div className="col-12">
								<MissingDataAnalysis />
							</div>
						</div>
					)}
				</Tab>
			</Tabs>
		</Container>
	);
};

export default Page;
