import { useEffect, useState } from "react";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import { customFetch } from "../../../components/Auth/customFetch";
import { Container } from "react-bootstrap";
import { registrationFields } from "../../../components/registration/fields/Util";

export default function RegistrationFieldsSettings() {
    const [fields, setFields] = useState(registrationFields);
    const [isErrorLoadingFields, setIsErrorLoadingFields] = useState(false);

    // useEffect(() => {
    //     async function getFieldSettings() {
    //         try {
    //             const fetchedFields = await customFetch("applicationsettings/registration/fields");
    //             setFields(fetchedFields);
    //         } catch (err) {
    //             setIsErrorLoadingFields(true);
    //         }
    //     }
    //     getFieldSettings();
    // }, []);

    const handleFieldChange = (section, field, setting) => {
        setFields(prevFields => ({
            ...prevFields,
            [section]: {
                ...prevFields[section],
                [field]: {
                    ...prevFields[section][field],
                    [setting]: !prevFields[section][field][setting],
                }
            }
        }));
    };

    if (isErrorLoadingFields) return <div className="text-danger">Error Loading saved field settings </div>;

    return (
        <MainSettingsLayoutView>
            <Container>
                <h5>Registration Fields</h5>
                <hr />
                {Object.keys(fields).map(section => (
                    <div key={section}>
                        <h6>{section.replace(/([A-Z])/g, ' $1').toUpperCase()}</h6> {/* Capitalize section names */}
                        <table className="table billing-cart-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '30%' }}>Field</th>
                                    <th style={{ width: '70%' }}>Settings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(fields[section]).map(field => (
                                    <tr key={`${section}-${field}`}>
                                        <td style={{ width: '30%' }}>{field}</td>
                                        <td style={{ width: '70%' }}>
                                            <div>
                                                <input
                                                    type="checkbox"
                                                    checked={fields[section][field].visible}
                                                    onChange={() => handleFieldChange(section, field, 'visible')}
                                                /> Visible
                                            </div>
                                            <div>
                                                <input
                                                    type="checkbox"
                                                    checked={fields[section][field].compulsory}
                                                    onChange={() => handleFieldChange(section, field, 'compulsory')}
                                                /> Compulsory
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <hr />
                    </div>
                ))}
            </Container>
        </MainSettingsLayoutView>
    );
}
