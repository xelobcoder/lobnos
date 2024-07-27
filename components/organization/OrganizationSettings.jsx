import { useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { customFetch, handleChangeWithState, handleChangeCheck } from "../Auth/customFetch";
import { organizationsettings } from "../../lib/testdata/organizationSettings";
import Loader from "../accessories/Loader";

export default function OrganizationSetupSettings({ organizationid }) {
    const [organizationSettings, setOrganizationSettings] = useState(organizationsettings);
    const [test, setTest] = useState([]);
    const [testloading, setIsLoadingTest] = useState(false);
    const { haveDifferentPriceList, hasConcessionAppliedAcross, concessionMode, concessionValue } = organizationSettings

    const loadAllTest = async (stateHolder) => {
        try {
            const response = await customFetch("testpanel/list/bulk");
            const test = response?.data;
            stateHolder(test);
        } catch (err) {
            stateHolder([]);
        }
    }


    useEffect(() => {
        if (!hasConcessionAppliedAcross && haveDifferentPriceList) {
            setIsLoadingTest(true);
            loadAllTest(setTest);
            setIsLoadingTest(false);
        }
    }, [haveDifferentPriceList, hasConcessionAppliedAcross])


    const DiffTestPricingCompx = () => {
        return (
            <table className="table">
                <thead className="table-secondary">
                    <tr>
                        <th className="fw-bold text-capitalize">test</th>
                        <th className="fw-bold text-capitalize">price</th>
                        <th className="fw-bold text-capitalize">field</th>
                    </tr>
                </thead>
                <tbody>
                    {test.map((item, index) => {
                        return (
                            <tr>
                                <td>{item.name}</td>
                                <td>{item.price}</td>
                                <td>
                                    <input className="custom-input" type="number" />
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        )
    }

    const PercentageCutAccrossCompx = () => {
        return (
            <div className="form-group grid-reg">
                <label>percentage to be applied across test</label>
                <input
                    className="custom-input"
                    type="number"
                    min={1}
                    max={99}
                    value={concessionValue}
                    onChange={(ev) => { handleChangeWithState(ev, 'concessionValue', setOrganizationSettings, organizationSettings) }} />
            </div>
        )
    }



    const handleSubmitChange = (value) =>  {
        
    }


    return (
        <Card>
            <Card.Body>
                <Form.Group className="d-flex">
                    <Form.Switch style={{ fontSize: '25px' }} onChange={
                        (ev) => { handleChangeWithState(ev, 'useCustomLetterHeadings', setOrganizationSettings, organizationSettings) }} />
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
                    <Button variant="primary" className="mt-3">
                        save settings
                    </Button>
                </div>
            </Card.Body>
        </Card>
    )
}



