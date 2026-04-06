"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FieldRulesEditor from "../../../../../components/FieldRulesEditor";
import { FieldCategory, MasterFieldRule } from "../../../../../lib/types";

export default function MasterTestFieldsPage() {
     const params = useParams<{ id: string }>();
     const router = useRouter();
     const [rules, setRules] = useState<MasterFieldRule[]>([]);
     const [categories, setCategories] = useState<FieldCategory[]>([]);
     const [loading, setLoading] = useState(true);

     const load = async () => {
          setLoading(true);
          try {
               const response = await fetch(`/api/master/tests/${params.id}/fields`, { cache: "no-store" });
               const payload = await response.json();
               const rows = Array.isArray(payload?.data) ? payload.data : [];
               const cats = Array.isArray(payload?.categories) ? payload.categories : [];
               setRules(rows);
               setCategories(cats);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          load();
     }, [params.id]);

     if (loading) return <div className="ma-loading">Loading field rules...</div>;

     return (
          <div className="d-flex flex-column gap-3">
               <div className="d-flex align-items-center justify-content-between gap-2">
                    <div>
                         <h1 className="ma-page-title">Field Configuration</h1>
                         <p className="ma-page-subtitle">Create and manage result-entry parameters for test #{params.id}.</p>
                    </div>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => router.push("/master/tests")}>Back to List</button>
               </div>
               <FieldRulesEditor
                    initialRules={rules}
                    fieldConstraintsCategorization={categories}
                    onSave={async (updatedRules) => {
                         const response = await fetch(`/api/master/tests/${params.id}/fields`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ data: updatedRules }),
                         });
                         const payload = await response.json();
                         if (response.ok && (payload?.status === true || payload?.status === "success")) {
                              alert("Field rules updated successfully.");
                              return;
                         }
                         throw new Error(payload?.message || "Failed to update rules.");
                    }}
               />
          </div>
     );
}
