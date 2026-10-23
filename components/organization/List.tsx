import { useState, useEffect, useCallback } from "react"
import { customFetch, deleteOrganization, handleChangeWithState, updatePagination } from "../Auth/customFetch"
import {
	RiEditLine,
	RiDeleteBinLine,
	RiSearchLine,
	RiAddLine,
	RiFilterLine,
	RiBuildingLine,
	RiMailLine,
	RiPhoneLine,
	RiMoreLine,
	RiEyeLine
} from '@remixicon/react';
import Link from "next/link"
import { useRouter } from 'next/navigation'
import PrimeTable from "../accessories/Datatables/PrimeTable";
import { Dropdown, Button, Card } from 'react-bootstrap';
import { orgainzationServerSideProcessing } from "../serverActions/ActionFiltering";
import ExcelExportButton from "../common/ExcelExportButton";
import '../../styles/organization-list.css';
import { useApplication } from "../Auth/useApplicationContext";
import styles from '../common/DirectoryWorkspace.module.css';

type Organization = {
	id: number | string;
	ID?: number | string;
	name?: string;
	location?: string;
	mobile?: string;
	email?: string;
	region?: string;
	address?: string;
	[key: string]: any;
};

export default function OrganizationList() {
	const [organization, setOrganization] = useState<Organization[]>([])
	const [originalOrganizations, setOriginalOrganizations] = useState<Organization[]>([])
	const [paginate, setPaginate] = useState({ count: 10, page: 1 })
	const [filter, setFilter] = useState({ type: 'organization', value: '' })
	const [appliedFilter, setAppliedFilter] = useState({ type: 'organization', value: '' });
	const [load, setLoad] = useState(false)
	const [isloading, setLoading] = useState(true)
	const [loadError, setLoadError] = useState('');
	const router = useRouter()
	const currentEmployeeId = useApplication()?.user?.employeeid;

	// Define export columns mapping for better control
	const exportColumns = [
		{ key: 'name', label: 'Organization Name' },
		{ key: 'location', label: 'Location' },
		{ key: 'mobile', label: 'Contact Number' },
		{ key: 'email', label: 'Email Address' },
		{ key: 'region', label: 'Region' },
		{ key: 'address', label: 'Address' }
	];


	const handleEditing = async (id: number) => {
		router.push(`/organization/${id}/basicinfo`)
	}

	const columns = [
		{
			Header: "organization",
			accessor: "name",
			Cell: ({ row, value }) => <Link href={`/organization/${row.original.id}/basicinfo`} className="fw-semibold text-decoration-none">{value || 'Unnamed organization'}</Link>,
		},
		{
			Header: "Location",
			accessor: "location",
		},
		{
			Header: "Contact",
			accessor: "mobile",
		},
		{
			Header: "Email",
			accessor: "email",
		},
		{
			Header: "Region",
			accessor: "region",
		},
		{
			Header: "address",
			accessor: "address",
		},
		{
			Header: "Actions",
			accessor: "actions",
			Cell: ({ row }) => {
				const handleDelete = async (e) => {
					e.preventDefault();
					if (window.confirm(`Are you sure you want to delete "${row.original.name}"? This action cannot be undone.`)) {
						const response = await deleteOrganization(row.original.id, getOrganizationData,currentEmployeeId);
						if (response && response?.status == true) {
							alert("Deleted successfully");
							getOrganizationData()
						}
					}
				};

				return (
					<Dropdown align="end">
						<Dropdown.Toggle
							variant="outline-secondary"
							size="sm"
							id={`dropdown-${row.original.id}`}
							className="border-0 rounded-circle p-2 d-flex align-items-center justify-content-center"
							style={{ width: '32px', height: '32px' }}
						>
							<RiMoreLine size={16} />
						</Dropdown.Toggle>

						<Dropdown.Menu className="shadow-lg border-0 rounded-3" style={{ minWidth: '260px', maxWidth: '340px', width: '100%' }}>
							<div className="px-3 py-2 border-bottom">
								<small className="text-muted fw-semibold text-uppercase">Actions for</small>
								<div className="fw-bold text-dark small">{row.original.name}</div>
							</div>

							<Dropdown.Item
								as={Link}
								href={`/billing/billing-strategy/organization/${row.original.id}/check`}
								className="py-2 px-3 d-flex align-items-center"
							>
								<div className="bg-primary bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
									<RiEyeLine className="text-primary" size={14} />
								</div>
								<div>
									<div className="fw-semibold small">Create Pricing</div>
									<small className="text-muted">Set up billing strategy</small>
								</div>
							</Dropdown.Item>

							<Dropdown.Item
								onClick={(ev) => { handleEditing(row.original.id) }}
								className="py-2 px-3 d-flex align-items-center"
							>
								<div className="bg-info bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
									<RiEditLine className="text-info" size={14} />
								</div>
								<div>
									<div className="fw-semibold small">Edit Details</div>
									<small className="text-muted">Update organization info</small>
								</div>
							</Dropdown.Item>

							<Dropdown.Divider className="my-1" />

							<Dropdown.Item
								className="py-2 px-3 d-flex align-items-center text-danger"
								onClick={handleDelete}
							>
								<div className="bg-danger bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
									<RiDeleteBinLine className="text-danger" size={14} />
								</div>
								<div>
									<div className="fw-semibold small">Delete Organization</div>
									<small className="text-muted">Permanently remove</small>
								</div>
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				)
			},
		},
	]

	const getOrganizationData =
		function () {
			let loadurl = `organizations/details?count=${paginate.count}&&page=${paginate.page}`
			let url = ''
			if (filter.value && filter.type) {
				url += `&&${filter.type}=${encodeURIComponent(filter.value)}`
			}
			loadurl += url;
			setLoading(true);
			setLoadError('');
			customFetch(loadurl)
				.then((response) => {
					const { statusCode, status, result } = response
					if (statusCode !== 200 || status !== 'success' || !Array.isArray(result)) throw new Error(response?.message || 'Unable to load organizations.');
					if (!filter.value) {
						statusCode == 200 && status == "success" ? (setOrganization(result), setOriginalOrganizations(result)) : (setOrganization([]), setOriginalOrganizations([]))
					} else {
						statusCode == 200 && status == "success" ? setOrganization(result) : setOrganization([])
					}
					setLoading(false)
				})
				.catch((err) => {
					setLoadError(err?.message || 'Unable to load organizations. Please try again.');
					setLoading(false)
				})
		}

	useEffect(() => {
		getOrganizationData()
	}, [])


	const updatePageValue = async (value) => {
		updatePagination(value, setPaginate, paginate)
	}

	const filterButton = async () => {
		setAppliedFilter({ ...filter });
		let original = `organizations/details?count=${paginate.count}&&page=${paginate.page}`
		let url = ''
		if (filter.value && filter.type) {
			url += `&&${filter.type}=${filter.value}`
		}
		original += url
		getOrganizationData()
	}


	return (
		<main className={styles.workspace}>
			<header className={styles.header}>
				<div><span className={styles.eyebrow}>REFERRAL PARTNERS</span><h1>Organizations</h1><p>Find an organization, update its contact details, and manage its billing arrangements.</p></div>
				<div className={styles.actions}><ExcelExportButton data={organization} filename="organizations" columns={exportColumns} disabled={!organization.length || isloading} /><Link href="/organization/new" className="btn btn-primary"><RiAddLine size={18} aria-hidden="true" /> New organization</Link></div>
			</header>
			<section className={styles.panel}>
				<form className={styles.toolbar} onSubmit={event => { event.preventDefault(); void filterButton(); }}>
					<label htmlFor="organization-search-type">Search by<select id="organization-search-type" className="form-select" value={filter.type} onChange={event => setFilter({ ...filter, type: event.target.value })}><option value="organization">Organization name</option><option value="email">Email address</option><option value="contact">Contact number</option></select></label>
					<label htmlFor="organization-search" style={{ flex: 1 }}>Find an organization<input id="organization-search" className="form-control" type="search" value={filter.value} onChange={event => setFilter({ ...filter, value: event.target.value })} placeholder="Enter a name, email or contact number" /></label>
					<button type="submit" className="btn btn-primary" disabled={isloading}><RiSearchLine size={16} aria-hidden="true" /> Search</button>
					<button type="button" className="btn btn-outline-secondary" disabled={isloading} onClick={() => { setFilter({ type: 'organization', value: '' }); setAppliedFilter({ type: 'organization', value: '' }); setOrganization(originalOrganizations); setLoadError(''); }}>Clear</button>
				</form>
				{loadError && <div className="alert alert-danger" role="alert">{loadError}<button type="button" className="btn btn-link" onClick={getOrganizationData}>Retry</button></div>}
				{isloading ? <p className="py-4" role="status">Loading organizations…</p> : !loadError && <>
					<p className="small text-muted">{organization.length} organizations on this page{appliedFilter.value ? ` · Results for “${appliedFilter.value}”` : ''}. Select a name to open its details.</p>
					{organization.length ? <PrimeTable key={`${appliedFilter.type}:${appliedFilter.value}`} column={columns} data={organization} filtering={false} serverSideFiltering={!appliedFilter.value} handleSeverSideProcessing={orgainzationServerSideProcessing} /> : <div className={styles.empty}><h2>{appliedFilter.value ? 'No matching organizations' : 'No organizations yet'}</h2><p>{appliedFilter.value ? 'Try another name, email or contact number.' : 'Add your first organization to manage its contacts and billing.'}</p><Link href="/organization/new" className="btn btn-outline-primary">Add organization</Link></div>}
				</>}
			</section>
		</main>
	);
}