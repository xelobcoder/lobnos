"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import {
     CommissionAssignment,
     CommissionConfig,
     createCommissionAssignment,
     updateCommissionAssignment,
     getCommissionAssignment,
     getCommissionConfigs,
} from "../../../lib/commission/commissionApi";
import {
     commissionAssignmentSchema,
} from "../../../lib/commission/commissionHelpers";
import { customFetch } from "../../Auth/customFetch";
import Loader from "../../isLoading";
import { RiArrowRightSLine, RiCloseLine, RiCheckLine } from "@remixicon/react";

interface CommissionAssignmentFormProps {
     assignmentId?: number;
     onSaved?: (assignment: CommissionAssignment) => void;
     onCancel?: () => void;
}

type CommissionAssignmentFormValues = {
     commission_config_id: number;
     scope_type: "clinician" | "organization" | "system";
     scope_id?: number;
     scope_ids?: number[];
     service_id?: number | null;
     service_category?: string | null;
     priority: number;
     assigned_from: string;
     assigned_to?: string | null;
     is_active: boolean;
};

export default function CommissionAssignmentForm({
     assignmentId,
     onSaved,
     onCancel,
}: CommissionAssignmentFormProps) {
     const [loading, setLoading] = useState(assignmentId ? true : false);
     const [saving, setSaving] = useState(false);
     const [configs, setConfigs] = useState<CommissionConfig[]>([]);
     const [loadingConfigs, setLoadingConfigs] = useState(true);
     const [recipients, setRecipients] = useState<{ id: number; label: string }[]>([]);
     const [loadingRecipients, setLoadingRecipients] = useState(false);
     const [availableSearch, setAvailableSearch] = useState("");

     const {
          control,
          watch,
          handleSubmit,
          setValue,
          reset,
          formState: { errors },
     } = useForm<CommissionAssignmentFormValues>({
          resolver: yupResolver(commissionAssignmentSchema) as any,
          defaultValues: {
               scope_type: "clinician",
               priority: 1,
               is_active: true,
               scope_ids: [],
          },
     });

     const scopeType = watch("scope_type");
     const selectedIds = watch("scope_ids") || [];

     const availableRecipients = recipients.filter(
          (r) => !selectedIds.includes(r.id) &&
               r.label.toLowerCase().includes(availableSearch.toLowerCase())
     );

     const selectedRecipients = recipients.filter((r) => selectedIds.includes(r.id));

     const handleAddRecipient = (id: number) => {
          setValue("scope_ids", [...selectedIds, id]);
     };

     const handleRemoveRecipient = (id: number) => {
          setValue("scope_ids", selectedIds.filter((selectedId) => selectedId !== id));
     };

     const handleAddAll = () => {
          const newIds = [...selectedIds, ...availableRecipients.map(r => r.id)];
          setValue("scope_ids", newIds);
     };

     const handleRemoveAll = () => {
          setValue("scope_ids", []);
     };

     const loadRecipients = async (type: "clinician" | "organization") => {
          setLoadingRecipients(true);
          setRecipients([]);
          try {
               let url = type === "clinician" ? "clinicians" : "organization";
               const response = await customFetch(url);

               if (type === "clinician") {
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
                    const organizationList = response?.organizations ?? response?.result ?? [];
                    const options = Array.isArray(organizationList)
                         ? organizationList.map((item: any) => ({
                              id: Number(item.id),
                              label: item.name || item.org_name || `Organization ${item.id}`,
                         }))
                         : [];
                    setRecipients(options);
               }
          } catch (error) {
               console.error(error);
               setRecipients([]);
               toast.error("Failed to load recipients for this scope type.");
          } finally {
               setLoadingRecipients(false);
          }
     };

     // Load configurations
     useEffect(() => {
          const fetchConfigs = async () => {
               try {
                    const response = await getCommissionConfigs();
                    if (response?.status === "success") {
                         setConfigs(response.result || []);
                    }
               } catch (error) {
                    toast.error("Failed to load configurations");
               } finally {
                    setLoadingConfigs(false);
               }
          };
          fetchConfigs();
     }, []);

     useEffect(() => {
          if (scopeType === "clinician" || scopeType === "organization") {
               loadRecipients(scopeType);
          } else {
               setRecipients([]);
          }
     }, [scopeType]);

     useEffect(() => {
          if (assignmentId) {
               const fetchAssignment = async () => {
                    try {
                         const response = await getCommissionAssignment(assignmentId);
                         if (response?.status === "success") {
                              const assignment = response.result;
                              const currentScopeType = assignment.scope_type || "clinician";
                              const currentScopeId = assignment.scope_id ?? undefined;

                              reset({
                                   commission_config_id: assignment.commission_config_id,
                                   scope_type: currentScopeType,
                                   scope_id: currentScopeId,
                                   scope_ids: currentScopeId ? [currentScopeId] : [],
                                   service_id: assignment.service_id ?? undefined,
                                   service_category: assignment.service_category ?? undefined,
                                   priority: assignment.priority ?? 1,
                                   assigned_from: assignment.assigned_from ?? "",
                                   assigned_to: assignment.assigned_to ?? undefined,
                                   is_active: Boolean(assignment.is_active),
                              });

                              if (currentScopeType === "clinician" || currentScopeType === "organization") {
                                   await loadRecipients(currentScopeType);
                                   setValue("scope_id", currentScopeId);
                                   setValue("scope_ids", currentScopeId ? [currentScopeId] : []);
                              }
                         }
                    } catch (error) {
                         toast.error("Failed to load assignment");
                    } finally {
                         setLoading(false);
                    }
               };
               fetchAssignment();
          }
     }, [assignmentId, reset, setValue]);

     const onSubmit = async (data: CommissionAssignmentFormValues) => {
          try {
               setSaving(true);
               const normalizedScopeId = data.scope_type === "system"
                    ? null
                    : data.scope_id ?? data.scope_ids?.[0] ?? null;

               if (assignmentId) {
                    const payload: CommissionAssignment = {
                         ...data,
                         scope_id: normalizedScopeId,
                         service_id: data.service_id ?? null,
                         service_category: data.service_category ?? undefined,
                         assigned_to: data.assigned_to ?? undefined,
                    };
                    const response = await updateCommissionAssignment(assignmentId, payload);
                    if (response?.status === "success") {
                         toast.success("Assignment updated successfully");
                         if (onSaved) onSaved(response.result as CommissionAssignment);
                    } else {
                         toast.error(response?.message || "Failed to save assignment");
                    }
               } else {
                    if (data.scope_type !== "system" && data.scope_ids && data.scope_ids.length > 0) {
                         const payloads: CommissionAssignment[] = data.scope_ids.map((id) => {
                              const { scope_ids, ...rest } = data;
                              return {
                                   ...rest,
                                   scope_id: id,
                                   service_id: data.service_id ?? null,
                                   service_category: data.service_category ?? undefined,
                                   assigned_to: data.assigned_to ?? undefined,
                              };
                         });
                         const response = await createCommissionAssignment(payloads);
                         if (response?.status === "success") {
                              toast.success("Batch assignments created successfully");
                              if (onSaved) onSaved(response.result as CommissionAssignment);
                         } else {
                              toast.error(response?.message || "Failed to save assignments");
                         }
                    } else {
                         const payload: CommissionAssignment = {
                              ...data,
                              scope_id: data.scope_type === "system" ? null : data.scope_id ?? null,
                              service_id: data.service_id ?? null,
                              service_category: data.service_category ?? undefined,
                              assigned_to: data.assigned_to ?? undefined,
                         };
                         const response = await createCommissionAssignment(payload);
                         if (response?.status === "success") {
                              toast.success("Assignment created successfully");
                              if (onSaved) onSaved(response.result as CommissionAssignment);
                         } else {
                              toast.error(response?.message || "Failed to save assignment");
                         }
                    }
               }
          } catch (error: any) {
               toast.error(error?.message || "An error occurred");
          } finally {
               setSaving(false);
          }
     };

     if (loading || loadingConfigs) {
          return <Loader />;
     }

     if (configs.length === 0) {
          return (
               <div className="alert alert-warning">
                    <p className="mb-0">
                         No commission configurations found. Please create a configuration first.
                    </p>
               </div>
          );
     }

     return (
          <div className="border rounded p-3 bg-white">
               <form onSubmit={handleSubmit(onSubmit as any)}>
                    {/* Commission Config */}
                    <div className="mb-3">
                         <label htmlFor="commission_config_id" className="form-label fw-medium">
                              Commission Configuration <span className="text-danger">*</span>
                         </label>
                         <Controller
                              name="commission_config_id"
                              control={control}
                              render={({ field }) => (
                                   <select
                                        {...field}
                                        className={`form-select ${errors.commission_config_id ? "is-invalid" : ""
                                             }`}
                                   >
                                        <option value="">Select a configuration</option>
                                        {configs.map((config) => (
                                             <option key={config.id} value={config.id}>
                                                  {config.name}
                                             </option>
                                        ))}
                                   </select>
                              )}
                         />
                         {errors.commission_config_id && (
                              <div className="invalid-feedback d-block">
                                   {errors.commission_config_id.message}
                              </div>
                         )}
                    </div>

                    {/* Scope Type */}
                    <div className="mb-3">
                         <label htmlFor="scope_type" className="form-label fw-medium">
                              Assign To <span className="text-danger">*</span>
                         </label>
                         <Controller
                              name="scope_type"
                              control={control}
                              render={({ field }) => (
                                   <select
                                        {...field}
                                        className={`form-select ${errors.scope_type ? "is-invalid" : ""
                                             }`}
                                        onChange={(event) => {
                                             field.onChange(event);
                                             setValue("scope_id", undefined);
                                             setValue("scope_ids", []);
                                        }}
                                   >
                                        <option value="clinician">Clinician</option>
                                        <option value="organization">Organization</option>
                                        <option value="system">System-wide (All)</option>
                                   </select>
                              )}
                         />
                         {errors.scope_type && (
                              <div className="invalid-feedback d-block">
                                   {errors.scope_type.message}
                              </div>
                         )}
                    </div>

                    {/* Scope ID (for clinician/organization) */}
                    {scopeType !== "system" && (
                         <div className="mb-4">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                   <label className="form-label fw-medium mb-0">
                                        {assignmentId ? "Confirm Selection" : `Select ${scopeType === "clinician" ? "Clinicians" : "Organizations"}`}
                                        <span className="text-danger">*</span>
                                   </label>
                              </div>

                              {assignmentId ? (
                                   <Controller
                                        name="scope_id"
                                        control={control}
                                        render={({ field }) => (
                                             <select
                                                  {...field}
                                                  className={`form-select ${errors.scope_id ? "is-invalid" : ""}`}
                                                  value={field.value ?? ""}
                                                  onChange={(event) => {
                                                       const value = event.target.value;
                                                       const numericValue = value === "" ? null : Number(value);
                                                       field.onChange(numericValue);
                                                       setValue("scope_ids", numericValue === null ? [] : [numericValue]);
                                                  }}
                                             >
                                                  <option value="">Select {scopeType === "clinician" ? "clinician" : "organization"}</option>
                                                  {loadingRecipients ? (
                                                       <option value="">Loading...</option>
                                                  ) : (
                                                       recipients.map((recipient) => (
                                                            <option key={recipient.id} value={recipient.id}>
                                                                 {recipient.label}
                                                            </option>
                                                       ))
                                                  )}
                                             </select>
                                        )}
                                   />
                              ) : (
                                   <div className="row g-3">
                                        {/* Available List */}
                                        <div className="col-md-6">
                                             <div className="card h-100 border shadow-none">
                                                  <div className="card-header bg-light py-2 px-3 d-flex justify-content-between align-items-center">
                                                       <span className="small fw-bold text-uppercase">Available</span>
                                                       <button
                                                            type="button"
                                                            className="btn btn-link btn-sm p-0 text-decoration-none small"
                                                            onClick={handleAddAll}
                                                            disabled={availableRecipients.length === 0}
                                                       >
                                                            Add All
                                                       </button>
                                                  </div>
                                                  <div className="p-2 border-bottom bg-light">
                                                       <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="Search available..."
                                                            value={availableSearch}
                                                            onChange={(e) => setAvailableSearch(e.target.value)}
                                                       />
                                                  </div>
                                                  <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: "250px", minHeight: "200px" }}>
                                                       {loadingRecipients ? (
                                                            <div className="p-3 text-center small text-muted">Loading...</div>
                                                       ) : availableRecipients.length === 0 ? (
                                                            <div className="p-3 text-center small text-muted">No recipients available.</div>
                                                       ) : (
                                                            availableRecipients.map((recipient) => (
                                                                 <button
                                                                      key={recipient.id}
                                                                      type="button"
                                                                      className="list-group-item list-group-item-action py-2 px-3 small d-flex justify-content-between align-items-center"
                                                                      onClick={() => handleAddRecipient(recipient.id)}
                                                                 >
                                                                      {recipient.label}
                                                                      <RiArrowRightSLine size={16} className="text-muted" />
                                                                 </button>
                                                            ))
                                                       )}
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Selected List */}
                                        <div className="col-md-6">
                                             <div className="card h-100 border shadow-none">
                                                  <div className="card-header bg-light py-2 px-3 d-flex justify-content-between align-items-center">
                                                       <span className="small fw-bold text-uppercase">Selected ({selectedIds.length})</span>
                                                       <button
                                                            type="button"
                                                            className="btn btn-link btn-sm p-0 text-decoration-none small text-danger"
                                                            onClick={handleRemoveAll}
                                                            disabled={selectedIds.length === 0}
                                                       >
                                                            Clear All
                                                       </button>
                                                  </div>
                                                  <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: "250px", minHeight: "200px" }}>
                                                       {selectedRecipients.length === 0 ? (
                                                            <div className="p-3 text-center small text-muted italic">Nothing selected yet</div>
                                                       ) : (
                                                            selectedRecipients.map((recipient) => (
                                                                 <button
                                                                      key={recipient.id}
                                                                      type="button"
                                                                      className="list-group-item list-group-item-action py-2 px-3 small d-flex justify-content-between align-items-center bg-light"
                                                                      onClick={() => handleRemoveRecipient(recipient.id)}
                                                                 >
                                                                      <span className="d-flex align-items-center">
                                                                           <RiCheckLine size={16} className="text-success me-2" />
                                                                           {recipient.label}
                                                                      </span>
                                                                      <RiCloseLine size={16} className="text-danger" />
                                                                 </button>
                                                            ))
                                                       )}
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              )}
                              {(errors.scope_id || errors.scope_ids) && (
                                   <div className="text-danger small mt-2">
                                        {errors.scope_id?.message || errors.scope_ids?.message}
                                   </div>
                              )}
                         </div>
                    )}

                    {/* Service Filter (Optional) */}
                    <div className="row">
                         <div className="col-md-6 mb-3">
                              <label htmlFor="service_id" className="form-label fw-medium">
                                   Service ID (Optional)
                              </label>
                              <Controller
                                   name="service_id"
                                   control={control}
                                   render={({ field }) => (
                                        <input
                                             type="number"
                                             className="form-control"
                                             placeholder="Leave empty for all services"
                                             value={field.value ?? ""}
                                             onChange={(event) => {
                                                  const value = event.target.value;
                                                  field.onChange(value === "" ? null : Number(value));
                                             }}
                                             onBlur={field.onBlur}
                                             name={field.name}
                                             ref={field.ref}
                                        />
                                   )}
                              />
                              <small className="text-muted">
                                   Limit this assignment to a specific service
                              </small>
                         </div>

                         <div className="col-md-6 mb-3">
                              <label htmlFor="service_category" className="form-label fw-medium">
                                   Service Category (Optional)
                              </label>
                              <Controller
                                   name="service_category"
                                   control={control}
                                   render={({ field }) => (
                                        <input
                                             type="text"
                                             className="form-control"
                                             placeholder="e.g., Lab, Imaging"
                                             value={field.value ?? ""}
                                             onChange={field.onChange}
                                             onBlur={field.onBlur}
                                             name={field.name}
                                             ref={field.ref}
                                        />
                                   )}
                              />
                              <small className="text-muted">
                                   Limit this assignment to a service category
                              </small>
                         </div>
                    </div>

                    {/* Priority */}
                    <div className="mb-3">
                         <label htmlFor="priority" className="form-label fw-medium">
                              Priority <span className="text-danger">*</span>
                         </label>
                         <Controller
                              name="priority"
                              control={control}
                              render={({ field }) => (
                                   <input
                                        {...field}
                                        type="number"
                                        className={`form-control ${errors.priority ? "is-invalid" : ""}`}
                                        placeholder="1-10 (higher = more specific)"
                                        value={field.value ?? ""}
                                   />
                              )}
                         />
                         {errors.priority && (
                              <div className="invalid-feedback d-block">
                                   {errors.priority.message}
                              </div>
                         )}
                         <small className="text-muted d-block mt-1">
                              Higher priority overrides lower priority assignments. More specific assignments
                              should use a higher priority value within the 1-10 range.
                         </small>
                    </div>

                    {/* Validity Period */}
                    <div className="row">
                         <div className="col-md-6 mb-3">
                              <label htmlFor="assigned_from" className="form-label fw-medium">
                                   Assigned From <span className="text-danger">*</span>
                              </label>
                              <Controller
                                   name="assigned_from"
                                   control={control}
                                   render={({ field }) => (
                                        <input
                                             type="date"
                                             className="form-control"
                                             value={field.value ?? ""}
                                             onChange={field.onChange}
                                             onBlur={field.onBlur}
                                             name={field.name}
                                             ref={field.ref}
                                        />
                                   )}
                              />
                         </div>

                         <div className="col-md-6 mb-3">
                              <label htmlFor="assigned_to" className="form-label fw-medium">
                                   Assigned To
                              </label>
                              <Controller
                                   name="assigned_to"
                                   control={control}
                                   render={({ field }) => (
                                        <input
                                             type="date"
                                             className="form-control"
                                             value={field.value ?? ""}
                                             onChange={field.onChange}
                                             onBlur={field.onBlur}
                                             name={field.name}
                                             ref={field.ref}
                                        />
                                   )}
                              />
                         </div>
                    </div>

                    {/* Active Status */}
                    <div className="mb-3">
                         <div className="form-check">
                              <Controller
                                   name="is_active"
                                   control={control}
                                   render={({ field }) => (
                                        <input
                                             type="checkbox"
                                             className="form-check-input"
                                             id="is_active"
                                             checked={field.value}
                                             onChange={(event) => field.onChange(event.target.checked)}
                                        />
                                   )}
                              />
                              <label className="form-check-label" htmlFor="is_active">
                                   Active
                              </label>
                         </div>
                    </div>

                    {/* Info Box */}
                    <div className="alert alert-info small mb-3">
                         <h6 className="fw-bold mb-2">Resolution Priority</h6>
                         <p className="mb-0">
                              When a service is billed, the system searches for a matching commission in
                              this order: 1) Clinician-specific 2) Organization-wide 3) System-wide 4)
                              Defaults. The assignment with the highest priority wins.
                         </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 pt-3">
                         <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={saving}
                         >
                              {saving ? (
                                   <>
                                        <span
                                             className="spinner-border spinner-border-sm me-2"
                                             role="status"
                                             aria-hidden="true"
                                        ></span>
                                        Saving...
                                   </>
                              ) : (
                                   "Save Assignment"
                              )}
                         </button>
                         {onCancel && (
                              <button
                                   type="button"
                                   className="btn btn-secondary"
                                   onClick={onCancel}
                              >
                                   Cancel
                              </button>
                         )}
                    </div>
               </form>
          </div>
     );
}
