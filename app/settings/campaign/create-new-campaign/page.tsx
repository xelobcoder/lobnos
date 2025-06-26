'use client';
import React, { useState } from "react";
import {
	RiGift2Line,
	RiInformationLine,
	RiCalendarEventLine,
	RiCheckboxCircleLine,
	RiCloseCircleLine,
	RiEdit2Line
} from "@remixicon/react";
import { Card } from "react-bootstrap";
import { customPost } from "../../../../components/Auth/customFetch";
import { toast } from "react-toastify";

export default function CampaignCreationPage() {
	const [form, setForm] = useState({
		name: "",
		description: "",
		start_date: "",
		end_date: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError("");
		setSuccess("");
		try {
			const response: { status: 'error' | 'success', message: string ,id:number} = await customPost('/api/v1/campaigns', 'POST', form);
			if (response.status == "success") {
				toast.success(response.message || "Campaign created successfully!");
				// Optionally, you can redirect or reset the form here
				setForm({
					name: "",
					description: "",
					start_date: "",
					end_date: "",
				});
				
			} else {
				setError(response.message || "Failed to create campaign.");
				toast.error(response.message || "Failed to create campaign.");
			}
		} catch (err) {
			setError("Failed to create campaign.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="container py-4">
			<Card >
				<Card.Header style={{ fontSize: 22, fontWeight: 600 }}>
					<RiEdit2Line className="text-primary" size={28} />
					Create Campaign
				</Card.Header>
				<Card.Body className="p-4">
					<form onSubmit={handleSubmit}>
						<div className="mb-3">
							<label className="form-label"><RiGift2Line className="me-2 text-secondary" />Name *</label>
							<input name="name" value={form.name} onChange={handleChange} className="form-control" required maxLength={255} placeholder="Campaign name" />
						</div>
						<div className="mb-3">
							<label className="form-label"><RiInformationLine className="me-2 text-secondary" />Description</label>
							<textarea name="description" value={form.description} onChange={handleChange} className="form-control" placeholder="Describe the campaign" />
						</div>
						<div className="mb-3">
							<label className="form-label"><RiCalendarEventLine className="me-2 text-secondary" />Start Date *</label>
							<input name="start_date" value={form.start_date} onChange={handleChange} className="form-control" type="datetime-local" required />
						</div>
						<div className="mb-3">
							<label className="form-label"><RiCalendarEventLine className="me-2 text-secondary" />End Date</label>
							<input name="end_date" value={form.end_date} onChange={handleChange} className="form-control" type="datetime-local" />
						</div>
						{error && <div className="alert alert-danger d-flex align-items-center"><RiCloseCircleLine className="me-2" />{error}</div>}
						{success && <div className="alert alert-success d-flex align-items-center"><RiCheckboxCircleLine className="me-2" />{success}</div>}
						<button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" type="submit" disabled={submitting}>
							<RiEdit2Line /> {submitting ? "Submitting..." : "Create Campaign"}
						</button>
					</form>
				</Card.Body>
			</Card>
		</div>
	);
}
