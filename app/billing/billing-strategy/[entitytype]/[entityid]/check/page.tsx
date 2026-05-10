"use client";

import { currencyFormatter, customFetch, customPost, reactSelectCustomStyles } from "../../../../../../components/Auth/customFetch";
import { redirect, useRouter, useParams } from "next/navigation";
import Select from 'react-select';
import { useState, useEffect, useMemo } from 'react';
import { Spinner, Card, Button, Alert, Table, Badge } from 'react-bootstrap';
import styles from '../../../../../../styles/SmsTemplateList.module.css'
import {
    RiPhoneLine,
    RiMailLine,
    RiMapPinLine,
    RiChat1Line,
    RiPriceTag3Line,
    RiCalendarEventLine,
    RiArrowRightLine,
    RiInformationLine,
    RiAlertFill
} from "@remixicon/react";
import { toast } from "react-toastify";

interface Strategy {
    strategyid: number;
    name: string;
    description: string;
    concessionMode: "percentage" | "absolute";
    concessionValue: string;
    price_type: "surcharge" | "discount";
    valid_from: string;
    valid_until: string;
    is_expired: number;
    applicableTest: Array<{
        testid: number;
        concessionValue: string;
        discountedValue: string;
        concessionMode: "percentage" | "absolute";
        pricingType: "surcharge" | "discount";
        actualPrice: number;
        name: string;
        originalPrice: number;
    }>;
}

interface EntityInformation {
    id: number;
    name: string;
    location: string;
    address: string;
    phone: string;
    email: string | null;
}


// --- Helper Functions & Components (with corrected icon tags) ---

const formatConcession = (strategy: Strategy) => {
    const value = strategy.concessionMode === 'percentage' ? `${strategy.concessionValue}%` : `${currencyFormatter.format(parseFloat(strategy.concessionValue.toString()))}`;
    const type = strategy.price_type.charAt(0).toUpperCase() + strategy.price_type.slice(1);
    const badgeColor = strategy.price_type === 'discount' ? 'success' : 'warning';
    return <Badge bg={badgeColor} pill>{`${value} ${type}`}</Badge>;
};

const EntityInfoCard = ({ entityInfo }: { entityInfo: EntityInformation }) => (
    <div >
        <div>
            <div>{entityInfo.name}</div>
            <div className="d-flex flex-column gap-2 mt-3 text-muted">
                <p className="mb-0 d-flex align-items-center"><RiPhoneLine size={20} className="me-3 flex-shrink-0" /> {entityInfo.phone}</p>
                {entityInfo.email && <p className="mb-0 d-flex align-items-center"><RiMailLine size={20} className="me-3 flex-shrink-0" /> {entityInfo.email}</p>}
                <p className="mb-0 d-flex align-items-center"><RiMapPinLine size={20} className="me-3 flex-shrink-0" /> {entityInfo.address}</p>
            </div>
        </div>
    </div>
);

