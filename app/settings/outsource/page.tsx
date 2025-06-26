"use client";
import { useEffect, useState } from "react";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { Dropdown } from "react-bootstrap";
import Link from "next/link";
import { fetchOurSourcingOrganization } from "../../../lib/billingLib";
import { RiMoreLine, RiLockLine, RiAddBoxFill, RiBuilding2Line } from "@remixicon/react";

export default function IndexPageOutsource() {
  const [isLoading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<any[]>([]);

  useEffect(() => {
    async function loadInitData() {
      try {
        setLoading(true);
        fetchOurSourcingOrganization(setOrganization);
      } catch (err) {
        setLoading(false);
        alert("error getting data");
      } finally {
        setLoading(false);
      }
    }
    loadInitData();
  }, []);

  const columns = [
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Type",
      accessor: "organizationType",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Address",
      accessor: "address",
    },
    {
      Header: "Contact No.",
      accessor: "contactNumber",
    },
    {
      Header: "Contact Person",
      accessor: "contactPerson",
    },
    {
      Header: "Added on",
      accessor: "addedon",
      Cell: ({ value }) => {
        return <div>{new Date(value).toLocaleString()}</div>;
      },
    },
    {
      Header: "Added By",
      accessor: "createdby",
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => {
        return (
          <div>
            <Dropdown>
              <Dropdown.Toggle variant="light" id="archives-dropdown">
                <RiMoreLine size={20} />
              </Dropdown.Toggle>
              <Dropdown.Menu className="m-0 p-0 bg-white">
                <Dropdown.Item className="text-capitalize">
                  <Link
                    href={`/settings/outsource/update?orgid=${row.original?.outsourceid}`}
                    className="d-flex align-items-center gap-2"
                  >
                    <RiLockLine size={16} /> Edit Information
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item className="text-capitalize d-flex align-items-center gap-2">
                  <RiLockLine size={16} /> Delete Information
                </Dropdown.Item>
                <Dropdown.Item className="text-capitalize d-flex align-items-center gap-2">
                  <RiLockLine size={16} /> Archive organization
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  const Loading = (
    <div className="container">Loading data.....................</div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
            <RiBuilding2Line size={24} className="text-primary" />
          </div>
          <div>
            <h4 className="mb-0 fw-semibold text-primary">Outsourcing Organizations</h4>
            <p className="text-muted small mb-0">Manage your external service providers</p>
          </div>
        </div>
        <Link href="/settings/outsource/new-outsourcing" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
          <RiAddBoxFill size={18} /> Add Organization
        </Link>
      </div>
      <PrimeTable
        handleSeverSideProcessing={null}
        serverSideFiltering={true}
        column={columns} data={organization}
        filtering={false} />
    </div>
  );
}
