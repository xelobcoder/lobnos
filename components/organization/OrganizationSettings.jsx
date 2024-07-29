import { useContext, useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { organizationsettings } from "../../lib/testdata/organizationSettings";
import Loader from "../accessories/Loader";
import { customPost, handleChangeCheck, handleChangeWithState, loadAllTest } from "../Auth/customFetch";
import AuthContext from "../Auth/useAuthentification";

export default function OrganizationSetupSettings({ organizationid }) {
    const { auth } = useContext(AuthContext);
    const employeeid = auth?.employeeid;
    const [organizationSettings, setOrganizationSettings] = useState(organizationsettings);
    const [testloading, setIsLoadingTest] = useState(false);
    const { haveDifferentPriceList, hasConcessionAppliedAcross, concessionMode, concessionValue } = organizationSettings

    const loadAllTestBackend = async () => {
        const test = await loadAllTest();
        if (test && Array.isArray(test) && test.length > 0) {
            let refinedTestList = test.map((item, index) => {
                return { ...item, concessionMode: 'percentage', concessionValue: 0 };
            })
            setOrganizationSettings({ ...organizationSettings, testList: refinedTestList });
        }
    }


    useEffect(() => {
        async function monitorChangesUseEffect() {
            if (!hasConcessionAppliedAcross && haveDifferentPriceList) {
                setIsLoadingTest(true);
                await loadAllTestBackend();
                setIsLoadingTest(false);
            }
        }
        monitorChangesUseEffect()
    }, [haveDifferentPriceList, hasConcessionAppliedAcross]);



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
            <table className="table">
                <thead className="table-secondary">
                    <tr>
                        <th className="fw-bold text-capitalize">test</th>
                        <th className="fw-bold text-capitalize">price</th>
                        <th className="fw-bold text-capitalize">calcuation mode</th>
                        <th className="fw-bold text-capitalize">amount</th>
                        <th className="fw-bold text-capitalize">discouted amount</th>
                    </tr>
                </thead>
                <tbody>
                    {organizationSettings.testList.map((item, index) => {
                        return (
                            <tr>
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
            <div className="form-group grid-30-30-30">
                <label>percentage to be applied across test</label>
                <select onChange={(ev) => {
                    setOrganizationSettings({ ...organizationSettings, concessionMode: ev.target.value })
                }} className="custom-select">
                    <option>please select an option here</option>
                    <option value={'absolute'}>absolute</option>
                    <option value={'percentage'}>
                        percentage
                    </option>
                </select>
                <input
                    className="custom-input mx-2"
                    type="number"
                    min={1}
                    max={99}
                    value={concessionValue}
                    onChange={(ev) => { handleChangeWithState(ev, 'concessionValue', setOrganizationSettings, organizationSettings) }} />
            </div>
        )
    }



    const handleSubmitChange = async () => {
        try {
            if (!organizationid || !employeeid) return;
            //    We trying to be lean as much as possible in sending data to and from , so we will filter out all test without that hasnt not be changed;
            let changedTest = [];
            if (organizationSettings.testList.length > 0) {
                changedTest = organizationSettings.testList.filter((item, index) => item.concessionValue && item.concessionMode)
                    .map((a, index) => {
                        const { concessionMode, concessionValue, id, discountedValue } = a
                        return { concessionMode, concessionValue, id, discountedValue };
                    })

            };
            const data = { ...organizationSettings, testList: changedTest, organizationid: parseInt(organizationid), employeeid };
            const response = await customPost('organization/billing/test', 'POST', data);
            console.log(response);
        } catch (err) {
            console.log(err);
        }
    }


    return (
        <Card>
            <Card.Body>
                <Form.Group className="d-flex">
                    <Form.Switch style={{ fontSize: '25px' }}
                        checked={organizationSettings.useCustomLetterHeadings}
                        onChange={
                            (ev) => { handleChangeCheck(ev, 'useCustomLetterHeadings', setOrganizationSettings, organizationSettings) }} />
                    <span className="mx-2 my-2">Use Custom letter Heading in report printing</span>
                </Form.Group>
                <Form.Group className="d-flex">
                    <Form.Switch style={{ fontSize: '25px' }} onChange={(ev) => { handleChangeCheck(ev, 'haveDifferentPriceList', setOrganizationSettings, organizationSettings) }} checked={haveDifferentPriceList} />
                    <span className="mx-2 my-2">Use different test pricing from the general pricing</span>
                </Form.Group>
                <hr />
                <Form.Group className="d-flex">
                    <Form.Switch style={{ fontSize: '25px' }} onChange={(ev) => { handleChangeCheck(ev, 'hasConcessionAppliedAcross', setOrganizationSettings, organizationSettings) }} checked={hasConcessionAppliedAcross} />
                    <span className="mx-2 my-2">Apply a concession on general test</span>
                </Form.Group>
                <hr />

                {
                    !hasConcessionAppliedAcross
                    && haveDifferentPriceList
                    && DiffTestPricingCompx()
                }
                {!hasConcessionAppliedAcross && haveDifferentPriceList && testloading && <Loader />}
                {
                    hasConcessionAppliedAcross
                    && haveDifferentPriceList
                    && PercentageCutAccrossCompx()
                }
                <div>
                    <Button
                        variant="primary"
                        type="button"
                        className="mt-3"
                        onClick={(ev) => { handleSubmitChange() }}
                    >
                        save settings
                    </Button>
                </div>
            </Card.Body>
        </Card>
    )
}



