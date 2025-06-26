"use client"
import React, { useState } from 'react';
import { 
  RiUserLine, RiContactsLine, 
  RiStackLine, 
  RiSaveLine,
  RiBuildingLine,
  RiEarthLine,
  RiMailLine,
  RiPhoneLine
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

  const [users] = useState([]);

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
    <div className="container py-5">
      <h1 className="mb-4 display-5 fw-bold text-primary">New Lead Entry</h1>
      <form onSubmit={handleSubmit} className="card p-4 shadow-lg">
        {/* Contact Information Section */}
        <div className="border-bottom pb-3 mb-4">
          <h2 className="h5 text-primary d-flex align-items-center gap-2">
            <RiContactsLine />
            Contact Information
          </h2>
        </div>

        {/* Full Name */}
        <div className="input-group mb-3">
          <span className="input-group-text bg-light">
            <RiUserLine size={20} />
          </span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control form-control-lg"
            placeholder="Full Name"
            required
          />
        </div>

        {/* Contact Person */}
        <div className="input-group mb-3">
          <span className="input-group-text bg-light">
            <RiUserLine size={20} />
          </span>
          <input
            type="text"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleChange}
            className="form-control form-control-lg"
            placeholder="Contact Person"
            required
          />
        </div>

        {/* Contact Details Section */}
        <div className="border-bottom pb-3 mb-4 mt-5">
          <h2 className="h5 text-primary d-flex align-items-center gap-2">
            <RiMailLine />
            Contact Details
          </h2>
        </div>

        {/* Email */}
        <div className="input-group mb-3">
          <span className="input-group-text bg-light">
            <RiMailLine size={20} />
          </span>
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            className="form-control form-control-lg"
            placeholder="Email Address"
            required
          />
        </div>

        {/* Phone */}
        <div className="input-group mb-3">
          <span className="input-group-text bg-light">
            <RiPhoneLine size={20} />
          </span>
          <input
            type="tel"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            className="form-control form-control-lg"
            placeholder="Phone Number"
            required
          />
        </div>

        {/* Company Information Section */}
        <div className="border-bottom pb-3 mb-4 mt-5">
          <h2 className="h5 text-primary d-flex align-items-center gap-2">
            <RiBuildingLine />
            Company Information
          </h2>
        </div>

        {/* Company Name */}
        <div className="input-group mb-3">
          <span className="input-group-text bg-light">
            <RiBuildingLine size={20} />
          </span>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            className="form-control form-control-lg"
            placeholder="Company Name"
          />
        </div>

        {/* Location */}
        <div className="input-group mb-3">
          <span className="input-group-text bg-light">
            <RiEarthLine size={20} />
          </span>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="form-control form-control-lg"
            placeholder="Location"
            required
          />
        </div>

        {/* Add remaining fields (industry_type, lead_source, etc) following same pattern */}
        {/* Example for select: */}
        <div className="input-group mb-3">
          <span className="input-group-text bg-light">
            <RiStackLine size={20} />
          </span>
          <select
            name="industry_type"
            value={formData.industry_type}
            onChange={handleChange}
            className="form-select form-select-lg"
            required
          >
            <option value="healthcare">Healthcare</option>
            <option value="pharmaceutical">Pharmaceutical</option>
            <option value="biotech">Biotech</option>
            <option value="research">Research</option>
          </select>
        </div>

        {/* Submit button */}
        <button 
          type="submit" 
          className="btn btn-primary btn-lg w-100 py-3 fw-bold mt-4"
        >
          <RiSaveLine className="me-2" />
          Save Lead
        </button>
      </form>
    </div>
  );
}
