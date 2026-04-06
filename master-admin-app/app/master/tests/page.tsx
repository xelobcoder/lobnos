"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MasterTestPanel } from "../../../lib/types";

const DELETE_PHRASE = process.env.NEXT_PUBLIC_MASTER_ADMIN_DELETE_PHRASE || "DELETE MASTER TESTS";

export default function MasterTestsPage() {
     const [rows, setRows] = useState<MasterTestPanel[]>([]);
     const [loading, setLoading] = useState(true);
     const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
     const [showDeleteModal, setShowDeleteModal] = useState(false);
     const [deleteText, setDeleteText] = useState("");
     const [isDeleting, setIsDeleting] = useState(false);

     const allSelected = useMemo(
          () => rows.length > 0 && rows.every((row) => selectedIds.has(row.id)),
          [rows, selectedIds]
     );

     const load = async () => {
          setLoading(true);
          try {
               const res = await fetch("/api/master/tests", { cache: "no-store" });
               const payload = await res.json();
               const data = Array.isArray(payload?.data) ? payload.data : [];
               setRows(data);
          } catch {
               setRows([]);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          load();
     }, []);

     const toggleSelect = (id: number, checked: boolean) => {
          setSelectedIds((prev) => {
               const copy = new Set(prev);
               if (checked) copy.add(id);
               else copy.delete(id);
               return copy;
          });
     };

     const toggleAll = () => {
          if (allSelected) {
               setSelectedIds(new Set());
               return;
          }
          setSelectedIds(new Set(rows.map((row) => row.id)));
     };

     const bulkDelete = async () => {
          if (selectedIds.size === 0) {
               alert("Select at least one test.");
               return;
          }
          if (deleteText.trim() !== DELETE_PHRASE) {
               alert(`Type ${DELETE_PHRASE} to continue.`);
               return;
          }

          setIsDeleting(true);
          try {
               const ids = Array.from(selectedIds).join(",");
               const res = await fetch(`/api/master/tests?testid=${ids}`, { method: "DELETE" });
               const payload = await res.json();
               if (res.ok && (payload?.status === true || payload?.status === "success")) {
                    setSelectedIds(new Set());
                    setDeleteText("");
                    setShowDeleteModal(false);
                    await load();
                    alert("Deleted successfully.");
               } else {
                    alert(payload?.message || "Delete failed.");
               }
          } finally {
               setIsDeleting(false);
          }
     };

     return (
          <div className="ma-card">
               <div className="ma-card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div>
                         <h5 className="mb-0 fw-semibold">Master Test Panels</h5>
                         <p className="ma-page-subtitle">Manage test definitions, metadata, and field configurations.</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button className="btn btn-outline-secondary btn-sm" onClick={toggleAll}>
                              {allSelected ? "Clear Selection" : `Select All (${rows.length})`}
                         </button>
                         <button
                              className="btn btn-outline-danger btn-sm"
                              disabled={selectedIds.size === 0}
                              onClick={() => setShowDeleteModal(true)}
                         >
                              Delete Selected ({selectedIds.size})
                         </button>
                         <Link className="btn btn-primary btn-sm" href="/master/tests/create">Create Test</Link>
                    </div>
               </div>

               <div className="ma-card-body">
                    {loading ? (
                         <div className="ma-loading">Loading master tests...</div>
                    ) : rows.length === 0 ? (
                         <div className="ma-empty">No tests found. Create your first master test panel.</div>
                    ) : (
                         <div className="table-responsive">
                              <table className="table table-sm table-striped align-middle ma-table">
                                   <thead>
                                        <tr>
                                             <th></th>
                                             <th>ID</th>
                                             <th>Name</th>
                                             <th>Short</th>
                                             <th>Price</th>
                                             <th>Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {rows.map((row) => (
                                             <tr key={row.id}>
                                                  <td>
                                                       <input
                                                            type="checkbox"
                                                            checked={selectedIds.has(row.id)}
                                                            onChange={(e) => toggleSelect(row.id, e.target.checked)}
                                                       />
                                                  </td>
                                                  <td>{row.id}</td>
                                                  <td>{row.name}</td>
                                                  <td>{row.shorttext || "-"}</td>
                                                  <td>{row.testprice || row.price || 0}</td>
                                                  <td>
                                                       <div className="btn-group btn-group-sm" role="group" aria-label="Test actions">
                                                            <Link href={`/master/tests/${row.id}/edit`} className="btn btn-outline-secondary">Edit</Link>
                                                            <Link href={`/master/tests/${row.id}/fields`} className="btn btn-outline-secondary">Fields</Link>
                                                       </div>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    )}
               </div>

               {showDeleteModal && (
                    <div className="position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center p-3" style={{ background: "rgba(0, 0, 0, 0.45)", zIndex: 1055 }}>
                         <div className="ma-card" style={{ width: "min(520px, 100%)" }}>
                              <div className="ma-card-body">
                                   <h6 className="fw-semibold mb-2">Confirm Delete</h6>
                                   <p className="mb-2">You are deleting {selectedIds.size} master tests.</p>
                                   <p className="mb-2">Type <strong>{DELETE_PHRASE}</strong> to proceed.</p>
                                   <input className="form-control" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} />
                                   <div className="d-flex justify-content-end gap-2 mt-3">
                                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                        <button className="btn btn-danger btn-sm" onClick={bulkDelete} disabled={isDeleting}>
                                             {isDeleting ? "Deleting..." : "Confirm Delete"}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
