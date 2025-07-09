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
`;



export default function OrganizationList() {
	const [organization, setOrganization] = useState([])
	const [paginate, setPaginate] = useState({ count: 10, page: 1 })
	const [filter, setFilter] = useState({ organization: "", email: "", contact: "" })
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
			Header: "More",
			accessor: "more",
			Cell: ({ row }) => {
				return (
					<Dropdown align="end">
						<Dropdown.Toggle
							variant="light"
							size="sm"
							id={`dropdown-${row.original.id}`}
							className="border-0"
						>
							<RiMoreLine size={20} />
						</Dropdown.Toggle>

						<Dropdown.Menu>
							<Dropdown.Item as={Link} href={`/billing/billing-strategy/organization/${row.original.id}/check`}>
								<RiEyeLine className="me-2" /> Create Pricing
							</Dropdown.Item>
							<Dropdown.Item onClick={(ev) => { handleEditing(row.original.id) }}>
								<RiEditLine className="me-2" /> Edit Details
							</Dropdown.Item>
							<Dropdown.Divider />
							<Dropdown.Item
								className="text-danger"
								onClick={(e) => deleteOrganization(row.original.ID, getOrganizationData)}
							>
								<RiDeleteBinLine className="me-2" /> Delete
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				)
			},
		},
	]

	const getOrganizationData =
		function () {
			let loadurl = `organizations/details?count=${paginate.count}&&page=${paginate.page}&&contact=${filter.contact}&&email=${filter.email}&&organization=${filter.organization}`
			setLoading(true);
			customFetch(loadurl)
				.then((response) => {
					const { statusCode, status, result } = response
					statusCode == 200 && status == "success" ? setOrganization(result) : setOrganization([])
					setLoading(false)
				})
				.catch((err) => {
					setOrganization([])
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
		let url = ""
		for (const [key, value] of Object.entries(filter)) {
			if (value) {
				url += `&&${key}=${value}`
			}
		}
		original += url
		getOrganizationData()
	}


	if (isloading) return <div>loading ........... </div>


	if (organization.length === 0 && !isloading) {
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
			<div className="d-flex justify-content-between">
			</div>
			<form className="grid grid-5">
				<div className="form-row">
					<div className="input-group">
						<span className="input-group-text">
							<RiBuildingLine size={20} />
						</span>
						<input
							value={filter.organization}
							onChange={(ev) => {
								handleChangeWithState(ev, "organization", setFilter, filter)
							}}
							className="form-control"
							type="text"
							placeholder="organization name"
						/>
					</div>
				</div>
				<div className="form-row ">
					<div className="input-group">
						<span className="input-group-text">
							<RiMailLine size={20} />
						</span>
						<input
							value={filter.email}
							onChange={(ev) => {
								handleChangeWithState(ev, "email", setFilter, filter)
							}}
							className="form-control"
							type="email"
							placeholder="email"
						/>
					</div>
				</div>
				<div className="form-row ">
					<div className="input-group">
						<span className="input-group-text">
							<RiPhoneLine size={20} />
						</span>
						<input
							value={filter.contact}
							onChange={(ev) => {
								handleChangeWithState(ev, "contact", setFilter, filter)
							}}
							className="form-control"
							type="tel"
							minLength={10}
							maxLength={10}
							placeholder="contact number"
						/>
					</div>

				</div>

				<div>
					<button
						onClick={(ev) => {
							ev.preventDefault();
							filterButton()
						}}
						type="button"
						className="btn btn-secondary bt-sm mx-3 d-flex align-items-center">
						<RiSearchLine className="me-2" size={20} />
						search
					</button>
				</div>
				<div className="form-row">
					<button
						type="button"
						onClick={() => router.push("/organization/new")}
						className="btn btn-primary  d-flex align-items-center">
						<RiAddLine className="me-2" size={20} />
						add new organization
					</button>
				</div>
			</form>
			<PrimeTable
				column={columns} data={organization}
				filtering={false}
				serverSideFiltering={true}
				handleSeverSideProcessing={orgainzationServerSideProcessing}
			/>
		</section>
	)
}
