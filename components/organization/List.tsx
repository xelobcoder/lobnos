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
	const [load, setLoad] = useState(false)
	const [isloading, setLoading] = useState(true)
	const router = useRouter()

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
				const handleDelete = (e) => {
					e.preventDefault();
					if (window.confirm(`Are you sure you want to delete "${row.original.name}"? This action cannot be undone.`)) {
						deleteOrganization(row.original.ID, getOrganizationData);
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
				url += `&&${filter.type}=${filter.value}`
			}
			loadurl += url;
			setLoading(true);
			customFetch(loadurl)
				.then((response) => {
					const { statusCode, status, result } = response
					if (!filter.value) {
						statusCode == 200 && status == "success" ? (setOrganization(result), setOriginalOrganizations(result)) : (setOrganization([]), setOriginalOrganizations([]))
					} else {
						statusCode == 200 && status == "success" ? setOrganization(result) : setOrganization([])
					}
					setLoading(false)
				})
				.catch((err) => {
					setOrganization([])
					if (!filter.value) setOriginalOrganizations([])
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
		let original = `organizations/details?count=${paginate.count}&&page=${paginate.page}`
		let url = ''
		if (filter.value && filter.type) {
			url += `&&${filter.type}=${filter.value}`
		}
		original += url
		getOrganizationData()
	}


	if (isloading) return <div>loading ........... </div>



	if (organization.length === 0 && !isloading && !filter.value) {
		return (
			<div className="container-fluid py-4">
				<Card className="">
					<Card.Body className="p-5 text-center">
						<div className="mb-4">
							<div
								className="bg-primary bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
								style={{ width: '80px', height: '80px' }}
							>
								<RiBuildingLine className="text-primary" size={32} />
							</div>
							<h4 className="text-dark mb-2 fw-semibold">No Organizations Found</h4>
							<p className="text-muted mb-4 fs-6">
								Get started by adding your first organization to the system.<br />
								<small>Organizations help you manage clients and billing efficiently.</small>
							</p>
						</div>
						<Button
							variant="primary"
							size="lg"
							onClick={() => router.push("/organization/new")}
							className="d-flex align-items-center gap-2 mx-auto px-4 py-3 fw-semibold"
						>
							<RiAddLine size={20} />
							Add New Organization
						</Button>
					</Card.Body>
				</Card>
			</div>
		)
	}
	return (
		<section>
			{/* Professional Bootstrap Filter Section */}
			<div className="card mb-4 shadow-sm">
				<div className="card-header bg-light">
					<div className="d-flex justify-content-between align-items-center">
						<div className="d-flex align-items-center">
							<div className="bg-primary bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
								<RiFilterLine className="text-primary" size={20} />
							</div>
							<div>
								<h5 className="mb-1 text-dark fw-bold">Organizations</h5>
								<p className="mb-0 text-muted small">Filter and search your organizations</p>
							</div>
						</div>
						<div className="d-flex align-items-center gap-3">
							<div className="d-flex align-items-center gap-3">
								<span className="badge bg-light text-dark fw-normal px-3 py-2 rounded-pill">
									{organization.length} {organization.length === 1 ? 'Organization' : 'Organizations'}
								</span>
								<ExcelExportButton
									data={organization}
									filename="organizations"
									columns={exportColumns}
									disabled={!organization || organization.length === 0}
								/>
							</div>
							<div className="">
								<div className="d-grid">
									<button
										type="button"
										onClick={() => router.push("/organization/new")}
										className="btn btn-success p-1"
									>
										<RiAddLine className="me-2" size={20} />
										New Organization
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="card-body">
					<div className="row g-4">
						<div className="col-lg-8">
							<div className="d-flex flex-column gap-3">
								<div className="d-flex gap-2 align-items-center mb-3 flex-wrap">
									{/* Filter Type Selection - Bootstrap Button Group (smaller, inline) */}
									<div className="btn-group btn-group-sm" role="group" aria-label="Filter type">
										<input
											type="radio"
											className="btn-check"
											name="filterType"
											id="filter-organization"
											value="organization"
											checked={filter.type === 'organization'}
											onChange={ev => setFilter({ ...filter, type: ev.target.value })}
										/>
										<label className="btn btn-outline-primary" htmlFor="filter-organization">
											<RiBuildingLine size={14} className="me-1" />
											Org
										</label>
										<input
											type="radio"
											className="btn-check"
											name="filterType"
											id="filter-email"
											value="email"
											checked={filter.type === 'email'}
											onChange={ev => setFilter({ ...filter, type: ev.target.value })}
										/>
										<label className="btn btn-outline-primary" htmlFor="filter-email">
											<RiMailLine size={14} className="me-1" />
											Email
										</label>
										<input
											type="radio"
											className="btn-check"
											name="filterType"
											id="filter-contact"
											value="contact"
											checked={filter.type === 'contact'}
											onChange={ev => setFilter({ ...filter, type: ev.target.value })}
										/>
										<label className="btn btn-outline-primary" htmlFor="filter-contact">
											<RiPhoneLine size={14} className="me-1" />
											Contact
										</label>
									</div>
									{/* Search Input Group */}
									<div className="input-group flex-grow-1" style={{ minWidth: 220 }}>
										<span className="input-group-text">
											{filter.type === 'organization' && <RiBuildingLine size={16} />}
											{filter.type === 'email' && <RiMailLine size={16} />}
											{filter.type === 'contact' && <RiPhoneLine size={16} />}
										</span>
										<input
											value={filter.value || ''}
											onChange={ev => setFilter({ ...filter, value: ev.target.value })}
											className="form-control form-control-sm"
											type={filter.type === 'email' ? 'email' : filter.type === 'contact' ? 'tel' : 'text'}
											placeholder={
												filter.type === 'email' ? 'Search by email address...' :
													filter.type === 'contact' ? 'Search by contact number...' :
														'Search organizations...'
											}
											minLength={filter.type === 'contact' ? 10 : undefined}
											maxLength={filter.type === 'contact' ? 10 : undefined}
											onKeyPress={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													filterButton();
												}
											}}
										/>
										<button
											onClick={ev => {
												ev.preventDefault();
												filterButton();
											}}
											type="button"
											className="btn btn-primary btn-sm"
											disabled={!filter.value?.trim()}
										>
											<RiSearchLine size={16} className="me-1" />
											Search
										</button>
									</div>
								</div>

								{/* Search Input Group */}


								{filter.value && (
									<div className="mt-3">
										<div className="alert alert-primary alert-dismissible d-inline-flex align-items-center py-2" role="alert">
											<small className="me-3 mb-0 fw-medium">
												<span className="text-muted">Filtering by</span>{' '}
												<span className="fw-bold text-primary text-capitalize">{filter.type}</span>:{' '}
												<span className="fw-semibold">{filter.value}</span>
											</small>
											<button
												type="button"
												className="btn-close"
												aria-label="Clear filter"
												onClick={() => {
													setFilter({ type: 'organization', value: '' });
													setOrganization(originalOrganizations);
												}}
											></button>
										</div>
									</div>
								)}
							</div>

							{filter.value && (
								<div className="mt-3">
									<div className="alert alert-primary alert-dismissible d-inline-flex align-items-center py-2" role="alert">
										<small className="me-3 mb-0 fw-medium">
											<span className="text-muted">Filtering by</span>{' '}
											<span className="fw-bold text-primary text-capitalize">{filter.type}</span>:{' '}
											<span className="fw-semibold">{filter.value}</span>
										</small>
										<button
											type="button"
											className="btn-close"
											aria-label="Clear filter"
											onClick={() => {
												setFilter({ type: 'organization', value: '' });
												setOrganization(originalOrganizations);
											}}
										></button>
									</div>
								</div>
							)}
						</div>


					</div>

					{/* Professional No Results Section */}
					{organization.length === 0 && !isloading && filter.value && (
						<div className="card border-2 border-dashed border-secondary bg-light text-center mt-3">
							<div className="card-body py-4">
								<div className="bg-info bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
									<RiSearchLine size={28} className="text-info" />
								</div>
								<h6 className="text-dark fw-semibold mb-2">No Results Found</h6>
								<p className="text-muted mb-4">
									We could not find any organizations matching your search for{' '}
									<strong className="text-primary">{filter.value}</strong> in{' '}
									<strong>{filter.type.replace(/([A-Z])/g, ' $1').toLowerCase()}</strong>.
								</p>
								<div className="d-flex justify-content-center gap-3">
									<button
										type="button"
										className="btn btn-info btn-sm"
										onClick={() => {
											setFilter({ type: 'organization', value: '' });
											setOrganization(originalOrganizations);
										}}
									>
										<RiFilterLine className="me-2" size={16} />
										Clear Filter
									</button>
									<button
										type="button"
										className="btn btn-outline-primary btn-sm"
										onClick={() => router.push("/organization/new")}
									>
										<RiAddLine className="me-2" size={16} />
										Add Organization
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="table-container">
				<PrimeTable
					column={columns}
					data={organization}
					filtering={false}
					serverSideFiltering={true}
					handleSeverSideProcessing={orgainzationServerSideProcessing}

				/>
			</div>
		</section>
	)
}
