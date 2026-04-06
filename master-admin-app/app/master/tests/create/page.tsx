"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TestPanelForm from "../../../../components/TestPanelForm";
import { MasterFormLookupData } from "../../../../lib/types";

const emptyLookupData: MasterFormLookupData = {
     departments: [],
     sampleTypes: [],
     sampleContainers: [],
};

export default function CreateMasterTestPage() {
     const router = useRouter();
     const [lookupData, setLookupData] = useState<MasterFormLookupData>(emptyLookupData);
     const [isLoadingMeta, setIsLoadingMeta] = useState(true);

     useEffect(() => {
          const loadMeta = async () => {
               try {
                    const response = await fetch("/api/master/meta", { cache: "no-store" });
                    const payload = await response.json();
                    const source = payload?.data ?? payload?.result ?? payload;
                    setLookupData({
                         departments: Array.isArray(source?.departments) ? source.departments : [],
                         sampleTypes: Array.isArray(source?.sampleTypes) ? source.sampleTypes : [],
                         sampleContainers: Array.isArray(source?.sampleContainers) ? source.sampleContainers : [],
                    });
               } finally {
                    setIsLoadingMeta(false);
               }
          };
          loadMeta();
     }, []);

     if (isLoadingMeta) {
          return <div className="ma-loading">Loading form metadata...</div>;
     }

     return (
          <div className="d-flex flex-column gap-3">
               <div className="d-flex align-items-center justify-content-between gap-2">
                    <div>
                         <h1 className="ma-page-title">Create Master Test</h1>
                         <p className="ma-page-subtitle">Define core test setup and report metadata.</p>
                    </div>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => router.push("/master/tests")}>Back to List</button>
               </div>
               <TestPanelForm
                    title="Create Master Test"
                    lookupData={lookupData}
                    onSubmit={async (payload) => {
                         const response = await fetch("/api/master/tests", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(payload),
                         });
                         const data = await response.json();
                         if (response.ok && (data?.status === true || data?.status === "success")) {
                              router.push("/master/tests");
                              return;
                         }
                         alert(data?.message || "Failed to create master test.");
                    }}
               />
          </div>
     );
}
