'use client';
import { useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { customFetchMutation } from "../../Auth/customFetch";

type QuickAddKind = "organization" | "clinician";

interface QuickAddReferralEntityProps {
    kind: QuickAddKind;
    onCreated: (entity: { id: number; name: string; entitytype: QuickAddKind }) => void;
    /** For clinicians: the referral organization currently selected, which the clinician is linked to. */
    organization?: { id: number; name: string } | null;
}

const LABELS: Record<QuickAddKind, { title: string; button: string; placeholder: string; endpoint: string }> = {
    organization: { title: "Add organization", button: "+ Add organization", placeholder: "e.g. Ridge Hospital", endpoint: "organization/quick-add" },
    clinician: { title: "Add clinician", button: "+ Add clinician", placeholder: "e.g. Dr. Kwame Mensah", endpoint: "clinicians/quick-add" },
};

/** Adds a referral organization or clinician by name without leaving the billing page. */
export default function QuickAddReferralEntity({ kind, onCreated, organization }: QuickAddReferralEntityProps) {
    const labels = LABELS[kind];
    const linkedOrganization = kind === "clinician" && organization?.id ? organization : null;
    const [show, setShow] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: "", phone: "", email: "" });

    const close = () => {
        if (saving) return;
        setShow(false);
        setForm({ name: "", phone: "", email: "" });
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (!form.name.trim()) return toast.error(`Enter the ${kind} name`);
        setSaving(true);
        try {
            const response: any = await customFetchMutation(labels.endpoint, "POST", {
                name: form.name,
                phone: form.phone || null,
                email: form.email || null,
                ...(linkedOrganization ? { organizationId: linkedOrganization.id } : {}),
            });
            if (response?.status !== "success" || !response?.result?.id) {
                toast.error(response?.message || response?.error || `Could not add ${kind}`);
                return;
            }
            const { id, name, created } = response.result;
            onCreated({ id: Number(id), name, entitytype: kind });
            if (created) toast.success(`${name} added and selected`);
            else toast.info(`${name} already exists and has been selected`);
            setShow(false);
            setForm({ name: "", phone: "", email: "" });
        } catch (error: any) {
            toast.error(error?.message || `Could not add ${kind}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Button size="sm" variant="link" className="p-0 mt-1 text-decoration-none" onClick={() => setShow(true)}>
                {labels.button}
            </Button>
            <Modal show={show} onHide={close} centered size="sm">
                <Form onSubmit={submit}>
                    <Modal.Header closeButton>
                        <Modal.Title className="fs-6 fw-bold">{labels.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-semibold">Name</Form.Label>
                            <Form.Control
                                autoFocus
                                size="sm"
                                required
                                maxLength={255}
                                placeholder={labels.placeholder}
                                value={form.name}
                                onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
                            />
                        </Form.Group>
                        {linkedOrganization && (
                            <p className="small text-primary mb-2">Will be saved as referring from {linkedOrganization.name}.</p>
                        )}
                        <p className="small text-muted mb-2">Contact details are optional and can be added later.</p>
                        <Form.Group className="mb-2">
                            <Form.Label className="small">Phone (optional)</Form.Label>
                            <Form.Control
                                size="sm"
                                type="tel"
                                placeholder="0XXXXXXXXX"
                                value={form.phone}
                                onChange={event => setForm(prev => ({ ...prev, phone: event.target.value }))}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="small">Email (optional)</Form.Label>
                            <Form.Control
                                size="sm"
                                type="email"
                                value={form.email}
                                onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="py-2">
                        <Button size="sm" variant="outline-secondary" onClick={close} disabled={saving}>Cancel</Button>
                        <Button size="sm" type="submit" disabled={saving || !form.name.trim()}>
                            {saving ? <Spinner size="sm" animation="border" /> : "Add and select"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
