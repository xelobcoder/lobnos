"use client";
import React, { useEffect, useState } from "react";
import { Card, Spinner, Alert } from "react-bootstrap";
import { customFetch } from "../../../../components/Auth/customFetch";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";

// Define the promo type for correct typing
interface Promo {
  id: number;
  code: string;
  description: string;
  campaign_id: number | null;
  discount_type: string;
  discount_value: string;
  max_uses: number;
  times_used: number;
  is_active: number;
  valid_from: string | null;
  valid_to: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function PromoCodesListPage() {
  const [promoCodes, setPromoCodes] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPromoCodes() {
      setLoading(true);
      setError("");
      try {
        const data = await customFetch("promo-codes");
        setPromoCodes(Array.isArray(data.promos) ? data.promos : []);
      } catch (err) {
        setError("Failed to load promo codes.");
      } finally {
        setLoading(false);
      }
    }
    fetchPromoCodes();
  }, []);

  // Define columns for PrimeTable
  const columns = [
    { Header: "Code", accessor: "code" },
    { Header: "Description", accessor: "description", Cell: ({ row }: any) => <span style={{ whiteSpace: 'pre-line' }}>{row.original.description}</span> },
    { Header: "Discount", accessor: "discount_value", Cell: ({ row }: any) => `${row.original.discount_value} (${row.original.discount_type})` },
    { Header: "Max Uses", accessor: "max_uses" },
    { Header: "Times Used", accessor: "times_used" },
    { Header: "Valid From", accessor: "valid_from", Cell: ({ row }: any) => row.original.valid_from ? new Date(row.original.valid_from).toLocaleString() : "-" },
    { Header: "Valid To", accessor: "valid_to", Cell: ({ row }: any) => row.original.valid_to ? new Date(row.original.valid_to).toLocaleString() : "-" },
    { Header: "Active", accessor: "is_active", Cell: ({ row }: any) => row.original.is_active ? "Yes" : "No" },
    { Header: "Created", accessor: "created_at", Cell: ({ row }: any) => row.original.created_at ? new Date(row.original.created_at).toLocaleString() : "-" },
    { Header: "Updated", accessor: "updated_at", Cell: ({ row }: any) => row.original.updated_at ? new Date(row.original.updated_at).toLocaleString() : "-" },
  ];

  return (
    <div className="py-4">
      <Card>
        <Card.Header style={{ fontSize: 22, fontWeight: 600 }} className="d-flex justify-content-between align-items-center">
          <span>Promo Codes</span>
          <a href="/settings/promos/promo-code-generation" className="btn btn-outline-primary btn-sm">
            Add Promo Code
          </a>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="d-flex align-items-center gap-2"><Spinner animation="border" size="sm" /> Loading...</div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : promoCodes.length === 0 ? (
            <Alert variant="info">No promo codes found.</Alert>
          ) : (
            <PrimeTable
              column={columns}
              data={promoCodes}
              filtering={true}
              serverSideFiltering={false}
              handleSeverSideProcessing={null}
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
