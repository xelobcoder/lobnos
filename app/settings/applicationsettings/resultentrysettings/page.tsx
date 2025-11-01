"use client"
import { useState, useEffect } from 'react';
import { Form, Button, Tab, Nav } from 'react-bootstrap';
import { customFetch, customPost, getResultEntrySettings, ResultEntrydefaultData } from '../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import {
    RiLockLine, RiPinDistanceLine, RiHistoryLine, RiFileListLine,
    RiTimeLine, RiLockPasswordLine, RiMailLine, RiAlertLine,
    RiNotification3Line, RiUserAddLine, RiDeleteBin6Line, RiSave3Line,
    RiSettingsLine, RiShieldCheckLine
} from '@remixicon/react';


interface ScientistType {
    employeeid: number;
    username: string;
    role: string;
    email: string;
    branch: number;
    branchname: string;
    emailAuthenticated: boolean;
    activation: number;
}

interface ResultEntrySettings {
    resultLockAfter24Hours: number;
    isPinOnResultEntry: number;
    isPinOnResultViewAfter24Hours: number;
    maximumResultValidation: number;
    minimumResultValidation: number;
    showPastTestResult: number;
    allowScientistViewAudit: number;
    showTaTAnalysis: number;
    encryptResultAfter24Hours: number;
    sendLoginEmailNotificationAfterResultEdit: number;
    monitorForCriticalValues: number;
    notifyClientOnResultReady: number;
    notificationType: string;
    staffQualifiedToValidationResult?: number[];
}

