'use client'
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { customPost, customFetch } from '../../../../components/Auth/customFetch'
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext'

export default function CommissionDefaults() {
     const { applicationsettings } = useApplicationSettings()
     const [commissions, setCommissions] = useState({
          organization_type: 'percentage',
          organization_value: 0,
          organization_id: null,
          clinician_type: 'percentage',
          clinician_value: 0,
          clinician_id: null
     })
     const [loading, setLoading] = useState(true)
     const [saving, setSaving] = useState(false)

     useEffect(() => {
          const fetchCommissions = async () => {
               try {
                    const response = await customFetch('commission-defaults')
                    if (response?.status === 'success' && response?.statusCode === 200) {
                         const defaults = response.result || []

                         // Initialize with defaults
                         const newCommissions = {
                              organization_type: 'percentage',
                              organization_value: 0,
                              organization_id: null,
                              clinician_type: 'percentage',
                              clinician_value: 0,
                              clinician_id: null
                         }

                         // Map the array response to state
                         if (Array.isArray(defaults)) {
                              defaults.forEach((item: any) => {
                                   const targetType = item.target_type?.toUpperCase()
                                   const commissionType = item.commission_type?.toLowerCase() || 'percentage'
                                   const commissionValue = parseFloat(item.commission_value) || 0

                                   if (targetType === 'ORGANIZATION') {
                                        newCommissions.organization_type = commissionType
                                        newCommissions.organization_value = commissionValue
                                        newCommissions.organization_id = item.id
                                   } else if (targetType === 'CLINICIAN') {
                                        newCommissions.clinician_type = commissionType
                                        newCommissions.clinician_value = commissionValue
                                        newCommissions.clinician_id = item.id
                                   }
                              })
                         }

                         setCommissions(newCommissions)
                    }
               } catch (error) {
                    console.error('Failed to fetch commissions:', error)
                    toast.error('Failed to load commission defaults')
               } finally {
                    setLoading(false)
               }
          }
          fetchCommissions()
     }, [])

     const handleSave = async () => {
          setSaving(true)
          try {
               // Prepare request bodies for organization and clinician
               const orgBody = {
                    target_type: 'ORGANIZATION',
                    commission_type: commissions.organization_type.toUpperCase(),
                    commission_value: commissions.organization_value
               }

               const clinBody = {
                    target_type: 'CLINICIAN',
                    commission_type: commissions.clinician_type.toUpperCase(),
                    commission_value: commissions.clinician_value
               }

               let allSuccess = true
               let errorMessage = ''

               // Save organization commission
               try {
                    let orgResponse
                    if (commissions.organization_id) {
                         orgResponse = await customPost(
                              `commission-defaults/${commissions.organization_id}`,
                              'PUT',
                              orgBody
                         )
                    } else {
                         orgResponse = await customPost(
                              'commission-defaults',
                              'POST',
                              orgBody
                         )
                    }

                    if (orgResponse?.status === 'success') {
                         // Update organization ID if creating new
                         if (!commissions.organization_id && orgResponse?.result?.id) {
                              setCommissions(prev => ({
                                   ...prev,
                                   organization_id: orgResponse.result.id
                              }))
                         }
                    } else {
                         allSuccess = false
                         errorMessage = orgResponse?.message || 'Failed to save organization commission'
                    }
               } catch (error) {
                    allSuccess = false
                    errorMessage = 'Error saving organization commission'
                    console.error(errorMessage, error)
               }

               // Save clinician commission
               try {
                    let clinResponse
                    if (commissions.clinician_id) {
                         clinResponse = await customPost(
                              `commission-defaults/${commissions.clinician_id}`,
                              'PUT',
                              clinBody
                         )
                    } else {
                         clinResponse = await customPost(
                              'commission-defaults',
                              'POST',
                              clinBody
                         )
                    }

                    if (clinResponse?.status === 'success') {
                         // Update clinician ID if creating new
                         if (!commissions.clinician_id && clinResponse?.result?.id) {
                              setCommissions(prev => ({
                                   ...prev,
                                   clinician_id: clinResponse.result.id
                              }))
                         }
                    } else {
                         allSuccess = false
                         errorMessage = clinResponse?.message || 'Failed to save clinician commission'
                    }
               } catch (error) {
                    allSuccess = false
                    errorMessage = 'Error saving clinician commission'
                    console.error(errorMessage, error)
               }

               if (allSuccess) {
                    toast.success('Commission defaults saved successfully', {
                         position: 'top-right',
                         autoClose: 2000
                    })
               } else {
                    toast.error(errorMessage, { position: 'top-right', autoClose: 2000 })
               }
          } catch (error) {
               console.error('Error saving commissions:', error)
               toast.error('Error saving commission defaults', {
                    position: 'top-right',
                    autoClose: 2000
               })
          } finally {
               setSaving(false)
          }
     }

     if (loading) {
          return (
               <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                         <span className="visually-hidden">Loading...</span>
                    </div>
               </div>
          )
     }

     return (
          <div className="container-fluid">
               <div className="card">
                    <div className="card-header bg-body-secondary">
                         <h6 className="mb-0">Default Commission Settings</h6>
                    </div>
                    <div className="card-body">
                         <div className="row g-4">
                              {/* Organization Commission Section */}
                              <div className="col-12">
                                   <h6 className="fw-semibold text-muted mb-3">Organization Commission</h6>
                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label fw-semibold">Commission Type</label>
                                             <div className="btn-group w-100" role="group">
                                                  <input
                                                       type="radio"
                                                       className="btn-check"
                                                       name="org-type"
                                                       id="org-percentage"
                                                       value="percentage"
                                                       checked={commissions.organization_type === 'percentage'}
                                                       onChange={(e) =>
                                                            setCommissions(prev => ({
                                                                 ...prev,
                                                                 organization_type: e.target.value
                                                            }))
                                                       }
                                                  />
                                                  <label
                                                       className="btn btn-outline-primary"
                                                       htmlFor="org-percentage"
                                                  >
                                                       Percentage (%)
                                                  </label>

                                                  <input
                                                       type="radio"
                                                       className="btn-check"
                                                       name="org-type"
                                                       id="org-fixed"
                                                       value="fixed"
                                                       checked={commissions.organization_type === 'fixed'}
                                                       onChange={(e) =>
                                                            setCommissions(prev => ({
                                                                 ...prev,
                                                                 organization_type: e.target.value
                                                            }))
                                                       }
                                                  />
                                                  <label
                                                       className="btn btn-outline-primary"
                                                       htmlFor="org-fixed"
                                                  >
                                                       Fixed (GHS)
                                                  </label>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-semibold">Commission Value</label>
                                             <div className="input-group">
                                                  <input
                                                       className="form-control"
                                                       type="number"
                                                       step="0.01"
                                                       min="0"
                                                       value={commissions.organization_value}
                                                       onChange={(e) =>
                                                            setCommissions(prev => ({
                                                                 ...prev,
                                                                 organization_value: parseFloat(e.target.value) || 0
                                                            }))
                                                       }
                                                       placeholder="Enter value"
                                                  />
                                                  <span className="input-group-text">
                                                       {commissions.organization_type === 'percentage' ? '%' : 'GHS'}
                                                  </span>
                                             </div>
                                        </div>
                                   </div>
                              </div>

                              {/* Clinician Commission Section */}
                              <div className="col-12">
                                   <h6 className="fw-semibold text-muted mb-3">Clinician Commission</h6>
                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label fw-semibold">Commission Type</label>
                                             <div className="btn-group w-100" role="group">
                                                  <input
                                                       type="radio"
                                                       className="btn-check"
                                                       name="clin-type"
                                                       id="clin-percentage"
                                                       value="percentage"
                                                       checked={commissions.clinician_type === 'percentage'}
                                                       onChange={(e) =>
                                                            setCommissions(prev => ({
                                                                 ...prev,
                                                                 clinician_type: e.target.value
                                                            }))
                                                       }
                                                  />
                                                  <label
                                                       className="btn btn-outline-primary"
                                                       htmlFor="clin-percentage"
                                                  >
                                                       Percentage (%)
                                                  </label>

                                                  <input
                                                       type="radio"
                                                       className="btn-check"
                                                       name="clin-type"
                                                       id="clin-fixed"
                                                       value="fixed"
                                                       checked={commissions.clinician_type === 'fixed'}
                                                       onChange={(e) =>
                                                            setCommissions(prev => ({
                                                                 ...prev,
                                                                 clinician_type: e.target.value
                                                            }))
                                                       }
                                                  />
                                                  <label
                                                       className="btn btn-outline-primary"
                                                       htmlFor="clin-fixed"
                                                  >
                                                       Fixed (GHS)
                                                  </label>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-semibold">Commission Value</label>
                                             <div className="input-group">
                                                  <input
                                                       className="form-control"
                                                       type="number"
                                                       step="0.01"
                                                       min="0"
                                                       value={commissions.clinician_value}
                                                       onChange={(e) =>
                                                            setCommissions(prev => ({
                                                                 ...prev,
                                                                 clinician_value: parseFloat(e.target.value) || 0
                                                            }))
                                                       }
                                                       placeholder="Enter value"
                                                  />
                                                  <span className="input-group-text">
                                                       {commissions.clinician_type === 'percentage' ? '%' : 'GHS'}
                                                  </span>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="card-footer bg-body-secondary d-flex justify-content-end gap-2">
                         <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => window.history.back()}
                         >
                              Cancel
                         </button>
                         <button
                              type="button"
                              className="btn btn-primary"
                              onClick={handleSave}
                              disabled={saving}
                         >
                              {saving ? (
                                   <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Saving...
                                   </>
                              ) : (
                                   'Save Commission Defaults'
                              )}
                         </button>
                    </div>
               </div>
          </div>
     )
}
