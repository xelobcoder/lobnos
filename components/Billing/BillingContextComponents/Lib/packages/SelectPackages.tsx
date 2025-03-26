import React, { useState, useEffect, useContext } from 'react';
import { Form, Card, Spinner } from 'react-bootstrap';
import {  RiErrorWarningLine } from '@remixicon/react';
import Select from 'react-select';
import { customFetch, customPost } from '../../../../Auth/customFetch';
import { BillingContext } from '../../BillingContext';

interface PackageOption {
    label: string;
    value: number;
}

interface TestData {
    concessionMode: string;
    concessionValue: number;
    discount: number;
    discountedValue: number;
    isoutsourced: number;
    name: string;
    id: number;
    package_id: number;
    price: number;
    testid: number;
}

export default function SelectPackages() {
    const { updateBilling, billingdata, recalculateTotalBill } = useContext(BillingContext);
    const [loading, setLoading] = useState(false);
    const [loadingPackageTest, setLoadingPackageTest] = useState(false);
    const [checked, setChecked] = useState(false);
    const [packages, setPackages] = useState<PackageOption[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const { clinicianId, organizationId, billingSource, previousRecords } = billingdata;

    const fetchPackages = async () => {
        if (billingSource && [1, 2, 6].includes(billingSource)) {
            try {
                if (billingSource === 6 && !clinicianId) return;
                if (billingSource === 2 && !organizationId) return;

                setLoading(true);
                setErrorMessage('');

                const requestData = { clinicianId, organizationId, billingSource };
                const response = await customPost('packages/billing/verify/load', 'POST', requestData);

                if (response) {
                    setPackages(
                        response.map((pkg: any) => ({
                            value: pkg.id,
                            label: pkg.package_name,
                        }))
                    );
                }
            } catch (err) {
                console.error(err);
                setErrorMessage('Failed to load packages. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
    };

    const loadSelectedPackage = async (packageId: number) => {
        try {
            setLoadingPackageTest(true);
            setErrorMessage('');

            const response = await customFetch(`package-tests/${packageId}`);
            if (response && Array.isArray(response) && response.length > 0) {
                const formattedTests = formatTestData(response);
                handleSelectedPackagePanels(formattedTests);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage('Failed to load package tests. Please try again later.');
        } finally {
            setLoadingPackageTest(false);
        }
    };

    const formatTestData = (tests: any[]): TestData[] => {
        return tests.map((test) => {
            const { price, concession_mode, concession_value, name, test_id } = test;
            let discount = 0;
            let discountedValue = price;

            if (concession_mode === 'absolute' && concession_value) {
                discount = parseFloat(concession_value);
                discountedValue = price - discount;
            } else if (concession_mode === 'percentage' && concession_value) {
                discount = (price * parseFloat(concession_value)) / 100;
                discountedValue = price - discount;
            }

            return {
                concessionMode: concession_mode || 'none',
                concessionValue: concession_value ? parseFloat(concession_value) : 0,
                discount,
                discountedValue,
                isoutsourced: test.isoutsourced || 0,
                name,
                id: test_id,
                package_id: test.package_id,
                price,
                testid: test_id,
            };
        });
    };

    const handleSelectedPackagePanels = (panels: TestData[]) => {
        if (panels && Array.isArray(panels)) {
            if (previousRecords && Array.isArray(previousRecords) && previousRecords.length > 0) {
                let uniquePanels = panels.filter(
                    (panel) => !previousRecords.some((record) => record.trackId === panel.testid)
                );
                recalculateTotalBill({ ...billingdata, cart: uniquePanels, isPackageUsed: true });
            } else {
                recalculateTotalBill({ ...billingdata, cart: panels, isPackageUsed: true });
            }
        }
    };

    const handleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setChecked(isChecked);
        updateBilling({ ...billingdata, isPackageUsed: isChecked });
        if (!isChecked) {
            setSelectedPackage(null);
        }
    };

    const handlePackagesSelected = (selectedOption: PackageOption | null) => {
        setSelectedPackage(selectedOption);
        if (selectedOption) loadSelectedPackage(selectedOption.value);
    };

    useEffect(() => {
        let isMounted = true;

        if (checked && isMounted) fetchPackages();

        return () => {
            isMounted = false;
        };
    }, [checked]);

    useEffect(() => {
        if (selectedPackage) loadSelectedPackage(selectedPackage.value);
    }, [selectedPackage]);

    if (!billingSource) return null;

    return (
        <Card>
            <Card.Body>
                <div className="d-flex align-items-center mb-3 bg-secondary-subtle br-5 p-2 ">
                    <h6 className="mb-0 pls-label">Package Selection</h6>
                </div>

                <Form.Check
                    type="switch"
                    id="use-package-checkbox"
                    label="Use A Package"
                    checked={checked}
                    disabled={
                        ![1, 2, 6].includes(billingSource) ||
                        (billingSource === 6 && !clinicianId) ||
                        (billingSource === 2 && !organizationId)
                    }
                    onChange={handleChecked}
                    className="mb-3"
                />

                {checked && (
                    <div className="mt-3">
                        {errorMessage && (
                            <div className="alert alert-danger d-flex align-items-center">
                                <RiErrorWarningLine className="me-2" />
                                <small>{errorMessage}</small>
                            </div>
                        )}
                        
                        {loading ? (
                            <div className="text-center py-3">
                                <Spinner animation="border" size="sm" className="text-primary" />
                                <small className="d-block mt-2 text-muted">Loading packages...</small>
                            </div>
                        ) : (
                            <Select
                                isSearchable
                                options={packages}
                                value={selectedPackage}
                                onChange={handlePackagesSelected}
                                placeholder="Select a package"
                                className="shadow-sm"
                                classNamePrefix="select"
                                isDisabled={loading}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: '#dee2e6',
                                        '&:hover': {
                                            borderColor: '#a3afc4'
                                        }
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isSelected ? '#0d6efd' : base.backgroundColor,
                                        '&:hover': {
                                            backgroundColor: state.isSelected ? '#0d6efd' : '#f8f9fa'
                                        }
                                    })
                                }}
                            />
                        )}
                        
                        {loadingPackageTest && (
                            <div className="text-center mt-3">
                                <Spinner animation="border" size="sm" className="text-primary" />
                                <small className="d-block mt-2 text-muted">Loading package details...</small>
                            </div>
                        )}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}
