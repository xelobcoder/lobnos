"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
     createCommissionDefault,
     getCommissionConfigs,
     getCommissionDefaults,
     updateCommissionDefault,
     deleteCommissionDefault,
     CommissionConfig,
     CommissionDefault,
} from "../../../../lib/commission/commissionApi";
import { formatCommissionType } from "../../../../lib/commission/commissionHelpers";
import { customFetch } from "../../../../components/Auth/customFetch";
import { toast } from "react-toastify";
import { RiRefreshLine, RiLoader4Line } from "@remixicon/react";

const DEFAULT_FORM_STATE = {
     commission_config_id: "",
     is_active: true,
};

type RecipientOption = {
     id: number;
     label: string;
};

export default function CommissionDefaults() {
     const [defaults, setDefaults] = useState<CommissionDefault[]>([]);
     const [configs, setConfigs] = useState<CommissionConfig[]>([]);
     const [recipients, setRecipients] = useState<RecipientOption[]>([]);
     const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null);
     const [formState, setFormState] = useState({ ...DEFAULT_FORM_STATE });
     const [loading, setLoading] = useState(false);
     const [loadingRecipients, setLoadingRecipients] = useState(false);
     const [saving, setSaving] = useState(false);
     const [editingId, setEditingId] = useState<number | null>(null);
     const [error, setError] = useState<string | null>(null);
     const [selectedRecipientType, setSelectedRecipientType] = useState<string>("");

     const tenantId = Number(process.env.TENANTID ?? 3);

     const configMap = useMemo(
          () =>
               configs.reduce<Record<number, CommissionConfig>>((map, config) => {
                    if (config.id) map[config.id] = config;
                    return map;
               }, {}),
          [configs]
     );

     const getRecipientLabel = (commissionDefault: CommissionDefault) => {
          if (!commissionDefault.recipient_id || commissionDefault.recipient_id === 0) {
               return `All ${commissionDefault.recipient_type === "organization" ? "organizations" : "clinicians"}`;
          }

          const recipient = recipients.find((item) => item.id === commissionDefault.recipient_id);
          if (recipient) return recipient.label;

          return `${commissionDefault.recipient_type === "organization" ? "Organization" : "Clinician"} #${commissionDefault.recipient_id}`;
     };

     const loadRecipients = async (recipientType: "clinician" | "organization") => {
          setLoadingRecipients(true);
          setError(null);
          setRecipients([]);

          try {
               if (recipientType === "clinician") {
                    const response = await customFetch("clinicians");
                    const clinicianList = response?.result ?? [];
                    const options = Array.isArray(clinicianList)
                         ? clinicianList.map((item: any) => ({
                              id: Number(item.id),
                              label:
                                   `${item.first_name || item.firstname || item.name || ""} ${item.last_name || item.lastname || ""}`.trim() ||
                                   `Clinician ${item.id}`,
                         }))
                         : [];
                    setRecipients(options);
               } else {
                    const response = await customFetch("organization");
                    const organizationList = response?.organizations ?? response?.result ?? [];
                    const options = Array.isArray(organizationList)
                         ? organizationList.map((item: any) => ({
                              id: Number(item.id),
                              label: item.name || item.org_name || `Organization ${item.id}`,
                         }))
                         : [];
                    setRecipients(options);
               }
          } catch (fetchError) {
               console.error(fetchError);
               setRecipients([]);
               setError("Unable to load recipients for the selected type.");
          } finally {
               setLoadingRecipients(false);
          }
     };

     const loadConfigs = async () => {
          try {
               setLoading(true);
               setError(null);
               const configResponse = await getCommissionConfigs();
               if (configResponse?.status === "success") {
                    setConfigs(configResponse.result || []);
               } else {
                    setConfigs([]);
                    setError(configResponse?.message || "Unable to load commission configurations");
               }
          } catch (loadError) {
               console.error(loadError);
               setError("An unexpected error occurred while loading commission configurations.");
          } finally {
               setLoading(false);
          }
     };

     const loadDefaults = async (recipientType: string, recipientId?: number) => {
          if (!recipientType) {
               setDefaults([]);
               setEditingId(null);
               setFormState({ ...DEFAULT_FORM_STATE });
               return;
          }

          try {
               setLoading(true);
               setError(null);
               const defaultsResponse = await getCommissionDefaults(recipientType, recipientId);
               if (defaultsResponse?.status === "success") {
                    const results = Array.isArray(defaultsResponse.result)
                         ? defaultsResponse.result
                         : defaultsResponse.result
                              ? [defaultsResponse.result]
                              : [];
                    setDefaults(results);
                    const defaultItem = results[0] ?? null;
                    if (defaultItem && defaultItem.id) {
                         setEditingId(defaultItem.id);
                         const active = defaultItem.is_active === 1 || defaultItem.is_active === true;
                         setFormState({
                              commission_config_id: defaultItem.commission_config_id.toString(),
                              is_active: active,
                         });
                    } else {
                         setEditingId(null);
                         setFormState({ ...DEFAULT_FORM_STATE });
                    }
               } else {
                    setDefaults([]);
                    setEditingId(null);
                    setFormState({ ...DEFAULT_FORM_STATE });
                    setError(defaultsResponse?.message || "Unable to load commission defaults");
               }
          } catch (loadError) {
               console.error(loadError);
               setDefaults([]);
               setEditingId(null);
               setFormState({ ...DEFAULT_FORM_STATE });
               setError("An unexpected error occurred while loading commission defaults.");
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          loadConfigs();
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);

     useEffect(() => {
          if (!selectedRecipientType) {
               setDefaults([]);
               setRecipients([]);
               setSelectedRecipientId(null);
               return;
          }

          loadRecipients(selectedRecipientType as "clinician" | "organization");
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [selectedRecipientType]);

     useEffect(() => {
          if (selectedRecipientType) {
               loadDefaults(selectedRecipientType, selectedRecipientId ?? undefined);
          }
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [selectedRecipientType, selectedRecipientId]);

     const resetForm = () => {
          setFormState({ ...DEFAULT_FORM_STATE });
          setEditingId(null);
     };

     const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
          const target = event.target as HTMLInputElement | HTMLSelectElement;
          const { name, value, type } = target;
          const checked = type === "checkbox" ? (target as HTMLInputElement).checked : undefined;
          setFormState((prev) => ({
               ...prev,
               [name]: type === "checkbox" ? checked : value,
          }));
     };

     const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          setSaving(true);
          setError(null);

          const recipientType = selectedRecipientType as "clinician" | "organization";
          const commissionConfigId = Number(formState.commission_config_id);

          if (!recipientType || !commissionConfigId) {
               toast.error("Please select a recipient type and commission configuration.");
               setSaving(false);
               return;
          }

          try {
               const payload = {
                    tenantId,
                    recipient_type: recipientType,
                    recipient_id: selectedRecipientId ?? 0,
                    commission_config_id: commissionConfigId,
                    is_active: formState.is_active ? 1 : 0,
               };

               let response;
               if (editingId) {
                    response = await updateCommissionDefault(editingId,  payload);
               } else {
                    response = await createCommissionDefault(payload);
               }

               if (response?.status === "success") {
                    toast.success(editingId ? "Commission default updated." : "Commission default created.");
                    resetForm();
                    const refreshType = selectedRecipientType || payload.recipient_type;
                    setSelectedRecipientType(refreshType);
                    loadDefaults(refreshType);
               } else {
                    toast.error(response?.message || "Failed to save commission default.");
               }
          } catch (submitError) {
               console.error(submitError);
               toast.error("Failed to save commission default.");
          } finally {
               setSaving(false);
          }
     };

     const handleEdit = (commissionDefault: CommissionDefault) => {
          setEditingId(commissionDefault.id ?? null);
          setSelectedRecipientType(commissionDefault.recipient_type);
          setSelectedRecipientId(commissionDefault.recipient_id ?? null);
          const active = commissionDefault.is_active === 1 || commissionDefault.is_active === true;
          setFormState({
               commission_config_id: commissionDefault.commission_config_id.toString(),
               is_active: active,
          });
     };

     const handleToggleActive = async (commissionDefault: CommissionDefault) => {
          if (!commissionDefault.id) return;
          try {
               setSaving(true);
               const response = await updateCommissionDefault(commissionDefault.id, {
                    is_active: !(commissionDefault.is_active === 1 || commissionDefault.is_active === true),
               });
               if (response?.status === "success") {
                    toast.success("Commission default status updated.");
                    loadDefaults(selectedRecipientType);
               } else {
                    toast.error(response?.message || "Failed to update status.");
               }
          } catch (toggleError) {
               console.error(toggleError);
               toast.error("Failed to update status.");
          } finally {
               setSaving(false);
          }
     };

     const handleDelete = async (commissionDefault: CommissionDefault) => {
          if (!commissionDefault.id) return;
          const confirmed = window.confirm("Delete this default commission? This cannot be undone.");
          if (!confirmed) return;

          try {
               setSaving(true);
               const response = await deleteCommissionDefault(commissionDefault.id);
               if (response?.status === "success") {
                    toast.success("Commission default deleted.");
                    loadDefaults(selectedRecipientType);
               } else {
                    toast.error(response?.message || "Failed to delete commission default.");
               }
          } catch (deleteError) {
               console.error(deleteError);
               toast.error("Failed to delete commission default.");
          } finally {
               setSaving(false);
          }
     };

     return (
          <div className="container-fluid px-4 py-3">
               <div className="mb-4">
                    <h1 className="h3 mb-1">Commission Defaults</h1>
                    <p className="text-muted">
                         Manage fallback commission defaults for clinicians and organizations when no explicit assignment applies.
                    </p>
               </div>

               <div className="row g-3 mb-4">
                    <div className="col-lg-5">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-header bg-light py-3">
                                   <h5 className="mb-0">{editingId ? "Edit Default" : "Create Default"}</h5>
                              </div>
                              <div className="card-body">
                                   {error && (
                                        <div className="alert alert-danger py-2" role="alert">
                                             {error}
                                        </div>
                                   )}

                                   <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                             <label className="form-label">Recipient Type</label>
                                             <select
                                                  className="form-select"
                                                  value={selectedRecipientType}
                                                  onChange={(event) => {
                                                       setSelectedRecipientType(event.target.value);
                                                       setSelectedRecipientId(null);
                                                  }}
                                             >
                                                  <option value="">Select recipient type</option>
                                                  <option value="clinician">Clinician</option>
                                                  <option value="organization">Organization</option>
                                             </select>
                                        </div>

                                        <div className="mb-3">
                                             <label className="form-label">Recipient</label>
                                             <select
                                                  className="form-select"
                                                  value={selectedRecipientId ?? ""}
                                                  onChange={(event) => setSelectedRecipientId(event.target.value ? Number(event.target.value) : null)}
                                                  disabled={!selectedRecipientType || loadingRecipients}
                                             >
                                                  <option value="">All {selectedRecipientType === "organization" ? "organizations" : "clinicians"}</option>
                                                  {recipients.map((recipient) => (
                                                       <option key={recipient.id} value={recipient.id}>
                                                            {recipient.label}
                                                       </option>
                                                  ))}
                                             </select>
                                             {loadingRecipients && (
                                                  <div className="form-text text-muted">Loading recipients...</div>
                                             )}
                                        </div>

                                        <div className="mb-3">
                                             <label className="form-label">Commission Configuration</label>
                                             <select
                                                  name="commission_config_id"
                                                  value={formState.commission_config_id}
                                                  onChange={handleInputChange}
                                                  className="form-select"
                                                  disabled={!selectedRecipientType}
                                             >
                                                  <option value="">Select configuration</option>
                                                  {configs.map((config) => (
                                                       <option key={config.id} value={config.id}>
                                                            {config.name} ({formatCommissionType(config.commission_type)})
                                                       </option>
                                                  ))}
                                             </select>
                                        </div>

                                        <div className="form-check form-switch mb-3">
                                             <input
                                                  className="form-check-input"
                                                  type="checkbox"
                                                  id="isActive"
                                                  name="is_active"
                                                  checked={formState.is_active}
                                                  onChange={handleInputChange}
                                             />
                                             <label className="form-check-label" htmlFor="isActive">
                                                  Active
                                             </label>
                                        </div>

                                        <div className="d-flex gap-2">
                                             <button type="submit" className="btn btn-primary" disabled={saving}>
                                                  {saving ? "Saving..." : editingId ? "Update Default" : "Create Default"}
                                             </button>
                                             <button type="button" className="btn btn-outline-secondary" onClick={resetForm} disabled={saving}>
                                                  Reset
                                             </button>
                                        </div>
                                   </form>
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-7">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-header bg-light py-3 d-flex justify-content-between align-items-center">
                                   <div>
                                        <h5 className="mb-0">Current Defaults</h5>
                                        <small className="text-muted">{selectedRecipientType ? `${defaults.length} configured fallback defaults` : "Select a recipient type to load defaults"}</small>
                                   </div>
                                   <button className="btn btn-sm btn-outline-secondary" onClick={() => loadDefaults(selectedRecipientType, selectedRecipientId ?? undefined)} disabled={loading || saving || !selectedRecipientType}>
                                        <RiRefreshLine size={16} className="me-1" /> Refresh
                                   </button>
                              </div>
                              <div className="card-body p-0">
                                   {loading ? (
                                        <div className="d-flex flex-column justify-content-center align-items-center p-5">
                                             <RiLoader4Line size={36} className="animate-spin mb-3 text-primary" />
                                             <p className="text-muted mb-0">Loading defaults...</p>
                                        </div>
                                   ) : !selectedRecipientType ? (
                                        <div className="p-4 text-center text-muted">
                                             Select a recipient type above to load commission defaults.
                                        </div>
                                   ) : defaults.length === 0 ? (
                                        <div className="p-4 text-center text-muted">
                                             No commission defaults configured yet for the selected recipient type.
                                        </div>
                                   ) : (
                                        <div className="table-responsive">
                                             <table className="table table-sm table-hover mb-0">
                                                  <thead className="table-light text-start">
                                                       <tr>
                                                            <th>#</th>
                                                            <th>Recipient</th>
                                                            <th>Config</th>
                                                            <th>Status</th>
                                                            <th>Created</th>
                                                            <th className="text-end">Actions</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {defaults.map((item, index) => (
                                                            <tr key={item.id ?? `${item.recipient_type}-${index}`}>
                                                                 <td>{index + 1}</td>
                                                                 <td>
                                                                      <div className="fw-bold text-capitalize">{item.recipient_type}</div>
                                                                      <div className="small text-muted">{getRecipientLabel(item)}</div>
                                                                 </td>
                                                                 <td>
                                                                      <div>{item.config?.name || configMap[item.commission_config_id]?.name || `#${item.commission_config_id}`}</div>
                                                                      <small className="text-muted">
                                                                           {formatCommissionType(item.config?.commission_type || configMap[item.commission_config_id]?.commission_type || "")}
                                                                      </small>
                                                                 </td>
                                                                 <td>
                                                                      <span className={`badge ${item.is_active ? "bg-success" : "bg-secondary"}`}>
                                                                           {item.is_active ? "Active" : "Inactive"}
                                                                      </span>
                                                                 </td>
                                                                 <td>
                                                                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
                                                                 </td>
                                                                 <td className="text-end">
                                                                      <div className="d-flex justify-content-end gap-1 flex-wrap">
                                                                           <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-outline-primary"
                                                                                onClick={() => handleEdit(item)}
                                                                           >
                                                                                Edit
                                                                           </button>
                                                                           <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-outline-success"
                                                                                onClick={() => handleToggleActive(item)}
                                                                           >
                                                                                {item.is_active ? "Disable" : "Enable"}
                                                                           </button>
                                                                           <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={() => handleDelete(item)}
                                                                           >
                                                                                Delete
                                                                           </button>
                                                                      </div>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
