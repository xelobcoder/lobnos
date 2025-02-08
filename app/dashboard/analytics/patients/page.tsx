"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Select from 'react-select';
import { customFetch, reactSelectCustomStyles } from '../../../../components/Auth/customFetch';


interface RouteOption {
    endpoint: string;
    description: string;
}

// Mapping from endpoint to dynamically imported component.
// Adjust the import paths as needed.
const routeComponents: Record<string, React.LazyExoticComponent<React.FC>> = {
    '/api/v1/patient-analytics/age-distribution': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/AgeDistribution')),
    '/api/v1/patient-analytics/gender-distribution': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/GenderDistribution')),
    '/api/v1/patient-analytics/marital-status': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/MaritalStatus')),
    '/api/v1/patient-analytics/patient-registration-over-time': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/PatientRegistrationOverTime')),
    '/api/v1/patient-analytics/activation-status': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/ActivationStatus')),
    '/api/v1/patient-analytics/preferred-contact-method': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/PreferredContactMethod')),
    '/api/v1/patient-analytics/whatsapp-usage': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/WhatsappUsage')),
    '/api/v1/patient-analytics/organization-affiliation': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/OrganizationAffiliation')),
    '/api/v1/patient-analytics/designation': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/Designation')),
    '/api/v1/patient-analytics/name-patterns': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/NamePatterns')),
    '/api/v1/patient-analytics/unique-identifiers': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/UniqueIdentifiers')),
    '/api/v1/patient-analytics/age-type-analysis': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/AgeTypeAnalysis')),
    '/api/v1/patient-analytics/age-group-segmentation': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/AgeGroupSegmentation')),
    '/api/v1/patient-analytics/occupation-distribution': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/OccupationDistribution')),
    '/api/v1/patient-analytics/occupation-vs-age-gender': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/OccupationVsAgeGender')),
    '/api/v1/patient-analytics/missing-data-analysis': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/MissingDataAnalysis')),
    '/api/v1/patient-analytics/duplicate-records': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/DuplicateRecords')),
    '/api/v1/patient-analytics/date-of-birth-analysis': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/DateOfBirthAnalysis')),
    '/api/v1/patient-analytics/registration-date-vs-activation': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/RegistrationDateVsActivation')),
    '/api/v1/patient-analytics/combined-attributes': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/CombinedAttributes')),
    '/api/v1/patient-analytics/high-value-patients': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/HighValuePatients')),
    '/api/v1/patient-analytics/patient-churn-prediction': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/PatientChurnPrediction')),
    '/api/v1/patient-analytics/age-related-health-risks': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/AgeRelatedHealthRisks')),
    '/api/v1/patient-analytics/dashboards': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/Dashboards')),
    '/api/v1/patient-analytics/monthly-patient-registration-trend': React.lazy(() => import('../../../../components/analytics/patients-analytics/components/MonthlyPatientRegistrationTrend')),
};

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

    const SelectedComponent = selectedRoute ? routeComponents[selectedRoute.endpoint] : null;

    return (
        <div>
            <div className="d-flex justify-content-between">
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
            </div>
            <div>
                {SelectedComponent && (
                    <Suspense fallback={<div>Loading component...</div>}>
                        <SelectedComponent />
                    </Suspense>
                )}
            </div>
        </div>
    );
};

export default Page;
