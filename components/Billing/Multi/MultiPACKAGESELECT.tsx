import React, { useState, useEffect, useContext } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { RiErrorWarningLine } from '@remixicon/react';
import Select from 'react-select';
import { customPost, reactSelectCustomStyles } from '../../Auth/customFetch';
import { MultiBillingContext } from './MultiBillingContext';

interface PackageOption {
    label: string;
    value: number;
}


export default function MultiPACKAGESELECT() {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata, setBillingData } = context;

    const [loading, setLoading] = useState(false);
    const [loadingPackageTest, setLoadingPackageTest] = useState(false);
    const [packages, setPackages] = useState<PackageOption[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const { entityId, entitytype, isPackageUsed } = billingdata;


    const fetchPackages = async () => {
        try {
            if ((billingdata.billingSource && billingdata.billingSource > 1 && !entityId)) return;
            setLoading(true);
            setErrorMessage('');
            const requestData = { entityId, entitytype, categorytrackid: billingdata.billingSource };
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
    };




    const handlePackagesSelected = async (selectedOption: PackageOption | null) => {
        setSelectedPackage(selectedOption);
        setErrorMessage('');
        setBillingData({
            ...billingdata,
            packageid: selectedOption ? selectedOption.value : undefined,
            isPackageUsed: !!selectedOption,
        });
        // if (selectedOption) {
        //     try {
        //         // Fetch package details from backend and update billingdata with backend-calculated fields
        //         const response = await customPost('packages/billing/verify/details', 'POST', {
        //             packageid: selectedOption.value,
        //             entityId,
        //             entitytype,
        //             categorytrackid: billingdata.billingSource,
        //         });
        //         if (response && response.billingData) {
        //             // Update billingdata with backend-calculated billing fields (amountPayable, subtotal, payments, etc.)
        //             setBillingData((prev: any) => ({
        //                 ...prev,
        //                 ...response.billingData,
        //                 packageid: selectedOption.value,
        //                 isPackageUsed: true,
        //             }));
        //         }
        //     } catch (err) {
        //         setErrorMessage('Failed to load package details.');
        //     } finally {
        //         setLoadingPackageTest(false);
        //     }
        // } else {
        //     setLoadingPackageTest(false);
        // }
    };



    return (
        <Card>
            <Card.Body>
                <div className="d-flex align-items-center mb-3 bg-secondary-subtle br-5 p-2 ">
                    <h6 className="mb-0 pls-label">Package Selection</h6>
                    <button
                        className="btn btn-sm btn-outline-primary ms-auto"
                        type="button"
                        onClick={fetchPackages}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Load Packages'}
                    </button>
                </div>
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
                            styles={reactSelectCustomStyles}
                        />
                    )}
                    {loadingPackageTest && (
                        <div className="text-center mt-3">
                            <Spinner animation="border" size="sm" className="text-primary" />
                            <small className="d-block mt-2 text-muted">Loading package details...</small>
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}
