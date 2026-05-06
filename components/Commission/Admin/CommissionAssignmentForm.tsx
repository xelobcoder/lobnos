"use client";

import React, { useState, useEffect } from "react";
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
import Loader from "../../isLoading";

interface CommissionAssignmentFormProps {
     assignmentId?: number;
     onSaved?: (assignment: CommissionAssignment) => void;
     onCancel?: () => void;
}

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

     const {
          control,
          watch,
          handleSubmit,
          setValue,
          formState: { errors },
     } = useForm<CommissionAssignment>({
          resolver: yupResolver(commissionAssignmentSchema),
          defaultValues: {
               scope_type: "clinician",
               priority: 100,
               is_active: true,
               tenantId: applicationsettings?.tenantid || 1,
          },
     });

     const tenantId = applicationsettings?.tenantid || 1;
     const scopeType = watch("scope_type");

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

     // Load existing assignment
     useEffect(() => {
          if (assignmentId) {
               const fetchAssignment = async () => {
                    try {
                         const response = await getCommissionAssignment(assignmentId, tenantId);
                         if (response?.status === "success") {
                              const assignment = response.result;
                              setValue("commission_config_id", assignment.commission_config_id);
                              setValue("scope_type", assignment.scope_type);
                              setValue("scope_id", assignment.scope_id);
                              setValue("service_id", assignment.service_id);
                              setValue("service_category", assignment.service_category);
                              setValue("priority", assignment.priority);
                              setValue("assigned_from", assignment.assigned_from);
                              setValue("assigned_to", assignment.assigned_to);
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

     const onSubmit = async (data: CommissionAssignment) => {
          try {
               setSaving(true);
               data.tenantId = tenantId;

               const response = assignmentId
                    ? await updateCommissionAssignment(assignmentId, tenantId, data)
                    : await createCommissionAssignment(data);

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
                                        {scopeType === "clinician" ? "Clinician ID" : "Organization ID"}
                                        <span className="text-danger">*</span>
                                   </label>
                                   <Controller
                                        name="scope_id"
                                        control={control}
                                        render={({ field }) => (
                                             <input
                                                  {...field}
                                                  type="number"
                                                  className={`form-control ${errors.scope_id ? "is-invalid" : ""
                                                       }`}
                                                  placeholder={scopeType === "clinician" ? "e.g., 42" : "e.g., 5"}
                                             />
                                        )}
                                   />
                                   {errors.scope_id && (
                                        <div className="invalid-feedback d-block">
                                             {errors.scope_id.message}
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
                                                  {...field}
                                                  type="number"
                                                  className="form-control"
                                                  placeholder="Leave empty for all services"
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
                                                  {...field}
                                                  type="text"
                                                  className="form-control"
                                                  placeholder="e.g., Lab, Imaging"
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
                                             className={`form-control ${errors.priority ? "is-invalid" : ""
                                                  }`}
                                             placeholder="1-1000 (higher = more specific)"
                                        />
                                   )}
                              />
                              {errors.priority && (
                                   <div className="invalid-feedback d-block">
                                        {errors.priority.message}
                                   </div>
                              )}
                              <small className="text-muted d-block mt-1">
                                   Higher priority overrides lower priority assignments. Clinician assignments
                                   typically have priority 100+, organization 50+, system-wide 10+.
                              </small>
                         </div>

                         {/* Validity Period */}
                         <div className="row">
                              <div className="col-md-6 mb-3">
                                   <label htmlFor="assigned_from" className="form-label fw-medium">
                                        Assigned From
                                   </label>
                                   <Controller
                                        name="assigned_from"
                                        control={control}
                                        render={({ field }) => (
                                             <input {...field} type="date" className="form-control" />
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
                                             <input {...field} type="date" className="form-control" />
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
                                                  {...field}
                                                  type="checkbox"
                                                  className="form-check-input"
                                                  id="is_active"
                                                  checked={field.value}
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
