"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TestPanelForm from "../../../../../components/TestPanelForm";
import { MasterFormLookupData, MasterTestPanel } from "../../../../../lib/types";

const emptyLookupData: MasterFormLookupData = {
     departments: [],
     sampleTypes: [],
     sampleContainers: [],
};

export default function EditMasterTestPage() {
     const params = useParams<{ id: string }>();
     const router = useRouter();
     const [current, setCurrent] = useState<MasterTestPanel | null>(null);
     const [lookupData, setLookupData] = useState<MasterFormLookupData>(emptyLookupData);
     const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
          const load = async () => {
               try {
                    const [testsResponse, metaResponse] = await Promise.all([
                         fetch("/api/master/tests", { cache: "no-store" }),
                         fetch("/api/master/meta", { cache: "no-store" }),
                    ]);

                    const testsPayload = await testsResponse.json();
                    const rows = Array.isArray(testsPayload?.data) ? testsPayload.data : [];
                    setCurrent(rows.find((r: MasterTestPanel) => `${r.id}` === params.id) || null);

                    const metaPayload = await metaResponse.json();
                    const source = metaPayload?.data ?? metaPayload?.result ?? metaPayload;
                    setLookupData({
                         departments: Array.isArray(source?.departments) ? source.departments : [],
                         sampleTypes: Array.isArray(source?.sampleTypes) ? source.sampleTypes : [],
                         sampleContainers: Array.isArray(source?.sampleContainers) ? source.sampleContainers : [],
                    });
               } finally {
                    setIsLoading(false);
               }
          };
          load();
     }, [params.id]);

     if (isLoading) return <div className="ma-loading">Loading test...</div>;
     if (!current) return <div className="ma-empty">Test not found.</div>;

     return (
          <div className="d-flex flex-column gap-3">
               <div className="d-flex align-items-center justify-content-between gap-2">
                    <div>
                         <h1 className="ma-page-title">Edit Master Test #{params.id}</h1>
                         <p className="ma-page-subtitle">Update core panel configuration and metadata.</p>
                    </div>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => router.push("/master/tests")}>Back to List</button>
               </div>
               <TestPanelForm
                    title={`Edit Master Test #${params.id}`}
                    initialData={current}
                    lookupData={lookupData}
                    onSubmit={async (payload) => {
                         const response = await fetch(`/api/master/tests/${params.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(payload),
                         });
                         const data = await response.json();
                         if (response.ok && (data?.status === true || data?.status === "success")) {
                              router.push("/master/tests");
                              return;
                         }
                         alert(data?.message || "Failed to update test.");
                    }}
               />
          </div>
     );
}
