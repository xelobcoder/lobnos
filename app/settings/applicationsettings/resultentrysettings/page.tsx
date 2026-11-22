"use client"
import ui from "../../../../components/settings/SettingsWorkspace.module.css";
import { useState, useEffect, useRef } from 'react';
import { Form, Button, Tab, Nav } from 'react-bootstrap';
import { customFetch, customPost, getResultEntrySettings, ResultEntrydefaultData } from '../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import {
    RiUserAddLine, RiDeleteBin6Line, RiSave3Line, RiShieldCheckLine
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
    requireExplicitResultRelease?:boolean;
    electronicConsentMode?:'off'|'optional'|'required';
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
    requireDifferentValidatorFromResultAuthor: boolean;
    requireManagerApprovalBeforeRelease: boolean;
    resultReleasePolicy?: 'selected_staff' | 'managers_only';
    staffQualifiedToReleaseResult?: number[];
    allowResultAuthorToRelease: boolean;
    requireDifferentReleaserFromValidator?: boolean;
}

const ResultSettingsForm = () => {
    const { user, tenantId } = useApplicationSettings().applicationsettings;
    const employeeid = user.employeeid;
    const [formData, setFormData] = useState<ResultEntrySettings>(ResultEntrydefaultData);
    const [scientists, setUsers] = useState<ScientistType[]>([]);
    const [selectedScientists, setSelectedScientists] = useState<ScientistType[]>([]);
    const [currentSelection, setCurrentSelection] = useState<number | null>(null);
    const [selectedReleaseStaff, setSelectedReleaseStaff] = useState<ScientistType[]>([]);
    const [currentReleaseSelection, setCurrentReleaseSelection] = useState<number | null>(null);
    const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
    const [saving, setSaving] = useState(false);
    const saveLock = useRef(false);
    const [loadError, setLoadError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [notice, setNotice] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: Number(value),
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

    const addReleaseStaff = () => {
        if (!currentReleaseSelection) {
            toast.error("Please select a release staff member first.");
            return;
        }
        if (selectedReleaseStaff.some(staff => staff.employeeid === currentReleaseSelection)) {
            toast.error("This staff member is already selected for release.");
            return;
        }
        const staffMember = scientists.find(staff => staff.employeeid === currentReleaseSelection);
        if (staffMember) {
            setSelectedReleaseStaff(previous => [...previous, staffMember]);
            setCurrentReleaseSelection(null);
        }
    };

    const getInitData = async () => {
        try {
            setLoadingUsers(true); setLoadError("");
            // Load scientists list
            const { result } = await customFetch("logins") as { result: ScientistType[] };
            if(!Array.isArray(result))throw new Error("Staff list unavailable");
            const normalizedUsers=result.map(person=>({...person,employeeid:Number(person.employeeid)}));
            setUsers(normalizedUsers);

            // Load result entry settings from both sources
            const [settingsResponse, legacySettings] = await Promise.all([
                customFetch(`applicationsetting/resultsettings/resultentrysettings?tenantId=${tenantId}&employeeid=${user.employeeid}`),
                getResultEntrySettings(employeeid)
            ]);

            // Prioritize the new endpoint data, fall back to legacy if needed
            const loaded = settingsResponse?.result ||
                (typeof legacySettings === "object" ? legacySettings : ResultEntrydefaultData);

            if(!loaded || typeof loaded!=="object" || loaded.status===false || loaded.status==="error")throw new Error("Settings unavailable");
            const settings={...ResultEntrydefaultData,...loaded,maximumResultValidation:Number(loaded.maximumResultValidation??ResultEntrydefaultData.maximumResultValidation),minimumResultValidation:Number(loaded.minimumResultValidation??ResultEntrydefaultData.minimumResultValidation)};
            const { staffQualifiedToValidationResult } = settings;
            setSelectedScientists([]);
            setSelectedReleaseStaff([]);
            setFormData(settings);

            if (staffQualifiedToValidationResult?.length) {
                const QualifiedRefined = staffQualifiedToValidationResult
                    .map((item: string | number) => normalizedUsers.find(s => s.employeeid === Number(item)))
                    .filter((s: ScientistType | undefined): s is ScientistType => s !== undefined);

                setSelectedScientists(QualifiedRefined);
            }
            if (Array.isArray(settings.staffQualifiedToReleaseResult) && settings.staffQualifiedToReleaseResult.length) {
                setSelectedReleaseStaff(settings.staffQualifiedToReleaseResult
                    .map((item: string | number) => normalizedUsers.find(s => s.employeeid === Number(item)))
                    .filter((s: ScientistType | undefined): s is ScientistType => s !== undefined));
            }

            setLoadingUsers(false);
        } catch (err) {
            setSelectedScientists([]);
            setUsers([]);
            setLoadingUsers(false);
            // Fall back to default data
            setFormData(ResultEntrydefaultData);
            setLoadError("Settings could not be loaded. Retry before making changes.");
        }
    };

    useEffect(() => {
        getInitData();
    }, [user.employeeid, tenantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(saveLock.current) return;
        setSaveError(""); setNotice("");
        if (!Number.isInteger(formData.minimumResultValidation) || !Number.isInteger(formData.maximumResultValidation) || formData.minimumResultValidation < 1 || formData.maximumResultValidation < formData.minimumResultValidation || selectedScientists.length > formData.maximumResultValidation) {setSaveError("Use whole-number limits of at least 1. Minimum cannot exceed maximum, and selected scientists cannot exceed the maximum."); return;}
        if (selectedScientists.length < formData.minimumResultValidation) {
            setSaveError(`Minimum ${formData.minimumResultValidation} scientists required.`);
            return;
        }

        try {
            saveLock.current = true; setSaving(true);
            const response = await customPost(
                `applicationsetting/resultsettings/resultentrysettings?tenantId=${tenantId}&employeeid=${user.employeeid}`,
                'PUT',
                {
                    ...formData,
                    staffQualifiedToValidationResult: selectedScientists.map(s => s.employeeid),
                    staffQualifiedToReleaseResult: selectedReleaseStaff.map(s => s.employeeid),
                }
            );
            if(response.status === true || response.status === "success") setNotice("Result entry settings saved."); else setSaveError(response.message || "Update failed. Your changes have been kept.");
        } catch (err) {
            setSaveError("Settings were not saved. Your changes have been kept.");
        } finally {saveLock.current=false;setSaving(false);
        }
    };

    if (loadingUsers) {
        return <div className="text-center py-5" role="status">Loading settings...</div>;
    }

    if(loadError)return <div role="alert" className="alert alert-danger">{loadError}<button type="button" className="btn btn-outline-secondary ms-3" onClick={getInitData}>Retry settings</button></div>;
    return (
        <div className={ui.workspace}>
            <div className="mx-2 d-flex justify-content-between align-items-center mb-3">
                <div><span className={ui.eyebrow}>APPLICATION SETTINGS</span><h1>Result entry settings</h1><p className={ui.description}>Configure validation, managerial approval and who may sign and release results.</p></div>
                <Button
                    variant="primary"
                    size='sm'
                    onClick={handleSubmit}
                    className="d-flex align-items-center gap-2 px-4 py-2 hover-effect transition-all"
                    disabled={loadingUsers||saving}
                >
                    <RiSave3Line className="fs-5" />
                    <span className="d-inline">{saving ? "Saving..." : "Save settings"}</span>
                </Button>
            </div>

            {saveError&&<div role="alert" className="alert alert-danger">{saveError}</div>}{notice&&<div role="status" className="alert alert-success">{notice}</div>}
            <fieldset disabled={saving}><Tab.Container defaultActiveKey="validation">
                <Nav variant="tabs" className="border-bottom-0 px-3">
                    <Nav.Item>
                        <Nav.Link eventKey="validation" className="d-flex align-items-center">
                            <RiShieldCheckLine size={16} className="me-2" />
                            Validation Rules
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content className="p-3">
                    <Tab.Pane eventKey="validation">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <Form.Group controlId="maximumResultValidation" className="mb-3">
                                    <Form.Label className="fw-medium">Maximum Validators</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="maximumResultValidation"
                                        value={formData.maximumResultValidation}
                                        onChange={handleChange}
                                        min="1"
                                    />
                                </Form.Group>

                                <Form.Group controlId="minimumResultValidation" className="mb-3">
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
                                    <Form.Select aria-label="Choose scientist"
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
                                    <Button aria-label="Add scientist" variant="outline-primary" onClick={addStaffIDField} disabled={!currentSelection}>
                                        <RiUserAddLine className="me-1"/>Add scientist
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
                                                        <Button aria-label={`Remove ${scientist.username}`} variant="link" className="text-danger p-0" onClick={() => removeStaffIDField(index)}>
                                                            <RiDeleteBin6Line className="me-1"/>Remove
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="my-4" />
                        <section aria-labelledby="release-settings-title">
                            <h2 id="release-settings-title" className="h5">Result authorization and release</h2>
                            <p className="text-muted">Choose the workflow that suits this facility. Validation, manager approval, Sign &amp; Release and collection consent are independent controls. Existing signature and consent history is retained when a workflow is disabled.</p>
                            <Form.Check type="switch" id="require-explicit-release" label="Require Sign & Release before printing" checked={formData.requireExplicitResultRelease!==false} onChange={event=>setFormData(previous=>({...previous,requireExplicitResultRelease:event.target.checked}))}/>
                            <p className="small text-muted mt-2">When off, validated results can be printed without a separate signing step. Payment restrictions, critical-result holds and any configured manager approval still apply.</p>
                            <Form.Label htmlFor="electronic-consent-mode">Consent at sample collection</Form.Label>
                            <Form.Select id="electronic-consent-mode" className="mb-2" value={formData.electronicConsentMode||'off'} onChange={event=>setFormData(previous=>({...previous,electronicConsentMode:event.target.value as 'off'|'optional'|'required'}))}>
                                <option value="off">Off — no collection consent prompt</option><option value="optional">Optional — one inline confirmation; collection may continue unchecked</option><option value="required">Required — confirm in the collection screen before proceeding</option>
                            </Form.Select><p className="small text-muted mb-4">Patient names are filled automatically. Only a guardian’s name is needed when signing for a child. Published wording and staff confirmation are saved with collection.</p>
                            <div className="d-flex flex-column gap-3 mb-4">
                                <Form.Check
                                    type="switch"
                                    id="require-different-validator"
                                    label="Require a validator different from the result author"
                                    checked={Boolean(formData.requireDifferentValidatorFromResultAuthor)}
                                    onChange={(event) => setFormData(previous => ({ ...previous, requireDifferentValidatorFromResultAuthor: event.target.checked }))}
                                />
                                <Form.Check
                                    type="switch"
                                    id="require-manager-approval"
                                    label="Require manager approval after validation"
                                    checked={Boolean(formData.requireManagerApprovalBeforeRelease)}
                                    onChange={(event) => setFormData(previous => ({ ...previous, requireManagerApprovalBeforeRelease: event.target.checked }))}
                                />
                                <Form.Check
                                    type="switch"
                                    id="allow-author-release"
                                    label="Allow selected scientists to sign and release their own results"
                                    checked={Boolean(formData.allowResultAuthorToRelease)}
                                    onChange={(event) => setFormData(previous => ({ ...previous, allowResultAuthorToRelease: event.target.checked }))}
                                />
                            </div>
                            <Form.Check className="mb-4" type="switch" id="require-different-releaser"
                                label="Require releasing staff to be different from the validators"
                                checked={Boolean(formData.requireDifferentReleaserFromValidator)}
                                onChange={event => setFormData(previous => ({ ...previous, requireDifferentReleaserFromValidator: event.target.checked }))} />
                            <h3 className="h6">Authorized release staff</h3>
                            <Form.Label htmlFor="result-release-policy">Who can sign and release?</Form.Label>
                            <Form.Select id="result-release-policy" className="mb-2" value={formData.resultReleasePolicy || 'selected_staff'}
                                onChange={event => setFormData(previous => ({ ...previous, resultReleasePolicy: event.target.value as 'selected_staff' | 'managers_only' }))}>
                                <option value="selected_staff">Selected staff, including scientists</option>
                                <option value="managers_only">Managers and administrators only</option>
                            </Form.Select>
                            <p className="text-muted small">The person who releases the result supplies its electronic sign-off. Manager approval is a separate, optional step. Managers and administrators can sign and release, including results they entered. Selected-staff mode additionally permits chosen employees; an empty list uses the validator-eligible staff list. Different-validator and different-releaser rules still apply.</p>
                            <div className="d-flex gap-2 mb-3">
                                <Form.Select
                                    aria-label="Choose result release staff"
                                    disabled={formData.resultReleasePolicy === 'managers_only'}
                                    value={currentReleaseSelection ?? ""}
                                    onChange={(event) => setCurrentReleaseSelection(Number(event.target.value))}
                                >
                                    <option value="">Select staff member</option>
                                    {scientists.map(staff => (
                                        <option key={staff.employeeid} value={staff.employeeid}>{staff.username} ({staff.role})</option>
                                    ))}
                                </Form.Select>
                                <Button variant="outline-primary" onClick={addReleaseStaff} disabled={!currentReleaseSelection || formData.resultReleasePolicy === 'managers_only'}>
                                    <RiUserAddLine className="me-1" />Add release staff
                                </Button>
                            </div>
                            {selectedReleaseStaff.length === 0 ? (
                                <div className="text-muted small">Using the validator-eligible staff list.</div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {selectedReleaseStaff.map((staff, index) => (
                                        <div key={staff.employeeid} className="d-flex justify-content-between align-items-center p-2 border rounded">
                                            <span>{staff.username} <small className="text-muted">({staff.role})</small></span>
                                            <Button aria-label={`Remove ${staff.username} from release staff`} variant="link" className="text-danger p-0" onClick={() => setSelectedReleaseStaff(previous => previous.filter((_, currentIndex) => currentIndex !== index))}>
                                                <RiDeleteBin6Line className="me-1" />Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container></fieldset>
        </div>
    );
};

export default ResultSettingsForm;
