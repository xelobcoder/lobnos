"use client";

import React, { useState } from "react";
import CommissionAssignmentForm from "../../../../../../components/Commission/Admin/CommissionAssignmentForm";
import CommissionAssignmentList from "../../../../../../components/Commission/Admin/CommissionAssignmentList";
import { CommissionAssignment } from "../../../../../../lib/commission/commissionApi";

export default function CommissionAssignmentsPage() {
     const [editingAssignment, setEditingAssignment] =
          useState<CommissionAssignment | null>(null);
     const [showForm, setShowForm] = useState(false);
     const [refreshKey, setRefreshKey] = useState(0);

     const handleAssignmentSaved = (assignment: CommissionAssignment) => {
          setEditingAssignment(null);
          setShowForm(false);
          setRefreshKey((prev) => prev + 1);
     };

     const handleEdit = (assignment: CommissionAssignment) => {
          setEditingAssignment(assignment);
          setShowForm(true);
     };

     const handleCancel = () => {
          setEditingAssignment(null);
          setShowForm(false);
     };

     const handleDelete = () => {
          setRefreshKey((prev) => prev + 1);
     };

     return (
          <div className="container-fluid px-4 py-3">
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h1 className="h3 mb-0">Commission Assignments</h1>
                         <small className="text-muted">
                              Assign commission configurations to clinicians and organizations
                         </small>
                    </div>
                    <button
                         className="btn btn-primary"
                         onClick={() => {
                              setEditingAssignment(null);
                              setShowForm(!showForm);
                         }}
                    >
                         {showForm ? "Cancel" : "+ New Assignment"}
                    </button>
               </div>

               {showForm && (
                    <div className="row mb-4">
                         <div className="col-lg-8">
                              <CommissionAssignmentForm
                                   assignmentId={editingAssignment?.id}
                                   onSaved={handleAssignmentSaved}
                                   onCancel={handleCancel}
                              />
                         </div>
                    </div>
               )}

               <div className="card">
                    <div className="card-header bg-light py-3">
                         <h5 className="mb-0">Active Assignments</h5>
                    </div>
                    <div className="card-body p-0">
                         <CommissionAssignmentList
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              refreshTrigger={refreshKey}
                         />
                    </div>
               </div>

               {/* Info Section */}
               <div className="card mt-4">
                    <div className="card-header bg-light py-3">
                         <h5 className="mb-0">How Assignments Work</h5>
                    </div>
                    <div className="card-body">
                         <div className="row">
                              <div className="col-md-6">
                                   <h6 className="fw-bold mb-2">Resolution Priority</h6>
                                   <ol className="small">
                                        <li>Clinician-specific assignments (highest priority)</li>
                                        <li>Organization assignments</li>
                                        <li>System-wide assignments</li>
                                        <li>Commission defaults (fallback)</li>
                                   </ol>
                              </div>
                              <div className="col-md-6">
                                   <h6 className="fw-bold mb-2">Priority Scores</h6>
                                   <ul className="small">
                                        <li>Clinician-specific: 100+</li>
                                        <li>Organization-wide: 50-99</li>
                                        <li>System-wide: 1-49</li>
                                   </ul>
                                   <p className="text-muted small">
                                        Higher priority assignments override lower ones when applicable.
                                   </p>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
