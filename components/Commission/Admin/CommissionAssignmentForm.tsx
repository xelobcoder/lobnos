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
     formatScopeType,
} from "../../../lib/commission/commissionHelpers";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import { customFetch } from "../../Auth/customFetch";
import Loader from "../../isLoading";

interface CommissionAssignmentFormProps {
     assignmentId?: number;
     onSaved?: (assignment: CommissionAssignment) => void;
     onCancel?: () => void;
}

type CommissionAssignmentFormValues = {
     commission_config_id: number;
     scope_type: "clinician" | "organization" | "system";
     scope_id?: number;
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
     const { applicationsettings } = useApplicationSettings();
     const [loading, setLoading] = useState(assignmentId ? true : false);
     const [saving, setSaving] = useState(false);
     const [configs, setConfigs] = useState<CommissionConfig[]>([]);
     const [loadingConfigs, setLoadingConfigs] = useState(true);
     const [recipients, setRecipients] = useState<{ id: number; label: string }[]>([]);
     const [loadingRecipients, setLoadingRecipients] = useState(false);

     const {
          control,
          watch,
          handleSubmit,
          setValue,
          formState: { errors },
     } = useForm<CommissionAssignmentFormValues>({
          resolver: yupResolver(commissionAssignmentSchema),
          defaultValues: {
               scope_type: "clinician",
               priority: 1,
               is_active: true,
          },
     });

     const tenantId = applicationsettings?.tenantid || 1;
     const scopeType = watch("scope_type");

     const loadRecipients = async (type: "clinician" | "organization") => {
          setLoadingRecipients(true);
          setRecipients([]);
          try {
               if (type === "clinician") {
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
                    const response = await getCommissionConfigs(tenantId);
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
     }, [tenantId]);

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
                         const response = await getCommissionAssignment(assignmentId, tenantId);
                         if (response?.status === "success") {
                              const assignment = response.result;
                              setValue("commission_config_id", assignment.commission_config_id);
                              setValue("scope_type", assignment.scope_type);
                              setValue("scope_id", assignment.scope_id ?? undefined);
                              setValue("service_id", assignment.service_id ?? undefined);
                              setValue("service_category", assignment.service_category ?? undefined);
                              setValue("priority", assignment.priority);
                              setValue("assigned_from", assignment.assigned_from ?? "");
                              setValue("assigned_to", assignment.assigned_to ?? undefined);
                              setValue("is_active", assignment.is_active);
                         }
                    } catch (error) {
                         toast.error("Failed to load assignment");
                    } finally {
                         setLoading(false);
                    }
               };
               fetchAssignment();
          }
     }, [assignmentId, tenantId, setValue]);

     const onSubmit = async (data: CommissionAssignmentFormValues) => {
          try {
               setSaving(true);
               const payload: CommissionAssignment = {
                    ...data,
                    scope_id: data.scope_type === "system" ? null : data.scope_id ?? null,
                    service_id: data.service_id ?? null,
                    service_category: data.service_category ?? undefined,
                    assigned_to: data.assigned_to ?? undefined,
                    tenantId,
               };

               const response = assignmentId
                    ? await updateCommissionAssignment(assignmentId, tenantId, payload)
                    : await createCommissionAssignment(payload);

               if (response?.status === "success") {
                    toast.success(
                         assignmentId
                              ? "Assignment updated successfully"
                              : "Assignment created successfully"
                    );
                    if (onSaved) {
                         onSaved(response.result);
                    }
               } else {
                    toast.error(response?.message || "Failed to save assignment");
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
          <div className="card">
               <div className="card-body">
                    <form onSubmit={handleSubmit(onSubmit)}>
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
                              <small className="text-muted d-block mt-1">
                                   {scopeType === "clinician" &&
                                        "Assign to a specific clinician"}
                                   {scopeType === "organization" &&
                                        "Assign to an entire organization"}
                                   {scopeType === "system" &&
                                        "Apply to all clinicians system-wide"}
                              </small>
                         </div>

                         {/* Scope ID (for clinician/organization) */}
                         {scopeType !== "system" && (
                              <div className="mb-3">
                                   <label htmlFor="scope_id" className="form-label fw-medium">
                                        {scopeType === "clinician" ? "Clinician" : "Organization"}
                                        <span className="text-danger">*</span>
                                   </label>
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
                                                       field.onChange(value === "" ? null : Number(value));
                                                  }}
                                             >
                                                  <option value="">Select {scopeType === "clinician" ? "clinician" : "organization"}</option>
                                                  {loadingRecipients ? (
                                                       <option value="">Loading recipients...</option>
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
                                   {errors.scope_id && (
                                        <div className="invalid-feedback d-block">
                                             {errors.scope_id.message}
                                        </div>
                                   )}
                                   <small className="text-muted d-block mt-1">
                                        Select the {scopeType === "clinician" ? "clinician" : "organization"} this assignment should apply to.
                                   </small>
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
          </div>
     );
}
