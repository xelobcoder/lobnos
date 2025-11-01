"use client"
import React, { useState } from 'react';
import {

	RiSaveLine
} from '@remixicon/react';

export default function CustomersLeadList() {
	const [formData, setFormData] = useState({
		name: '',
		contact_person: '',
		contact_email: '',
		contact_phone: '',
		company_name: '',
		industry_type: 'healthcare',
		lead_source: 'website',
		service_interest: '',
		status: 'new',
		priority: 'medium',
		location: '',
		assigned_to: '',
		notes: ''
	});

	const [users] = useState<{ id: string; name: string }[]>([]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await fetch('/api/leads', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});
			if (!response.ok) throw new Error('Failed to save lead');
		} catch (error) {
			console.error('Error saving lead:', error);
		}
	};

	return (
		<div className="container-fluid px-4 py-3">
			<h3 className="mb-3 text-dark fw-medium">Create New Lead</h3>
			<form onSubmit={handleSubmit}>
				<h6 className="text-muted mb-2">Contact Information</h6>
				<hr className="mt-1 mb-3" />

				<div className="form-row grid-reg mt-1">
					<label className="pls-label">Full Name*</label>
					<input
						type="text"
						name="name"
						value={formData.name}
						onChange={handleChange}
						className="custom-input"
						placeholder="Full Name"
						required
					/>
				</div>

				<div className="form-row grid-reg mt-1">
					<label className="pls-label">Contact Person*</label>
					<input
						type="text"
						name="contact_person"
						value={formData.contact_person}
						onChange={handleChange}
						className="custom-input"
						placeholder="Contact Person"
						required
					/>
				</div>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Email Address*</label>
					<input
						type="email"
						name="contact_email"
						value={formData.contact_email}
						onChange={handleChange}
						className="custom-input"
						placeholder="Email Address"
						required
					/>
				</div>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Phone Number*</label>
					<input
						type="tel"
						name="contact_phone"
						value={formData.contact_phone}
						onChange={handleChange}
						className="custom-input"
						placeholder="Phone Number"
						required
					/>
				</div>

				<hr className="mt-1 mb-3" />
				<h6 className="text-muted mb-2">Company Information</h6>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Company Name</label>
					<input
						type="text"
						name="company_name"
						value={formData.company_name}
						onChange={handleChange}
						className="custom-input"
						placeholder="Company Name"
					/>
				</div>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Location*</label>
					<input
						type="text"
						name="location"
						value={formData.location}
						onChange={handleChange}
						className="custom-input"
						placeholder="Location"
						required
					/>
				</div>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Industry Type*</label>
					<select
						name="industry_type"
						value={formData.industry_type}
						onChange={handleChange}
						className="custom-select"
						required
					>
						<option value="healthcare">Healthcare</option>
						<option value="pharmaceutical">Pharmaceutical</option>
						<option value="biotech">Biotech</option>
						<option value="research">Research</option>
					</select>
				</div>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Lead Source</label>
					<select
						name="lead_source"
						value={formData.lead_source}
						onChange={handleChange}
						className="custom-select"
					>
						<option value="website">Website</option>
						<option value="referral">Referral</option>
						<option value="social_media">Social Media</option>
						<option value="cold_call">Cold Call</option>
						<option value="trade_show">Trade Show</option>
					</select>
				</div>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Service Interest</label>
					<input
						type="text"
						name="service_interest"
						value={formData.service_interest}
						onChange={handleChange}
						className="custom-input"
						placeholder="Services interested in"
					/>
				</div>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Status</label>
					<select
						name="status"
						value={formData.status}
						onChange={handleChange}
						className="custom-select"
					>
						<option value="new">New</option>
						<option value="contacted">Contacted</option>
						<option value="qualified">Qualified</option>
						<option value="proposal">Proposal</option>
						<option value="negotiation">Negotiation</option>
						<option value="closed_won">Closed Won</option>
						<option value="closed_lost">Closed Lost</option>
					</select>
				</div>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Priority</label>
					<select
						name="priority"
						value={formData.priority}
						onChange={handleChange}
						className="custom-select"
					>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
						<option value="urgent">Urgent</option>
					</select>
				</div>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Assigned To</label>
					<select
						name="assigned_to"
						value={formData.assigned_to}
						onChange={handleChange}
						className="custom-select"
					>
						<option value="">Select assignee</option>
						{users.map((user, index) => (
							<option key={index} value={user.id}>
								{user.name}
							</option>
						))}
					</select>
				</div>

				<hr className="mt-1 mb-3" />
				<h6 className="text-muted mb-2">Additional Information</h6>
				<div className="form-row mt-1">
					<textarea
						name="notes"
						value={formData.notes}
						onChange={handleChange}
						className="custom-input"
						rows={4}
						placeholder="Additional notes..."
					/>
				</div>

				<button
					type="submit"
					className="btn btn-success mt-3 d-flex align-items-center gap-2"
				>
					<RiSaveLine size={16} />
					Save Lead
				</button>
			</form>
		</div >
	);
}
