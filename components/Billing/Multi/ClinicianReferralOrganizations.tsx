'use client';
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { ClinicianOrganization, fetchClinicianOrganizations, linkClinicianOrganization } from "../../../lib/clinicianOrganizations";

interface ClinicianReferralOrganizationsProps {
    clinicianId: number;
    clinicianName: string;
    selectedOrganization: { id: number; name: string } | null;
    onSelectOrganization: (organization: { id: number; name: string; entitytype: "organization" }) => void;
}

/**
 * Shows the organizations the selected referring clinician works at, so staff can pick where the
 * clinician referred from today, or link a newly selected organization to the clinician.
 */
export default function ClinicianReferralOrganizations({ clinicianId, clinicianName, selectedOrganization, onSelectOrganization }: ClinicianReferralOrganizationsProps) {
    const [organizations, setOrganizations] = useState<ClinicianOrganization[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [linking, setLinking] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let active = true;
        setOrganizations(null);
        setError(null);
        fetchClinicianOrganizations(clinicianId)
            .then(rows => { if (active) setOrganizations(rows); })
            .catch(err => { if (active) setError(err?.message || "Could not load the clinician's organizations"); });
        return () => { active = false; };
    }, [clinicianId, attempt]);

    const link = async () => {
        if (!selectedOrganization || linking) return;
        setLinking(true);
        try {
            setOrganizations(await linkClinicianOrganization(clinicianId, selectedOrganization.id));
            toast.success(`${selectedOrganization.name} saved as an organization ${clinicianName} refers from`);
        } catch (err: any) {
            toast.error(err?.message || "Could not link the organization to the clinician");
        } finally {
            setLinking(false);
        }
    };

    if (error) {
        return (
            <div className="small text-danger mt-1">
                {error}
                <Button size="sm" variant="link" className="p-0 ms-2" onClick={() => setAttempt(value => value + 1)}>Retry</Button>
            </div>
        );
    }
    if (!organizations) return <div className="small text-muted mt-1"><Spinner size="sm" animation="border" className="me-1" />Loading organizations...</div>;

    const isLinked = selectedOrganization ? organizations.some(org => org.id === selectedOrganization.id) : false;
    const choices = organizations.filter(org => org.id !== selectedOrganization?.id);

    return (
        <div className="small mt-2" aria-label={`Organizations ${clinicianName} refers from`}>
            {selectedOrganization && isLinked && (
                <div className="text-success">Referring from {selectedOrganization.name}</div>
            )}
            {selectedOrganization && !isLinked && (
                <Button size="sm" variant="outline-primary" className="py-0" disabled={linking} onClick={() => void link()}>
                    {linking ? <Spinner size="sm" animation="border" /> : `Save ${selectedOrganization.name} as an organization ${clinicianName} refers from`}
                </Button>
            )}
            {!selectedOrganization && choices.length > 0 && (
                <>
                    <div className="text-muted mb-1">{clinicianName} refers from:</div>
                    <div className="d-flex flex-wrap gap-1">
                        {choices.map(org => (
                            <Button key={org.id} size="sm" variant="outline-secondary" className="py-0"
                                onClick={() => onSelectOrganization({ id: org.id, name: org.name, entitytype: "organization" })}>
                                {org.name}{org.primary ? " (main)" : ""}
                            </Button>
                        ))}
                    </div>
                </>
            )}
            {!selectedOrganization && choices.length === 0 && (
                <div className="text-muted">No organizations saved for {clinicianName}. Select or add one above to link it.</div>
            )}
        </div>
    );
}