const ResultSettingsForm = () => {
    const { user, tenantId } = useApplicationSettings().applicationsettings;
    const employeeid = user.employeeid;
    const [formData, setFormData] = useState<ResultEntrySettings>(ResultEntrydefaultData);
    const [scientists, setUsers] = useState<ScientistType[]>([]);
    const [selectedScientists, setSelectedScientists] = useState<ScientistType[]>([]);
    const [currentSelection, setCurrentSelection] = useState<number | null>(null);
    const [loadingUsers, setLoadingUsers] = useState<boolean>(true);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : Number(value),
        }));
    };

    const addStaffIDField = () => {
        if (!currentSelection) {
            toast.error("Please select a scientist first.");
            return;
        }

        if (selectedScientists.some(s => s.employeeid === currentSelection)) {
            toast.error("This scientist is already selected.");
            return;
        }

        if (selectedScientists.length >= formData.maximumResultValidation) {
            toast.error(`Cannot add more than ${formData.maximumResultValidation} scientists.`);
            return;
        }

        const scientistToAdd = scientists.find(s => s.employeeid === currentSelection);
        if (scientistToAdd) {
            setSelectedScientists(prev => [...prev, scientistToAdd]);
            setCurrentSelection(null);
        }
    };

    const removeStaffIDField = (index: number) => {
        setSelectedScientists(prev => prev.filter((_, i) => i !== index));
    };

    const getInitData = async () => {
        try {
            setLoadingUsers(true);
            // Load scientists list
            const { result } = await customFetch("logins") as { result: ScientistType[] };
            setUsers(result);

            // Load result entry settings from both sources
            const [settingsResponse, legacySettings] = await Promise.all([
                customFetch(`applicationsetting/resultsettings/resultentrysettings?tenantId=${tenantId}&employeeid=${user.employeeid}`),
                getResultEntrySettings(employeeid)
            ]);

            // Prioritize the new endpoint data, fall back to legacy if needed
            const settings = settingsResponse?.result ||
                (typeof legacySettings === "object" ? legacySettings : ResultEntrydefaultData);

            const { staffQualifiedToValidationResult } = settings;
            setFormData(settings);

            if (staffQualifiedToValidationResult?.length) {
                const QualifiedRefined = staffQualifiedToValidationResult
                    .map(item => result.find(s => s.employeeid === item))
                    .filter((s): s is ScientistType => s !== undefined);

                setSelectedScientists(QualifiedRefined);
            }

            setLoadingUsers(false);
        } catch (err) {
            console.error("Error loading data:", err);
            setSelectedScientists([]);
            setUsers([]);
            setLoadingUsers(false);
            // Fall back to default data
            setFormData(ResultEntrydefaultData);
            toast.error("Failed to load settings");
        }
    };

    useEffect(() => {
        getInitData();
    }, [user.employeeid, tenantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedScientists.length < formData.minimumResultValidation) {
            toast.error(`Minimum ${formData.minimumResultValidation} scientists required.`);
            return;
        }

        try {
            const response = await customPost(
                `applicationsetting/resultsettings/resultentrysettings?tenantId=${tenantId}&employeeid=${user.employeeid}`,
                'PUT',
                {
                    ...formData,
                    staffQualifiedToValidationResult: selectedScientists.map(s => s.employeeid)
                }
            );
            response.status
                ? toast.success("Settings updated successfully")
                : toast.error("Update failed");
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    if (loadingUsers) {
        return <div className="text-center py-5">Loading settings...</div>;
    }

    return (
        <div className="border bg-white border-secondary-subtle mx-2 p-2">
            <div className="mx-2 d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-capitalize pls-label bg-secondary-subtle p-3 pls-color br-5 mb-0">Result Entry Settings</h5>
                <Button
                    variant="primary"
                    size='sm'
                    onClick={handleSubmit}
                    className="d-flex align-items-center gap-2 px-4 py-2 hover-effect transition-all"
                    disabled={loadingUsers}
                >
                    <RiSave3Line className="fs-5" />
                    <span className="d-none d-sm-inline">{loadingUsers ? "Saving..." : "Save Settings"}</span>
                </Button>
            </div>

            <Tab.Container defaultActiveKey="general">
                <Nav variant="tabs" className="border-bottom-0 px-3">
                    <Nav.Item>
                        <Nav.Link eventKey="general" className="d-flex align-items-center">
                            <RiSettingsLine size={16} className="me-2" />
                            General Settings
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="validation" className="d-flex align-items-center">
                            <RiShieldCheckLine size={16} className="me-2" />
                            Validation Rules
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content className="p-3">
                    <Tab.Pane eventKey="general">
                        <div className="row g-3">
                            {[
                                { id: 'resultLockAfter24Hours', label: 'Lock Result After 24 Hours', icon: <RiLockLine /> },
                                { id: 'isPinOnResultEntry', label: 'PIN Required on Result Entry', icon: <RiPinDistanceLine /> },
                                { id: 'isPinOnResultViewAfter24Hours', label: 'PIN Required on Result View After 24 Hours', icon: <RiPinDistanceLine /> },
                                { id: 'showPastTestResult', label: 'Show Past Test Results', icon: <RiHistoryLine /> },
                                { id: 'allowScientistViewAudit', label: 'Allow Scientist View Audit', icon: <RiFileListLine /> },
                                { id: 'showTaTAnalysis', label: 'Show TaT Analysis', icon: <RiTimeLine /> },
                                { id: 'encryptResultAfter24Hours', label: 'Encrypt Result After 24 Hours', icon: <RiLockPasswordLine /> },
                                { id: 'sendLoginEmailNotificationAfterResultEdit', label: 'Send Login Email Notification After Result Edit', icon: <RiMailLine /> },
                                { id: 'monitorForCriticalValues', label: 'Monitor for Critical Values', icon: <RiAlertLine /> },
                                { id: 'notifyClientOnResultReady', label: 'Notify Client on Result Ready', icon: <RiNotification3Line /> }
                            ].map(({ id, label, icon }) => (
                                <div key={id} className="col-md-6">
                                    <div className="border rounded p-3 h-100 d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="text-primary">{icon}</span>
                                            <span className="fs-7">{label}</span>
                                        </div>
                                        <Form.Check
                                            type="switch"
                                            id={`${id}Switch`}
                                            name={id}
                                            checked={formData[id] === 1}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Tab.Pane>

                    <Tab.Pane eventKey="validation">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Maximum Validators</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="maximumResultValidation"
                                        value={formData.maximumResultValidation}
                                        onChange={handleChange}
                                        min="1"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Minimum Validators</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="minimumResultValidation"
                                        value={formData.minimumResultValidation}
                                        onChange={handleChange}
                                        min="1"
                                    />
                                </Form.Group>

                                <div className="d-flex gap-2">
                                    <Form.Select
                                        value={currentSelection ?? ""}
                                        onChange={(e) => setCurrentSelection(Number(e.target.value))}
                                        disabled={!formData.maximumResultValidation || !formData.minimumResultValidation}
                                    >
                                        <option value="">Select Scientist</option>
                                        {scientists.map((item) => (
                                            <option key={item.employeeid} value={item.employeeid}>
                                                {item.username}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Button variant="outline-primary" onClick={addStaffIDField} disabled={!currentSelection}>
                                        <RiUserAddLine />
                                    </Button>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="border rounded">
                                    <div className="p-3 border-bottom bg-light">
                                        <h6 className="mb-0 fw-semibold">Selected Scientists</h6>
                                    </div>
                                    <div className="p-3">
                                        {selectedScientists.length === 0 ? (
                                            <div className="text-center text-muted py-4">No scientists selected</div>
                                        ) : (
                                            <div className="d-flex flex-column gap-2">
                                                {selectedScientists.map((scientist, index) => (
                                                    <div key={index} className="d-flex justify-content-between align-items-center p-2 border rounded">
                                                        <span>{scientist.username}</span>
                                                        <Button variant="link" className="text-danger p-0" onClick={() => removeStaffIDField(index)}>
                                                            <RiDeleteBin6Line />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </div>
    );
};

export default ResultSettingsForm;