"use client";

import React, { useState } from "react";
import CommissionConfigForm from "../../../../../../components/Commission/Admin/CommissionConfigForm";
import CommissionConfigList from "../../../../../../components/Commission/Admin/CommissionConfigList";
import { CommissionConfig } from "../../../../../../lib/commission/commissionApi";

export default function CommissionConfigsPage() {
     const [editingConfig, setEditingConfig] = useState<CommissionConfig | null>(
          null
     );
     const [showForm, setShowForm] = useState(false);
     const [refreshKey, setRefreshKey] = useState(0);

     const handleConfigSaved = (config: CommissionConfig) => {
          setEditingConfig(null);
          setShowForm(false);
          setRefreshKey((prev) => prev + 1);
     };

     const handleEdit = (config: CommissionConfig) => {
          setEditingConfig(config);
          setShowForm(true);
     };

     const handleCancel = () => {
          setEditingConfig(null);
          setShowForm(false);
     };

     const handleDelete = () => {
          setRefreshKey((prev) => prev + 1);
     };

     return (
          <div className="container-fluid px-4 py-3">
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h1 className="h3 mb-0">Commission Configurations</h1>
                         <small className="text-muted">
                              Manage commission calculation rules and settings
                         </small>
                    </div>
                    <button
                         className="btn btn-primary"
                         onClick={() => {
                              setEditingConfig(null);
                              setShowForm(!showForm);
                         }}
                    >
                         {showForm ? "Cancel" : "+ New Configuration"}
                    </button>
               </div>

               {showForm && (
                    <div className="row mb-4">
                         <div className="col-lg-8">
                              <CommissionConfigForm
                                   configId={editingConfig?.id}
                                   onSaved={handleConfigSaved}
                                   onCancel={handleCancel}
                              />
                         </div>
                    </div>
               )}

               <div className="card">
                    <div className="card-header bg-light py-3">
                         <h5 className="mb-0">Active Configurations</h5>
                    </div>
                    <div className="card-body p-0">
                         <CommissionConfigList
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              refreshTrigger={refreshKey}
                         />
                    </div>
               </div>
          </div>
     );
}
