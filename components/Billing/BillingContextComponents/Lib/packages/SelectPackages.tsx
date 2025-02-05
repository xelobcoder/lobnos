import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { customFetch, customPost } from '../../../../Auth/customFetch';

export default function SelectPackages({ billingdata, onSelect }) {
    const [loading, setLoading] = useState(false);
    const [loadingPackageTest, setLoadingPackageTest] = useState(false);
    const [checked, setChecked] = useState(false);
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState<{ label: string, value: number } | null>(null);


    const { clinicianId, organizationId, billingSource } = billingdata;

    const fetchPackages = async () => {
        if (billingSource && [1, 2, 6].includes(billingSource)) {
            try {
                if (billingSource === 6 && !clinicianId) return;
                if (billingSource === 2 && !organizationId) return;
                setLoading(true);

                const requestData = { clinicianId, organizationId, billingSource };
                const response = await customPost('packages/billing/verify/load', 'POST', requestData);
                if (response) {
                    setPackages(response.map(pkg => ({
                        value: pkg.id,
                        label: pkg.package_name
                    })));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const loadSelectedPackage = async (packageid) => {
        try {
            setLoadingPackageTest(true);
            const response = await customFetch(`package-tests/${packageid}`);
            if (response && Array.isArray(response) && response.length > 0) {
                formatTestData(response);
            } else {
                onSelect([])
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoadingPackageTest(false);
        }
    };

    const formatTestData = (tests) => {
        const formattedData = tests.map(test => {
            const { price, concession_mode, concession_value, name, test_id, id, isoutsourced, package_id } = test;
            let discount = 0;
            let discountedValue = price;

            if (concession_mode === "none") {
                discount = 0;
            } else if (concession_mode === "absolute" && concession_value) {
                discount = parseFloat(concession_value);
                discountedValue = price - discount;
            } else if (concession_mode === "percentage" && concession_value) {
                discount = (price * parseFloat(concession_value)) / 100;
                discountedValue = price - discount;
            }

            return {
                concessionMode: concession_mode,
                concessionValue: concession_value ? concession_value : 0,
                discount: discount,
                discountedValue: discountedValue,
                isoutsourced: isoutsourced ? isoutsourced : 0,
                name: name,
                id: test_id,
                package_id,
                price: price,
                testid: test_id
            };
        });
        onSelect(formattedData)
    };

    useEffect(() => {
        if (checked) {
            fetchPackages();
        }
    }, [checked]);

    useEffect(() => {
        if (selectedPackage) {
            loadSelectedPackage(selectedPackage.value);
        }
    }, [selectedPackage]);

    const handlePackagesSelected = (selectedOption) => {
        setSelectedPackage(selectedOption);
    };

    if (!billingSource) return null;

    return (
        <div className="my-2">
            <input
                checked={checked}
                disabled={(billingSource === 6 && !clinicianId) || (billingSource === 2 && !organizationId) || [1, 2, 6].includes(billingdata.billingSource) == false}
                onChange={(ev) => setChecked(ev.target.checked)}
                type="checkbox"
            />
            <span className="mx-1"> Use A Package</span>
            {checked && (
                <div className="mt-2">
                    {loading ? (
                        <Spinner size="sm" />
                    ) : (
                        <Select
                            options={packages}
                            value={selectedPackage}
                            onChange={handlePackagesSelected}
                            placeholder="Select a package"
                        />
                    )}
                    {loadingPackageTest && <Spinner size="sm" />}
                </div>
            )}
        </div>
    );
}
