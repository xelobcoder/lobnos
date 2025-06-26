import { useEffect, useState } from "react";
import { Button, Card, Form, Row } from "react-bootstrap";
import Loader from "../accessories/Loader";
import { customPost, handleChangeCheck, handleChangeWithState, loadAllTest } from "../Auth/customFetch";
import { LoadOrganizationalTest } from "../../lib/billingLib";
import { useApplication } from "../Auth/useApplicationContext";
import {
    RiFileTextLine,
    RiPriceTag3Line,
    RiPercentLine,
    RiSaveLine,
    RiListCheck2,
    RiMoneyDollarCircleLine,
    RiCheckboxLine
} from '@remixicon/react';
import { toast } from "react-toastify";
import { OrganizationPricingSettings, organizationPricingsettingsDefaultData } from "../../lib/testdata/organizationSettings";

export default function OrganizationSetupSettings({ organizationid }) {
    const { user } = useApplication();
    const employeeid = user?.employeeid;
    const [organizationSettings, setOrganizationSettings] = useState<OrganizationPricingSettings>(organizationPricingsettingsDefaultData);
    const [testloading, setIsLoadingTest] = useState(false);
    const [previewSavedTestList, setPreviewSavedTestList] = useState(false);
    const { haveDifferentPriceList, hasConcessionAppliedAcross, concessionValue } = organizationSettings

    const loadAllTestBackend = async () => {
        const test = await loadAllTest();
        if (test && Array.isArray(test) && test.length > 0) {
            let refinedTestList = test.map((item, index) => {
                return { ...item, concessionMode: 'percentage', concessionValue: 0 };
            })
            setOrganizationSettings({ ...organizationSettings, testList: refinedTestList });
        }
    }


    const organizationSettingsInformationSaved = async (organizationid) => {
        if (organizationid) {
            try {
                const data = await LoadOrganizationalTest(organizationid);
                if (!data) {
                    throw new Error("No data received from server");
                }
                
                const requiredFields = ['useCustomLetterHeadings', 'hasConcessionAppliedAcross', 'concessionMode', 'haveDifferentPriceList'];
                const keys = Object.keys(data);
                const missingFields = requiredFields.filter(field => !keys.includes(field));

                if (missingFields.length > 0) {
                    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                } else {
                    setOrganizationSettings(data);
                }
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to load organization settings");
                console.error(err);
            }
        }
    }


    useEffect(() => {
        async function monitorChangesUseEffect() {
            if (!hasConcessionAppliedAcross && haveDifferentPriceList && organizationSettings.testList.length == 0) {
                setIsLoadingTest(true);
                await loadAllTestBackend();
                setIsLoadingTest(false);
            }
        }
        monitorChangesUseEffect()
    }, [haveDifferentPriceList, hasConcessionAppliedAcross]);



    useEffect(() => {
        organizationSettingsInformationSaved(organizationid);
    }, [organizationid])

    console.log(organizationSettings)

    const handleTestConcessionChange = (ev, index, field) => {
        if (typeof index != "number" || organizationSettings.testList.length === 0) return;

        const createClonedArray = { ...organizationSettings }
        let discountedValue = 0;

        createClonedArray.testList[index][field] = ev.target.value;
        if (field === "concessionValue") {
            const { concessionMode, concessionValue, price } = createClonedArray.testList[index];
            if (concessionMode === 'absolute' && concessionValue <= price) {
                discountedValue = price - concessionValue;
            } else if (concessionMode === "percentage") {
                discountedValue = price * (concessionValue / 100);
            } else {
                discountedValue = 0;
            }
            createClonedArray.testList[index]['discountedValue'] = discountedValue;
        }
        setOrganizationSettings(createClonedArray);
    }


    const DiffTestPricingCompx = () => {
        return (
            <table className="table prime-table ttable">
                <thead className="table-secondary">
                    <tr>
                        <th className="fw-bold text-capitalize">test</th>
                        <th className="fw-bold text-capitalize">price</th>
                        <th className="fw-bold text-capitalize">calcuation mode</th>
                        <th className="fw-bold text-capitalize">amount</th>
                        <th className="fw-bold text-capitalize">discounted amount</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(organizationSettings.testList)&& organizationSettings.testList.length>0 && organizationSettings.testList.map((item, index) => {
                        return (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.price}</td>

                                <td>
                                    <select className="custom-select"
                                        value={item.concessionMode}
                                        onChange={(ev) => { handleTestConcessionChange(ev, index, 'concessionMode') }}
                                    >
                                        <option value={'none'}>none</option>
                                        <option value={'absolute'}>absolute</option>
                                        <option value={'percentage'}>
                                            percentage
                                        </option>
                                    </select>
                                </td>
                                <td>
                                    <input

                                        value={item.concessionValue}
                                        onChange={(ev) => { handleTestConcessionChange(ev, index, 'concessionValue') }} className="custom-input" type="number" />
                                </td>
                                <td>{item.discountedValue}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        )
    }

    const PercentageCutAccrossCompx = () => {
        return (
            <Row className="bg-light p-3 rounded">
                <div className="form-group mb-4">
                    <label className="d-block mb-2 fw-medium">
                        <RiMoneyDollarCircleLine className="me-2" size={20} />
                        Concession to be applied across test
                    </label>
                    <div className="d-flex flex-column gap-3">
                        <select
                            value={organizationSettings.concessionMode}
                            onChange={(ev) => {
                                setOrganizationSettings({ ...organizationSettings, concessionMode: ev.target.value  as OrganizationPricingSettings["concessionMode"]})
                            }}
                            className="form-select">
                            <option>Please select an option here</option>
                            <option value={'absolute'}>Absolute</option>
                            <option value={'percentage'}>Percentage</option>
                        </select>
                        <input
                            className="form-control"
                            type="number"
                            min={1}
                            max={99}
                            placeholder="Enter concession value"
                            value={concessionValue}
                            onChange={(ev) => { handleChangeWithState(ev, 'concessionValue', setOrganizationSettings, organizationSettings) }}
                        />
                    </div>
                </div>

            </Row>
        )
    }



    const handleSubmitChange = async () => {
        try {
            if (!organizationid || !employeeid) return;
            let changedTest: {concessionMode: OrganizationPricingSettings["concessionMode"], concessionValue:number, id:number, discountedValue:number |undefined} []=  [];
            if (organizationSettings.testList.length > 0) {
                changedTest = organizationSettings.testList.filter((item, index) => item.concessionValue && item.concessionMode)
                    .map((a, index) => {
                        const { concessionMode, concessionValue, testid, discountedValue } = a
                        return { concessionMode, concessionValue, id: testid, discountedValue };
                    })
            };
            const data = {
                ...organizationSettings,
                testList: changedTest,
                organizationid: parseInt(organizationid),
                employeeid
            };
            const response = await customPost(`organization/billing/test`, 'POST', data);
            const {status} = response;
            if (!response.status ) {
                toast.error(response?.message)
            } else {
                toast.success("Pricing successfully created ")
            }
        } catch (err) {
            console.log(err);
        }
    }


    return (
        <div>
            <Card>
                <Card.Header className="d-flex justify-content-between">
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="previewTestList"
                            checked={previewSavedTestList}
                            onChange={(ev) => { setPreviewSavedTestList(!previewSavedTestList) }}
                        />
                        <label className="form-check-label" htmlFor="previewTestList">
                            <RiListCheck2 className="me-2" size={20} />
                            Preview Test List
                        </label>
                    </div>
                    <div style={{marginTop:'-15px'}}>
                            <Button
                                variant="primary"
                                type="button"
                                size="sm"
                                className="mt-3 d-flex align-items-center"
                                onClick={(ev) => { handleSubmitChange() }}
                            >
                                <RiSaveLine className="me-2" size={20} />
                                save settings
                            </Button>
                        </div>
                </Card.Header>
                <Card.Body className="d-flex justify-content-between ">
                    <div className="col-4 bg-light p-2 br-5 bg-warning-subtle  text-sm">
                        <Form.Group className="d-flex">
                            <Form.Switch style={{ fontSize: '25px' }}
                                checked={organizationSettings.useCustomLetterHeadings}
                                onChange={
                                    (ev) => { handleChangeCheck(ev, 'useCustomLetterHeadings', setOrganizationSettings, organizationSettings) }} />
                            <RiFileTextLine className="mx-2 my-2" size={24} />
                            <span className="mx-2 my-2">Use Custom letter Heading in report printing</span>
                        </Form.Group>
                        <Form.Group className="d-flex">
                            <Form.Switch style={{ fontSize: '25px' }} onChange={(ev) => { handleChangeCheck(ev, 'haveDifferentPriceList', setOrganizationSettings, organizationSettings) }} checked={haveDifferentPriceList} />
                            <RiPriceTag3Line className="mx-2 my-2" size={24} />
                            <span className="mx-2 my-2">Use different test pricing from the general pricing</span>
                        </Form.Group>
                        <hr />
                        <Form.Group className="d-flex">
                            <Form.Switch style={{ fontSize: '25px' }} onChange={(ev) => { handleChangeCheck(ev, 'hasConcessionAppliedAcross', setOrganizationSettings, organizationSettings) }} checked={hasConcessionAppliedAcross} />
                            <RiPercentLine className="mx-2 my-2" size={24} />
                            <span className="mx-2 my-2">Apply a concession on general test</span>
                        </Form.Group>
                    </div>

                    <div className="col-7 mx-2">
                        {
                            !hasConcessionAppliedAcross
                            && haveDifferentPriceList
                            && DiffTestPricingCompx()
                        }

                        {!hasConcessionAppliedAcross
                            && haveDifferentPriceList
                            && testloading
                            && <Loader />}
                        {
                            hasConcessionAppliedAcross
                            && haveDifferentPriceList
                            && PercentageCutAccrossCompx()
                        }
                        
                    </div>
                </Card.Body>
                <Card.Body>
                </Card.Body>
            </Card>
            <div className="mt-3">
                {previewSavedTestList && DiffTestPricingCompx()}
            </div>
        </div>
    )
}



