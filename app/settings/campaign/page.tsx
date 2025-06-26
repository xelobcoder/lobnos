'use client'
import React, { useEffect, useState } from "react";
import { Card, Spinner, Alert } from "react-bootstrap";
import { RiGift2Line, RiInformationLine, RiCalendarEventLine } from "@remixicon/react";
import { customFetch } from "../../../components/Auth/customFetch";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";


type Campaign = {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
};

export default function CampaignListPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      setError("");
      try {
        const data = await customFetch("campaigns");
        setCampaigns(Array.isArray(data.campaigns) ? data.campaigns : []);
      } catch (err) {
        setError("Failed to load campaigns.");
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const columns = [
    {
      Header: "Name",
      accessor: "name",
      Cell: ({ row }: any) => (
        <span><RiGift2Line className="me-2 text-primary" />{row.original.name}</span>
      ),
    },
    {
      Header: "Description",
      accessor: "description",
      Cell: ({ row }: any) => (
        <span><RiInformationLine className="me-2 text-secondary" />{row.original.description}</span>
      ),
    },
    {
      Header: "Start Date",
      accessor: "start_date",
      Cell: ({ row }: any) => (
        <span><RiCalendarEventLine className="me-2 text-secondary" />{new Date(row.original.start_date).toLocaleDateString()}</span>
      ),
    },
    {
      Header: "End Date",
      accessor: "end_date",
      Cell: ({ row }: any) => (
        <span><RiCalendarEventLine className="me-2 text-secondary" />{row.original.end_date ? new Date(row.original.end_date).toLocaleDateString() : "-"}</span>
      ),
    },
    {
      Header: "Create Promo",
      id: "create-promo",
      Cell: ({ row }: any) => (
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-1 px-2 py-1"
          style={{ fontSize: 13, height: 32, minWidth: 0 }}
          onClick={() => window.location.href = `/settings/promo-code-generation?campaignId=${row.original.id}`}
        >
          <RiGift2Line size={16} />
          <span className="d-none d-md-inline">Create Promo</span>
        </button>
      ),
    },
  ];

  return (
    <div>
      <Card className="shadow-sm border-0 mx-auto" style={{ background: "#f8fafd" }}>
        <Card.Header className="bg-white d-flex align-items-center gap-2 border-0 justify-content-between" style={{ fontSize: 22, fontWeight: 600 }}>
          <div className="d-flex align-items-center gap-2">
            <RiGift2Line className="text-primary" size={28} />
            Campaigns
          </div>
          <a href="/settings/campaign/create" className="btn btn-success d-flex align-items-center gap-1" style={{ fontSize: 16 }}>
            + Create Campaign
          </a>
        </Card.Header>
        <Card.Body className="p-4">
          {loading ? (
            <div className="d-flex align-items-center gap-2"><Spinner animation="border" size="sm" /> Loading...</div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <PrimeTable handleSeverSideProcessing={null} serverSideFiltering={true} column={columns} data={campaigns} filtering={true} />
          )}
        </Card.Body>
      </Card>
    </div>
  );
}