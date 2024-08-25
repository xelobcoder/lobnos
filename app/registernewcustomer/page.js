"use client"
import { useEffect, useState } from "react";
import { patientRegistrationDefaultData } from "../../components/Auth/registerclient";
import PersonalInfomationRegistration from "../../components/registration/PersonalInfomationRegistration";
import { getRegistrationFields } from "../../components/registration/fields/Util";
import { toast } from 'react-toastify';
import { Search } from "@mui/icons-material";
import { Col, Row } from 'react-bootstrap';
import { useRouter } from "next/navigation";
import Addressing from "../../components/registration/Addressing";
import EmmergencyContactInformation from "../../components/registration/EmmergencyContactInformation";


export default function RegistrationForm() {
    const { personalInformation, addressingInformation, emmergencyInformation } = patientRegistrationDefaultData;
    const [fields, setFields] = useState(patientRegistrationDefaultData);
    const [isloading, setLoading] = useState(true);
    const router = useRouter();


    const getFields = async () => {
        try {
            setLoading(true);
            await getRegistrationFields(setFields);
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    }

    useEffect(() => {
        getFields();
    }, [])




    return (
        <div>
            {/* Patient search here */}
            <div className="mx-2 p-2">
                <Row>
                    <Col>
                        <input className="custom-input col-2" placeholder="search patient here please" />
                    </Col>
                    <Col>
                        <button className="mx-2 btn btn-light">
                            <Search />
                        </button>
                    </Col>
                </Row>
            </div>
            <div className="col-12">
                <div>
                    <div className="border-sledge bg-primary text-white fw-bold text-capitalize p-2 mb-2 col-3 mt-1 pls-label">Personal Information</div>
                    <fieldset className="  heightedBorder  p-3">
                        <PersonalInfomationRegistration
                            fields={fields.length > 0 ? fields[0]['fields'] : {}}
                            toast={toast}
                            defaultData={personalInformation} />
                    </fieldset>
                </div>
                <div>
                    <div className="bg-primary text-white fw-bold text-capitalize p-2 mb-2 col-3    mt-1 pls-label">Address Information</div>
                    <fieldset className=" heightedBorder p-3">
                        {/* <legend>Address Information</legend> */}
                        <Addressing
                            fields={fields.length > 0 ? fields[0]['fields'] : {}}
                            toast={toast}
                            defaultData={addressingInformation} />
                    </fieldset>
                </div>
                <div>
                    <div className="bg-primary text-white fw-bold text-capitalize p-2 mb-2 col-3 mt-1 pls-label">Emmergency Contact Information</div>
                    <fieldset className="heightedBorder   p-3">
                        {/* <legend>Emmergency Information</legend> */}
                        <EmmergencyContactInformation
                            fields={fields.length > 0 ? fields[0]['fields'] : {}}
                            toast={toast}
                            defaultData={emmergencyInformation} />
                    </fieldset>
                </div>
            </div>
        </div>
    );
}

