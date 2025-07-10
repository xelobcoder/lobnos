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

const customStyles = `
  .empty-state-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important;
    border: 1px solid #e9ecef !important;
    box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1) !important;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #0d6efd 0%, #0856d6 100%) !important;
    border: none !important;
    transition: all 0.3s ease !important;
  }
  
  .btn-primary:hover {
    background: linear-gradient(135deg, #0b5ed7 0%, #0747ba 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3) !important;
  }

  .dropdown-toggle {
    transition: all 0.2s ease !important;
  }

  .dropdown-toggle:hover {
    background-color: #f8f9fa !important;
    transform: scale(1.05) !important;
  }

  .dropdown-menu {
    border: none !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
    animation: fadeInDown 0.2s ease-out !important;
  }

  .dropdown-item {
    transition: all 0.2s ease !important;
    border-radius: 8px !important;
    margin: 2px 8px !important;
  }

  .dropdown-item:hover {
    background-color: #f8f9fa !important;
    transform: translateX(4px) !important;
  }

  .dropdown-item.text-danger:hover {
    background-color: #fff5f5 !important;
    color: #dc3545 !important;
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;



export default function OrganizationList() {
	const [organization, setOrganization] = useState([])
	const [originalOrganizations, setOriginalOrganizations] = useState([])
	const [paginate, setPaginate] = useState({ count: 10, page: 1 })
	const [filter, setFilter] = useState({ type: 'organization', value: '' })
	const [load, setLoad] = useState(false)
	const [isloading, setLoading] = useState(true)
	const router = useRouter()

	const handleEditing = async (id) => {
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
				<style>{customStyles}</style>
				<Card className="empty-state-card border-0 rounded-4">
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
			<style>{customStyles}</style>

			{/* Bootstrap Filter Section */}
			<div className="card mb-4">
				<div className="card-header bg-light">
					<div className="d-flex justify-content-between align-items-center">
						<h6 className="mb-0 text-dark fw-semibold d-flex align-items-center">
							<RiFilterLine className="me-2 text-primary" size={20} />
							Filter & Search Organizations
						</h6>

					</div>
				</div>

				<div className="card-body">
					<div className="row g-3">
						<div className="col-lg-8 col-md-7">
							<div className="input-group">
								<span className="input-group-text">
									{filter.type === 'organization' && <RiBuildingLine size={18} className="text-muted" />}
									{filter.type === 'email' && <RiMailLine size={18} className="text-muted" />}
									{filter.type === 'contact' && <RiPhoneLine size={18} className="text-muted" />}
								</span>
								<select
									className="form-select"
									style={{ maxWidth: '160px' }}
									value={filter.type || 'organization'}
									onChange={ev => setFilter({ ...filter, type: ev.target.value })}
								>
									<option value="organization">Organization</option>
									<option value="email">Email Address</option>
									<option value="contact">Contact Number</option>
								</select>
								<input
									value={filter.value || ''}
									onChange={ev => setFilter({ ...filter, value: ev.target.value })}
									className="form-control"
									type={filter.type === 'email' ? 'email' : filter.type === 'contact' ? 'tel' : 'text'}
									placeholder={
										filter.type === 'email' ? 'Enter email address...' :
											filter.type === 'contact' ? 'Enter contact number...' :
												'Enter organization name...'
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
									className="btn btn-outline-secondary"
									disabled={!filter.value?.trim()}
								>
									<RiSearchLine className="me-1" size={18} />
									Search
								</button>
							</div>

							{filter.value && (
								<div className="mt-2">
									<div className="alert alert-info py-2 mb-0 d-flex justify-content-between align-items-center">
										<small className="mb-0">
											Searching for <strong>{filter.type}</strong>: "{filter.value}"
										</small>
										<button
											type="button"
											className="btn-close btn-sm"
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

						<div className="col-lg-4 col-md-5">
							<div className="d-grid">
								<button
									type="button"
									onClick={() => router.push("/organization/new")}
									className="btn btn-primary d-flex align-items-center justify-content-center"
								>
									<RiAddLine className="me-2" size={20} />
									Add New Organization
								</button>
							</div>
						</div>
					</div>

					{/* Show "no results" message when filtering returns empty */}
					{organization.length === 0 && !isloading && filter.value && (
						<div className="text-center py-4 mt-3">
							<div className="text-muted">
								<RiSearchLine size={48} className="mb-3 opacity-50" />
								<h6 className="text-dark">No organizations match your search</h6>
								<p className="mb-3">
									No organizations found for <strong>{filter.type}</strong>: "{filter.value}"
								</p>
								<button
									type="button"
									className="btn btn-outline-primary btn-sm"
									onClick={() => {
										setFilter({ type: 'organization', value: '' });
										setOrganization(originalOrganizations);
									}}
								>
									Clear filter and view all organizations
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			<PrimeTable
				column={columns} data={organization}
				filtering={false}
				serverSideFiltering={true}
				handleSeverSideProcessing={orgainzationServerSideProcessing}
			/>
		</section>
	)
}