const StrategyPreview = ({ strategy }: { strategy: Strategy | null }) => {
    if (!strategy) {
        return (
            <div className="text-center bg-body-tertiary border-dashed">
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '200px' }}>
                    <p className="text-muted mb-0">Select a strategy above to see a preview of its effects.</p>
                </div>
            </div>
        );
    }

    return (
        <div >
            <div className="py-3 px-3 border br-5 ">
                <div className="d-flex flex-column gap-3 mb-4 border p-2 br-5 bg-body-tertiary">
                    <h4 className="bg-secondary-subtle text-center br-5 p-2"> {strategy.name}</h4>
                    <div className="d-flex"><RiChat1Line size={20} className="me-3 mt-1 flex-shrink-0 text-primary" /><div><strong>Description:</strong><p className="mb-0 text-muted">{strategy.description}</p></div></div>
                    <hr className="p-0" />
                    <div className="d-flex align-items-center"><RiPriceTag3Line size={20} className="me-3 flex-shrink-0 text-primary" /><strong>Concession:</strong><span className="ms-2">{formatConcession(strategy)}</span></div>
                    <hr className="p-0" />
                    <div className="d-flex align-items-center"><RiCalendarEventLine size={20} className="me-3 flex-shrink-0 text-primary" /><strong>Validity:</strong><span className="ms-2">{new Date(strategy.valid_from).toLocaleDateString()} to {new Date(strategy.valid_until).toLocaleDateString()}</span></div>
                </div>

                <h6>Affected Tests & Pricing</h6>
                <div className="table-responsive">
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Test Name</th>
                                <th>Original Price</th>
                                <th>New Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {strategy.applicableTest.map(test => (
                                <tr key={test.testid}>
                                    <td>{test.name}</td>
                                    <td>{currencyFormatter.format(test.originalPrice)}</td>
                                    <td>
                                        <strong>{currencyFormatter.format(parseFloat(test.discountedValue.toString()))}</strong>
                                        <Badge bg={test.pricingType === 'discount' ? 'success-subtle' : 'danger-subtle'} text={test.pricingType === 'discount' ? 'success' : 'danger'} className="ms-2">
                                            {test.concessionValue}{test.concessionMode === 'percentage' ? '%' : ''}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
export default function CheckEntityStrategyPage() {
    const params = useParams() ?? {};
    const entitytype = params.entitytype;
    const entityid = params.entityid;
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [entityInfo, setEntityInfo] = useState<EntityInformation | null>(null);
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasStrategy, setHasStrategy] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {

                if (!entitytype || !entityid) throw new Error("Entity type or ID is missing from the URL.");
                const checkResponse = await customFetch(`billing/strategies/${entitytype}/${entityid}/has-strategy`);
                if (checkResponse && !checkResponse.hasStrategy) setHasStrategy(false);

                if (checkResponse && checkResponse.hasStrategy && checkResponse.strategyId) router.push(`/billing/billing-strategy/details/${checkResponse.strategyId}`);
                const allStrategiesResponse = await customFetch(`billing/strategies/all?entitytype=${entitytype}&entityid=${entityid}`);

                if (allStrategiesResponse && Array.isArray(allStrategiesResponse.strategies)) setStrategies(allStrategiesResponse.strategies);
                if (allStrategiesResponse && allStrategiesResponse.entityInformation && Array.isArray(allStrategiesResponse.entityInformation)) {
                    setEntityInfo(allStrategiesResponse.entityInformation[0]);
                }

            } catch (err: any) {
                console.error(err);
                setError(err.message || "Failed to fetch data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [params]);

    const strategyOptions = useMemo(() => strategies.map(strategy => ({
        value: strategy.strategyid,
        label: strategy.name,
        data: strategy
    })), [strategies]);

    const formatOptionLabel = ({ label, data }: { label: string, data: Strategy }) => (
        <div className="d-flex justify-content-between align-items-center">
            <span>{label}</span>
            {formatConcession(data)}
        </div>
    );

    const handleApplyStrategy = async () => {

        try {
            if (!selectedStrategy) return;
            setIsApplying(true);
            const main_enpoint = `billing/strategies/apply/strategy/entity/:strategyid`;
            const endpoint = main_enpoint.replace(':strategyid', selectedStrategy.strategyid.toString());
            const queryParams = {
                category: params.entitytype || '',
                associatedid: params.entityid || ''
            }
            const fullEndpoint = `${endpoint}`;
            setError(null);
            const response: { result: boolean, message: string } = await customPost(fullEndpoint, 'POST', queryParams);
            const { result, message } = response;
            console.log('Apply Strategy Response:', response);
            if (result) {
                toast.success(message || "Strategy applied successfully!. You will be redirected to the strategy details page.");
                router.push(`/billing/billing-strategy/details/${selectedStrategy.strategyid}`);
            } else {
                toast.error(message || "Failed to apply strategy. Please try again.");
                return;
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsApplying(false);
        }
    };

    // --- Render Logic ---

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <Spinner animation="border" role="status" variant="primary"><span className="visually-hidden">Loading...</span></Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <div className="col-8 text-sm text-uppercase">
                <Alert variant="danger">
                    <RiAlertFill />    {error}
                </Alert>
            </div>
        );
    }


    // if (!hasStrategy) return <div className="alert alert-danger p-3">No Billing Pricing Found </div>



    return (
        <div className="">
            <div className="row justify-content-center">
                <h5 className="mb-2 alert alert-info text-sm ">Apply New Billing Strategy for {params.entitytype} : {entityInfo?.name}</h5>
                <div className=" d-lg-flex">
                    <div className="col-lg-4">
                        {Array.isArray(strategies) && strategies.length > 0
                            &&
                            <div className="mb-4 ">
                                <div>Step 1: Select a Billing Module</div>
                                <div>
                                    <Select
                                        options={strategyOptions}
                                        onChange={(option) => setSelectedStrategy(option?.data || null)}
                                        placeholder="Choose a strategy..."
                                        isSearchable
                                        formatOptionLabel={formatOptionLabel}
                                        isOptionDisabled={(option) => option.data.is_expired === 1}
                                        styles={reactSelectCustomStyles}

                                    />
                                </div>
                            </div>
                        }
                    </div>

                    <div className="col-lg-8 mx-lg-2">
                        {strategies.length > 0 ? (
                            <>
                                <StrategyPreview strategy={selectedStrategy} />
                                <div className="d-grid mt-3">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={(ev) => { handleApplyStrategy() }}
                                        disabled={!selectedStrategy || isApplying}
                                    >
                                        {isApplying ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                <span className="ms-2"></span>
                                            </>
                                        ) : (
                                            <>
                                                Apply Selected Strategy <RiArrowRightLine className="ms-1" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <Alert variant="info" className="d-flex align-items-center p-3 ">
                                <RiInformationLine size={24} className="me-3 flex-shrink-0" />
                                <div>No new strategies are currently available for this entity.</div>
                            </Alert>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}