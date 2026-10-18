'use client';
import { useEffect, useState } from "react";
import { Badge, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { ClinicianOrganization, fetchClinicianOrganizations, linkClinicianOrganization, unlinkClinicianOrganization } from "../../lib/clinicianOrganizations";

interface ClinicianOrganizationsManagerProps {
    clinicianId: number;
    organizationList: { id: number; name: string }[];
    /** Changes whenever the clinician profile is saved, so the main organization is re-read. */
    refreshKey?: number;
}

/** Lets staff record every organization a clinician refers patients from. */
export default function ClinicianOrganizationsManager({ clinicianId, organizationList, refreshKey = 0 }: ClinicianOrganizationsManagerProps) {
    const [organizations, setOrganizations] = useState<ClinicianOrganization[] | null>(null);
    const [selected, setSelected] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let active = true;
        fetchClinicianOrganizations(clinicianId)
            .then(rows => { if (active) setOrganizations(rows); })
            .catch(err => { if (active) { setOrganizations([]); toast.error(err?.message || "Could not load the clinician's organizations"); } });
        return () => { active = false; };
    }, [clinicianId, refreshKey]);

    const run = async (action: () => Promise<ClinicianOrganization[]>, success: string) => {
        setBusy(true);
        try {
            setOrganizations(await action());
            toast.success(success);
            setSelected("");
        } catch (err: any) {
            toast.error(err?.message || "Could not update the clinician's organizations");
        } finally {
            setBusy(false);
        }
    };

    const linkedIds = new Set((organizations || []).map(org => org.id));
    const available = organizationList.filter(org => !linkedIds.has(Number(org.id)));

    return (
        <div className="mb-3">
            <div className="fw-semibold small mb-1">Organizations this clinician refers from</div>
            <p className="small text-muted mb-2">A clinician can refer from several facilities. During billing, staff can pick any of these, and organization commissions go to the facility the case came from.</p>
            {!organizations ? (
                <Spinner size="sm" animation="border" />
            ) : (
                <div className="d-flex flex-wrap gap-2 mb-2">
                    {organizations.length === 0 && <span className="small text-muted">None yet.</span>}
                    {organizations.map(org => (
                        <Badge key={org.id} bg={org.primary ? "primary" : "secondary"} className="d-inline-flex align-items-center gap-1 fw-normal">
                            {org.name}{org.primary ? " (main)" : ""}
                            {!org.primary && (
                                <button type="button" className="btn-close btn-close-white" style={{ fontSize: "0.55rem" }} disabled={busy}
                                    aria-label={`Remove ${org.name}`}
                                    onClick={() => void run(() => unlinkClinicianOrganization(clinicianId, org.id), `${org.name} removed`)} />
                            )}
                        </Badge>
                    ))}
                </div>
            )}
            <div className="d-flex gap-2">
                <Form.Select size="sm" value={selected} onChange={event => setSelected(event.target.value)} disabled={busy || available.length === 0} aria-label="Organization to add">
                    <option value="">{available.length === 0 ? "No other organizations available" : "Add an organization..."}</option>
                    {available.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                </Form.Select>
                <Button type="button" size="sm" disabled={busy || !selected}
                    onClick={() => void run(() => linkClinicianOrganization(clinicianId, Number(selected)), "Organization added")}>
                    {busy ? <Spinner size="sm" animation="border" /> : "Add"}
                </Button>
            </div>
        </div>
    );
}
