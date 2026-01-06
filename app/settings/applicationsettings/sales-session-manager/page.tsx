"use client";

import React, { useState, useEffect } from 'react';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import Loader from '../../../../components/isLoading';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import {
     RiAddLine,
     RiDeleteBinLine,
     RiCheckboxCircleLine,
     RiRefreshLine,
     RiTimeLine
} from '@remixicon/react';

interface TimeRange {
     start: string;
     end: string;
}

interface Branch {
     branchid: number;
     name: string;
     date?: string;
     activation?: number;
     address?: string;
     email?: string;
     contact?: number;
     managerid?: string;
}

interface SalesSessionConfig {
     id?: number;
     branchid: number;
     allow_multiple_sessions: boolean;
     session_count?: number;
     start_time?: string;
     end_time?: string;
     time_ranges?: TimeRange[];
     created_at?: string;
     updated_at?: string;
}

interface ApiResponse {
     config: SalesSessionConfig | null;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';

export default function SalesSessionManagerPage() {
     const [config, setConfig] = useState<SalesSessionConfig | null>(null);
     const [branches, setBranches] = useState<Branch[]>([]);
     const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
     const [loading, setLoading] = useState(false);
     const [saving, setSaving] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const { applicationsettings } = useApplicationSettings();
     const { user, company, branchid } = applicationsettings;


     // Load branches on component mount
     useEffect(() => {
          loadBranches();
     }, []);

     const loadBranches = async () => {
          try {
               const response = await customFetch('branches');
               if (response?.result) {
                    setBranches(response.result);
               }
          } catch (err: any) {
               console.error('Failed to load branches:', err);
          }
     };

     const loadConfig = async (branchId: number) => {
          try {
               setLoading(true);
               setError(null);

               const response = await customFetch(`billing/sales/session/config?branchid=${branchId}`);

               if (response?.config !== undefined) {
                    setConfig(response.config);
               } else {
                    setConfig({
                         branchid: branchId,
                         allow_multiple_sessions: false,
                         time_ranges: []
                    });
               }
               setLoading(false);
          } catch (err: any) {
               setError(err?.message || 'Failed to load configuration');
               setConfig({
                    branchid: branchId,
                    allow_multiple_sessions: false,
                    time_ranges: []
               });
               setLoading(false);
          }
     };

     const saveConfig = async () => {
          if (!config) return;

          try {
               setSaving(true);
               setError(null);

               const saveData = {
                    branchid: config.branchid,
                    allow_multiple_sessions: config.allow_multiple_sessions,
                    time_ranges: config.time_ranges || []
               };

               const response = await customPost(`billing/sales/session/config`, 'POST', saveData);

               if (response?.status === true) {
                    await loadConfig(config.branchid);
                    alert('Configuration saved successfully!');
               } else {
                    throw new Error('Failed to save configuration');
               }
          } catch (err: any) {
               setError(err?.message || 'Failed to save configuration');
          } finally {
               setSaving(false);
          }
     };

     const addTimeRange = () => {
          const newRange: TimeRange = { start: '09:00', end: '17:00' };
          setConfig(prev => prev ? {
               ...prev,
               time_ranges: [...(prev.time_ranges || []), newRange]
          } : null);
     };

     const updateTimeRange = (index: number, field: 'start' | 'end', value: string) => {
          setConfig(prev => {
               if (!prev?.time_ranges) return prev;
               const newRanges = [...prev.time_ranges];
               newRanges[index] = { ...newRanges[index], [field]: value };
               return { ...prev, time_ranges: newRanges };
          });
     };

     const removeTimeRange = (index: number) => {
          setConfig(prev => {
               if (!prev?.time_ranges) return prev;
               const newRanges = prev.time_ranges.filter((_, i) => i !== index);
               return { ...prev, time_ranges: newRanges };
          });
     };

     const validateTimeRanges = (ranges: TimeRange[]): string | null => {
          for (const range of ranges) {
               if (range.start >= range.end) {
                    return 'Start time must be before end time';
               }
          }

          // Check for overlapping ranges
          for (let i = 0; i < ranges.length; i++) {
               for (let j = i + 1; j < ranges.length; j++) {
                    if (ranges[i].start < ranges[j].end && ranges[j].start < ranges[i].end) {
                         return 'Time ranges cannot overlap';
                    }
               }
          }

          return null; // Valid
     };

     const handleSave = async () => {
          if (!config) return;

          // Validate time ranges if multiple sessions are enabled
          if (config.allow_multiple_sessions && config.time_ranges) {
               const validationError = validateTimeRanges(config.time_ranges);
               if (validationError) {
                    setError(validationError);
                    return;
               }
          }

          await saveConfig();
     };

     const handleBranchChange = (newBranchId: number) => {
          setSelectedBranchId(newBranchId);
          loadConfig(newBranchId);
     };

     if (loading) return <Loader />;

     if (!config && selectedBranchId) return <div>No data available</div>;

     return (
          <div className="container-fluid px-4 py-3">
               <div className="mb-4">
                    <h4 className="mb-1 fw-semibold">Sales Session Configuration</h4>
                    <p className="text-muted mb-0">Manage multiple billing sessions per day for different branches</p>
               </div>

               {/* Branch Selector */}
               <div className="border rounded mb-4" style={{ borderColor: COLOR_BORDER }}>
                    <div className="p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderBottom: `1px solid ${COLOR_BORDER}` }}>
                         <h6 className="mb-0 fw-semibold">Branch Selection</h6>
                    </div>
                    <div className="p-4">
                         <div className="row align-items-center">
                              <div className="col-md-6">
                                   <label htmlFor="branchSelect" className="form-label fw-bold">
                                        Select Branch
                                   </label>
                                   <select
                                        id="branchSelect"
                                        className="form-select"
                                        value={selectedBranchId || ''}
                                        onChange={(e) => handleBranchChange(Number(e.target.value))}
                                   >
                                        <option value="">Choose a branch...</option>
                                        {branches.map((branch) => (
                                             <option key={branch.branchid} value={branch.branchid}>
                                                  {branch.name}
                                             </option>
                                        ))}
                                   </select>
                              </div>
                              <div className="col-md-6">
                                   {selectedBranchId && (
                                        <div className="text-muted">
                                             <small>
                                                  Configuring sales sessions for: <strong>
                                                       {branches.find(b => b.branchid === selectedBranchId)?.name || 'Unknown Branch'}
                                                  </strong>
                                             </small>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {error && (
                    <div className="alert alert-danger mb-4">
                         {error}
                    </div>
               )}

               {selectedBranchId && config && (
                    <div className="border rounded mb-4" style={{ borderColor: COLOR_BORDER }}>
                         <div className="p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderBottom: `1px solid ${COLOR_BORDER}` }}>
                              <h6 className="mb-0 fw-semibold">Session Settings for {branches.find(b => b.branchid === selectedBranchId)?.name}</h6>
                         </div>
                         <div className="p-4">
                              {/* Multiple Sessions Toggle */}
                              <div className="form-check mb-4">
                                   <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="allowMultipleSessions"
                                        checked={config?.allow_multiple_sessions || false}
                                        onChange={(e) => setConfig(prev => prev ? {
                                             ...prev,
                                             allow_multiple_sessions: e.target.checked
                                        } : null)}
                                   />
                                   <label className="form-check-label" htmlFor="allowMultipleSessions">
                                        Allow Multiple Sessions Per Day
                                   </label>
                              </div>

                              {/* Time Ranges Section */}
                              {config?.allow_multiple_sessions && (
                                   <div className="mb-4">
                                        <h6 className="mb-3 fw-semibold">Session Time Ranges</h6>

                                        <button
                                             className="btn btn-sm mb-3"
                                             style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT, color: 'white' }}
                                             onClick={addTimeRange}
                                        >
                                             <RiAddLine size={16} className="me-1" />
                                             Add Time Range
                                        </button>

                                        <div className="row">
                                             {(config.time_ranges || []).map((range, index) => (
                                                  <div key={index} className="col-md-6 mb-3">
                                                       <div className="border rounded" style={{ borderColor: COLOR_BORDER }}>
                                                            <div className="p-3">
                                                                 <div className="row align-items-center">
                                                                      <div className="col-5">
                                                                           <label className="form-label small">Start Time</label>
                                                                           <input
                                                                                type="time"
                                                                                className="form-control form-control-sm"
                                                                                value={range.start}
                                                                                onChange={(e) => updateTimeRange(index, 'start', e.target.value)}
                                                                           />
                                                                      </div>
                                                                      <div className="col-2 text-center">
                                                                           <span className="text-muted">to</span>
                                                                      </div>
                                                                      <div className="col-4">
                                                                           <label className="form-label small">End Time</label>
                                                                           <input
                                                                                type="time"
                                                                                className="form-control form-control-sm"
                                                                                value={range.end}
                                                                                onChange={(e) => updateTimeRange(index, 'end', e.target.value)}
                                                                           />
                                                                      </div>
                                                                      <div className="col-1">
                                                                           <button
                                                                                className="btn btn-outline-danger btn-sm"
                                                                                onClick={() => removeTimeRange(index)}
                                                                                title="Remove time range"
                                                                           >
                                                                                <RiDeleteBinLine size={16} />
                                                                           </button>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>

                                        {(config.time_ranges || []).length === 0 && (
                                             <div className="text-center py-4" style={{ color: COLOR_TEXT_MUTED }}>
                                                  <RiTimeLine size={48} className="mb-2" />
                                                  <p className="mb-1">No time ranges configured</p>
                                                  <small>Click Add Time Range to define session periods</small>
                                             </div>
                                        )}
                                   </div>
                              )}

                              {/* Action Buttons */}
                              <div className="d-flex gap-2">
                                   <button
                                        className="btn"
                                        style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT, color: 'white' }}
                                        onClick={handleSave}
                                        disabled={saving}
                                   >
                                        {saving ? (
                                             <>
                                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                  Saving...
                                             </>
                                        ) : (
                                             <>
                                                  <RiCheckboxCircleLine size={16} className="me-1" />
                                                  Save Configuration
                                             </>
                                        )}
                                   </button>

                                   <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => selectedBranchId && loadConfig(selectedBranchId)}
                                        disabled={loading}
                                   >
                                        <RiRefreshLine size={16} className="me-1" />
                                        Refresh
                                   </button>
                              </div>
                         </div>


                         {/* Configuration Info */}
                         {selectedBranchId && config && (
                              <div className="border rounded mt-3" style={{ borderColor: COLOR_BORDER }}>
                                   <div className="p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderBottom: `1px solid ${COLOR_BORDER}` }}>
                                        <h6 className="mb-0 fw-semibold">Configuration Details</h6>
                                   </div>
                                   <div className="p-4">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <p className="mb-1"><strong>Branch:</strong> {branches.find(b => b.branchid === selectedBranchId)?.name || 'Unknown'}</p>
                                                  <p className="mb-1"><strong>Branch ID:</strong> {config.branchid}</p>
                                                  <p className="mb-1"><strong>Multiple Sessions:</strong> {config.allow_multiple_sessions ? 'Enabled' : 'Disabled'}</p>
                                             </div>
                                             <div className="col-md-6">
                                                  {config.created_at && (
                                                       <p className="mb-1"><strong>Created:</strong> {new Date(config.created_at).toLocaleString()}</p>
                                                  )}
                                                  {config.updated_at && (
                                                       <p className="mb-1"><strong>Last Updated:</strong> {new Date(config.updated_at).toLocaleString()}</p>
                                                  )}
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         )}
                    </div>
               )}
          </div>
     );
}

