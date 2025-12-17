"use client"
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import {

	RiSaveLine
} from '@remixicon/react';
import { toast } from 'react-toastify';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { useApplication } from '../../../../components/Auth/useApplicationContext';


export default function CustomersLeadList() {
	const searchParams = useSearchParams();
	const employeeid = useApplication()?.user?.employeeid;
	const id = searchParams?.get('id');
	const isEdit = !!id;
	const [formData, setFormData] = useState({
		firstname: '',
		lastname: '',
		middlename: '',
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
		assigned_to: null as number | null,
		notes: '',
		created_by: employeeid 
	});

	const [users, setUsers] = useState<{ employeeid: number; name: string }[]>([]);

	useEffect(() => {
		const loadEmployees = async () => {
			try {
				const response = await customFetch('logins');
				if (response.status === 'success' && response.result && Array.isArray(response.result)) {
					setUsers(response.result.map((user: any) => ({ employeeid: user.employeeid, name: user.username })));
				} else {
					setUsers([]);
					console.error('Failed to load employees');
				}
			} catch (error) {
				console.error('Error loading employees:', error);
			}
		};
		loadEmployees();
	}, []);

	useEffect(() => {
		if (isEdit && id) {
			const loadLead = async () => {
				try {
					const { success, data } = await customFetch(`leads/${id}`);
					if (success == true && data) {
						setFormData(data);
					}
				} catch (error) {
					console.error('Error loading lead:', error);
					toast.error('Failed to load lead data');
				}
			};
			loadLead();
		}
	}, [isEdit, id]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: name === 'assigned_to' ? (value ? parseInt(value) : null) : value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const endpoint = isEdit && id ? `leads/${id}` : 'leads';
			const method = isEdit ? 'PUT' : 'POST';
			const response = await customPost(endpoint, method, formData);
			if (response.status === 'error') {
				if (response.statusCode === 409) {
					toast.error(response.message || 'A lead with this email address already exists');
				} else {
					toast.error(response.message || 'Error saving lead');
				}
			} else {
				toast.success(`Lead ${isEdit ? 'updated' : 'created'} successfully`);
			}
		} catch (error) {
			console.error('Error saving lead:', error);
			toast.error('Error saving lead');
		}
	};

	return (
		<div className="p-4">
			<h3 className="mb-3 text-dark fw-medium">{isEdit ? 'Edit Lead' : 'Create New Lead'}</h3>
			<form onSubmit={handleSubmit}>
				<h6 className="text-muted mb-2">Contact Information</h6>
				<hr className="mt-1 mb-3" />

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">First Name*</label>
					<input
						type="text"
						name="firstname"
						value={formData.firstname}
						onChange={handleChange}
						className="form-control form-control-sm "
						placeholder="First Name"
						required
					/>
				</div>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Last Name*</label>
					<input
						type="text"
						name="lastname"
						value={formData.lastname}
						onChange={handleChange}
						className="form-control form-control-sm "
						placeholder="Last Name"
						required
					/>
				</div>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Middle Name</label>
					<input
						type="text"
						name="middlename"
						value={formData.middlename}
						onChange={handleChange}
						className="form-control form-control-sm "
						placeholder="Middle Name"
					/>
				</div>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Contact Person*</label>
					<input
						type="text"
						name="contact_person"
						value={formData.contact_person}
						onChange={handleChange}
						className="form-control form-control-sm "
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
						className="form-control form-control-sm "
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
						className="form-control form-control-sm "
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
						className="form-control form-control-sm "
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
						className="form-control form-control-sm "
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
						className="form-select form-select-sm"
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
						className="form-select"
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
						className="form-control form-control-sm "
						placeholder="Services interested in"
					/>
				</div>

				<div className="form-row grid-reg mt-2">
					<label className="pls-label">Status</label>
					<select
						name="status"
						value={formData.status}
						onChange={handleChange}
						className="form-select form-select-sm	"
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
						className="form-select"
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
						value={formData.assigned_to || ''}
						onChange={handleChange}
						className="form-select"
					>
						<option value="">Select assignee</option>
						{Array.isArray(users) && users.length > 0 && users.map((user, index) => (
							<option key={index} value={user.employeeid}>
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
						className="form-control	 form-control-sm "
						rows={4}
						placeholder="Additional notes..."
					/>
				</div>

				<button
					type="submit"
					className="btn btn-success mt-3 d-flex align-items-center gap-2"
				>
					<RiSaveLine size={16} />
					{isEdit ? 'Update Lead' : 'Save Lead'}
				</button>
			</form>
		</div >
	);
}
