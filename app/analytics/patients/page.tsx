"use client";

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { customFetch, reactSelectCustomStyles } from '../../../components/Auth/customFetch';

// Import all analytics components directly
import AgeDistribution from '../../../components/analytics/patients-analytics/components/AgeDistribution';
import GenderDistribution from '../../../components/analytics/patients-analytics/components/GenderDistribution';
import MaritalStatus from '../../../components/analytics/patients-analytics/components/MaritalStatus';
import PatientRegistrationOverTime from '../../../components/analytics/patients-analytics/components/PatientRegistrationOverTime';
import ActivationStatus from '../../../components/analytics/patients-analytics/components/ActivationStatus';
import PreferredContactMethod from '../../../components/analytics/patients-analytics/components/PreferredContactMethod';
import WhatsappUsage from '../../../components/analytics/patients-analytics/components/WhatsappUsage';
import OrganizationAffiliation from '../../../components/analytics/patients-analytics/components/OrganizationAffiliation';
import Designation from '../../../components/analytics/patients-analytics/components/Designation';
import NamePatterns from '../../../components/analytics/patients-analytics/components/NamePatterns';
import UniqueIdentifiers from '../../../components/analytics/patients-analytics/components/UniqueIdentifiers';
import AgeTypeAnalysis from '../../../components/analytics/patients-analytics/components/AgeTypeAnalysis';
import AgeGroupSegmentation from '../../../components/analytics/patients-analytics/components/AgeGroupSegmentation';
import OccupationDistribution from '../../../components/analytics/patients-analytics/components/OccupationDistribution';
import OccupationVsAgeGender from '../../../components/analytics/patients-analytics/components/OccupationVsAgeGender';
import MissingDataAnalysis from '../../../components/analytics/patients-analytics/components/MissingDataAnalysis';
import DuplicateRecords from '../../../components/analytics/patients-analytics/components/DuplicateRecords';
import DateOfBirthAnalysis from '../../../components/analytics/patients-analytics/components/DateOfBirthAnalysis';
import RegistrationDateVsActivation from '../../../components/analytics/patients-analytics/components/RegistrationDateVsActivation';
import CombinedAttributes from '../../../components/analytics/patients-analytics/components/CombinedAttributes';
import HighValuePatients from '../../../components/analytics/patients-analytics/components/HighValuePatients';
import PatientChurnPrediction from '../../../components/analytics/patients-analytics/components/PatientChurnPrediction';
import AgeRelatedHealthRisks from '../../../components/analytics/patients-analytics/components/AgeRelatedHealthRisks';
import Dashboards from '../../../components/analytics/patients-analytics/components/Dashboards';
import MonthlyPatientRegistrationTrend from '../../../components/analytics/patients-analytics/components/MonthlyPatientRegistrationTrend';


interface RouteOption {
    endpoint: string;
    description: string;
}

const Page: React.FC = () => {
    const [routes, setRoutes] = useState<RouteOption[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const data = await customFetch('patient-analytics/routes');
                if (Array.isArray(data)) {
                    setRoutes(data);
                } else {
                    console.error('Fetched data is not an array:', data);
                }
            } catch (error) {
                console.error('Error fetching routes:', error);
            }
        };
        fetchRoutes();
    }, []);

    const options = routes.map((route) => ({
        value: route.endpoint,
        label: route.description,
    }));

    const handleSelectChange = (option: { value: string; label: string } | null) => {
        const selected = routes.find((route) => route.endpoint === option?.value) || null;
        setSelectedRoute(selected);
    };

    return (
        <div>
            {/* <div className="d-flex justify-content-between">
                <div className="col-5">
                    <h5 className="bg-secondary-subtle p-2 br-5 pls-color">Patient Analytics</h5>
                </div>
                <div className="col-6">
                    <Select
                        options={options}
                        onChange={handleSelectChange}
                        styles={reactSelectCustomStyles}
                        placeholder="Search Here"
                    />
                </div>
            </div> */}
            <div>
                {/* Render all analytics components at once */}
                <AgeDistribution />
                <GenderDistribution />
                <MaritalStatus />
                <PatientRegistrationOverTime />
                <ActivationStatus />
                <PreferredContactMethod />
                <WhatsappUsage />
                <OrganizationAffiliation />
                <Designation />
                <NamePatterns />
                <UniqueIdentifiers />
                <AgeTypeAnalysis />
                <AgeGroupSegmentation />
                <OccupationDistribution />
                <OccupationVsAgeGender />
                <MissingDataAnalysis />
                <DuplicateRecords />
                <DateOfBirthAnalysis />
                <RegistrationDateVsActivation />
                <CombinedAttributes />
                <HighValuePatients />
                <PatientChurnPrediction />
                <AgeRelatedHealthRisks />
                <Dashboards />
                <MonthlyPatientRegistrationTrend />
            </div>
        </div>
    );
};

export default Page;
