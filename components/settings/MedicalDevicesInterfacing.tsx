"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Button, Form, Modal, Table } from "react-bootstrap";
import { RiAddLine, RiCheckLine, RiCloseCircleLine, RiDeleteBin6Line, RiEditLine, RiPulseLine } from "@remixicon/react";
import { toast } from "react-toastify";
import { customFetch, customPost, customFetchMutation } from "../Auth/customFetch";

interface MedicalDevice {
     id?: number;
     name?: string;
     ip?: string;
     dial_port?: string;
     listen_port?: string;
     connection_mode?: "pull" | "feed" | "hybrid" | "server" | string;
     use_tls?: boolean | number | string;
     active?: boolean | number | string;
     created_at?: string;
     test_names?: string;
     testid?: string | number[];
     last_known_ip?: string;
     last_connected?: string | null;
     device_info?: string;
}

type DeviceFormValues = {
     name: string;
     ip: string;
     dial_port: string;
     listen_port: string;
     connection_mode: "pull" | "feed" | "hybrid" | "server";
     use_tls: boolean;
     active: boolean;
     testid: string;
     last_known_ip: string;
     device_info: string;
};

const defaultValues: DeviceFormValues = {
     name: "",
     ip: "",
     dial_port: "",
     listen_port: "",
     connection_mode: "pull",
     use_tls: false,
     active: true,
     testid: "",
     last_known_ip: "",
     device_info: "",
};

const normalizeDevice = (item: MedicalDevice): MedicalDevice => ({
     ...item,
     use_tls: item?.use_tls === 1 || item?.use_tls === true || item?.use_tls === "1",
     active: item?.active === 1 || item?.active === true || item?.active === "1",
});

const isTruthyFlag = (value: boolean | number | string | undefined) => {
     if (value === true || value === 1 || value === "1" || value === "true") return true;
     if (value === false || value === 0 || value === "0" || value === "false") return false;
     return false;
};

export default function MedicalDevicesInterfacing({ endpoint = "devices/interfacing/verified/devices", platform = false }: {
     endpoint?: string;
     platform?: boolean;
}) {
     const mutate = platform ? customFetchMutation : customPost;
     const [devices, setDevices] = useState<MedicalDevice[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [isEditing, setIsEditing] = useState(false);
     const [editingId, setEditingId] = useState<number | null>(null);
     const [showDeleteModal, setShowDeleteModal] = useState(false);
     const [deleteTarget, setDeleteTarget] = useState<MedicalDevice | null>(null);

     const {
          register,
          handleSubmit,
          reset,
          formState: { errors, isSubmitting },
          setValue,
          watch,
     } = useForm<DeviceFormValues>({
          defaultValues,
     });

     const selectedMode = watch("connection_mode");

     const fetchDevices = useCallback(async () => {
          try {
               setLoading(true);
               setError(null);

               const response = await customFetch(endpoint);
               if (!response || response.status === "error" || response.error || (platform && response.status !== "success")) {
                    throw new Error(response?.message || response?.error || "Unable to load devices");
               }
               const result =
                    response?.result ??
                    response?.data ??
                    response?.devices ??
                    response?.items ??
                    response ??
                    [];

               if (!Array.isArray(result)) throw new Error("The server returned an invalid device list");
               const normalized = result.map(normalizeDevice);
               setDevices(normalized);
          } catch (err) {
               const message = err instanceof Error ? err.message : "Unable to load devices";
               setError(message);
               toast.error("Failed to load medical interfacing devices");
          } finally {
               setLoading(false);
          }
     }, [endpoint, platform]);

     useEffect(() => {
          fetchDevices();
     }, [fetchDevices]);

     const handleEdit = (device: MedicalDevice) => {
          setIsEditing(true);
          setEditingId(Number(device.id));
          setValue("name", device.name ?? "");
          setValue("ip", device.ip ?? "");
          setValue("dial_port", device.dial_port ?? "");
          setValue("listen_port", device.listen_port ?? "");
          setValue("connection_mode", (device.connection_mode as DeviceFormValues["connection_mode"]) ?? "pull");
          setValue("use_tls", Boolean(device.use_tls));
          setValue("active", Boolean(device.active));
          setValue("testid", Array.isArray(device.testid) ? device.testid.join(",") : device.testid ?? "");
          setValue("last_known_ip", device.last_known_ip ?? "");
          setValue("device_info", device.device_info ?? "");
          window.scrollTo({ top: 0, behavior: "smooth" });
     };

     const handleCancel = () => {
          setIsEditing(false);
          setEditingId(null);
          reset(defaultValues);
     };

     const onSubmit = async (data: DeviceFormValues) => {
          try {
               const payload = {
                    ...data,
                    use_tls: data.use_tls ? 1 : 0,
                    active: data.active ? 1 : 0,
               };



               const isEditingUrl = isEditing && editingId ?
                    `${endpoint}/${editingId}` : endpoint;

               const isEditingMethod = isEditing && editingId ? "PUT" : "POST";


               const isEditingPayload = isEditing && editingId ? { ...payload, id: editingId } : payload;
               const response = await mutate(
                    isEditingUrl,
                    isEditingMethod,
                    isEditingPayload
               );

               const isSuccess = response?.status === "success" || response?.statusCode === 200 || response?.status === true;

               if (!isSuccess) {
                    toast.error(response?.message || "Unable to save device");
                    await fetchDevices();
                    return;
               }

               toast.success(response?.message || (isEditing ? "Device updated successfully" : "Device created successfully"));
               handleCancel();
               await fetchDevices();
          } catch (err) {
               const message = err instanceof Error ? err.message : "Request failed";
               toast.error(message);
          }
     };

     const confirmDelete = async () => {
          if (!deleteTarget?.id) return;

          try {
               const response = await mutate(`${endpoint}/${deleteTarget.id}`, "DELETE", { id: deleteTarget.id });
               const isSuccess = response?.status === "success" || response?.statusCode === 200 || response?.status === true;

               if (!isSuccess) {
                    toast.error(response?.message || "Unable to delete device");
                    return;
               }

               toast.success(response?.message || "Device deleted successfully");
               setDeleteTarget(null);
               setShowDeleteModal(false);
               await fetchDevices();
          } catch (err) {
               const message = err instanceof Error ? err.message : "Delete failed";
               toast.error(message);
          }
     };

     const toggleActive = async (device: MedicalDevice) => {
          if (!device.id) return;

          const nextValue = !isTruthyFlag(device.active);

          try {
               const response = await mutate(`${endpoint}/${device.id}`, "PUT", {
                    name: device.name,
                    ip: device.ip,
                    dial_port: device.dial_port,
                    listen_port: device.listen_port,
                    connection_mode: device.connection_mode,
                    use_tls: isTruthyFlag(device.use_tls) ? 1 : 0,
                    testid: device.testid,
                    last_known_ip: device.last_known_ip,
                    device_info: device.device_info,
                    id: device.id,
                    active: nextValue ? 1 : 0,
               });

               const isSuccess = response?.status === "success" || response?.statusCode === 200 || response?.status === true;
               if (!isSuccess) {
                    toast.error(response?.message || "Unable to update status");
                    return;
               }

               setDevices((current) => current.map((item) => item.id === device.id ? { ...item, active: nextValue ? 1 : 0 } : item));
               toast.success(response?.message || "Device status updated");
          } catch (err) {
               const message = err instanceof Error ? err.message : "Status update failed";
               toast.error(message);
          }
     };

     const summary = useMemo(() => {
          const total = devices.length;
          const active = devices.filter((item) => isTruthyFlag(item.active)).length;
          const inactive = total - active;

          return { total, active, inactive };
     }, [devices]);

     return (
          <div className="container-fluid py-3">
               <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                    <div>
                         <h4 className="mb-1 fw-bold">Medical Device Interfacing</h4>
                         <small className="text-muted">Manage external devices, ports, connection mode, and connectivity status.</small>
                    </div>
                    <Button variant="primary" onClick={() => { handleCancel(); }}>
                         <RiAddLine className="me-1" size={16} aria-hidden="true" />
                         {isEditing ? "New Device" : "Add Device"}
                    </Button>
               </div>

               <div className="row g-3 mb-3" aria-label="Device summary" aria-busy={loading}>
                    {[
                         { title: "Total devices", value: summary.total, subtitle: "Registered configurations", variant: "primary", Icon: RiPulseLine },
                         { title: "Active", value: summary.active, subtitle: "Marked active in configuration", variant: "success", Icon: RiCheckLine },
                         { title: "Inactive", value: summary.inactive, subtitle: "Marked inactive in configuration", variant: "secondary", Icon: RiCloseCircleLine },
                    ].map(({ title, value, subtitle, variant, Icon }) => (
                         <div className="col-12 col-sm-6 col-xl-4" key={title}>
                              <div className={`card border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}>
                                   <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                             <span className="text-xs text-uppercase fw-semibold opacity-75">{title}</span>
                                             <Icon size={22} className="opacity-75" aria-hidden="true" />
                                        </div>
                                        <h3 className="fw-bold mb-0">{loading ? "Loading…" : error ? "Unavailable" : value.toLocaleString()}</h3>
                                        <span className="text-xs opacity-75">{subtitle}</span>
                                   </div>
                              </div>
                         </div>
                    ))}
               </div>

               {error && <Alert variant="danger">{error}</Alert>}

               <section className="mb-4" aria-labelledby="device-configuration-heading">
                    <h5 id="device-configuration-heading" className="h6 border-bottom pb-2 mb-3 fw-semibold">
                         <RiPulseLine className="me-2" size={18} aria-hidden="true" />
                         {isEditing ? "Edit Device Configuration" : "Create Device Configuration"}
                    </h5>

                    <div>
                         <Form onSubmit={handleSubmit(onSubmit)}>
                              <div className="row g-3">
                                   <div className="col-md-6">
                                        <Form.Group>
                                             <Form.Label>Device Name</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  {...register("name", { required: "Device name is required" })}
                                                  isInvalid={!!errors.name}
                                                  placeholder="e.g. Cobas 6000"
                                             />
                                             <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                   </div>

                                   <div className="col-md-6">
                                        <Form.Group>
                                             <Form.Label>IP Address</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  {...register("ip", { required: "IP address is required" })}
                                                  isInvalid={!!errors.ip}
                                                  placeholder="192.168.1.42"
                                             />
                                             <Form.Control.Feedback type="invalid">{errors.ip?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                   </div>

                                   <div className="col-md-3">
                                        <Form.Group>
                                             <Form.Label>Dial Port</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  {...register("dial_port", { required: "Dial port is required" })}
                                                  isInvalid={!!errors.dial_port}
                                                  placeholder="5001"
                                             />
                                             <Form.Control.Feedback type="invalid">{errors.dial_port?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                   </div>

                                   <div className="col-md-3">
                                        <Form.Group>
                                             <Form.Label>Listen Port</Form.Label>
                                             <Form.Control type="text" {...register("listen_port")} placeholder="5002" />
                                        </Form.Group>
                                   </div>

                                   <div className="col-md-3">
                                        <Form.Group>
                                             <Form.Label>Connection Mode</Form.Label>
                                             <Form.Select {...register("connection_mode")} value={selectedMode ?? "pull"}>
                                                  <option value="pull">Pull</option>
                                                  <option value="feed">Feed</option>
                                                  <option value="hybrid">Hybrid</option>
                                                  <option value="server">Server</option>
                                             </Form.Select>
                                        </Form.Group>
                                   </div>

                                   <div className="col-md-3">
                                        <Form.Group>
                                             <Form.Label>Test ID</Form.Label>
                                             <Form.Control type="text" {...register("testid")} placeholder="Optional" />
                                        </Form.Group>
                                   </div>

                                   <div className="col-md-4">
                                        <Form.Group>
                                             <Form.Label>Last Known IP</Form.Label>
                                             <Form.Control type="text" {...register("last_known_ip")} placeholder="Optional" />
                                        </Form.Group>
                                   </div>

                                   <div className="col-md-4">
                                        <Form.Group>
                                             <Form.Label>Use TLS</Form.Label>
                                             <div className="d-flex align-items-center mt-2">
                                                  <Form.Check type="switch" {...register("use_tls")} />
                                                  <span className="ms-2 text-muted">{watch("use_tls") ? "Enabled" : "Disabled"}</span>
                                             </div>
                                        </Form.Group>
                                   </div>

                                   <div className="col-md-4">
                                        <Form.Group>
                                             <Form.Label>Status</Form.Label>
                                             <div className="d-flex align-items-center mt-2">
                                                  <Form.Check type="switch" {...register("active")} />
                                                  <span className="ms-2 text-muted">{watch("active") ? "Active" : "Inactive"}</span>
                                             </div>
                                        </Form.Group>
                                   </div>

                                   <div className="col-12">
                                        <Form.Group>
                                             <Form.Label>Device Information</Form.Label>
                                             <Form.Control as="textarea" rows={4} {...register("device_info")} placeholder="Optional device metadata, serial number, notes, or endpoint details" />
                                        </Form.Group>
                                   </div>
                              </div>

                              <div className="d-flex gap-2 mt-4">
                                   <Button type="submit" variant="primary" disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : isEditing ? "Update Device" : "Save Device"}
                                   </Button>
                                   {isEditing && (
                                        <Button type="button" variant="outline-secondary" onClick={handleCancel}>
                                             Cancel
                                        </Button>
                                   )}
                              </div>
                         </Form>
                    </div>
               </section>

               <section aria-labelledby="registered-devices-heading">
                    <h5 id="registered-devices-heading" className="h6 border-bottom pb-2 mb-3 fw-semibold">Registered Devices</h5>
                    <div>
                         {loading ? (
                              <div className="p-4 text-muted" role="status">Loading devices...</div>
                         ) : error ? (
                              <p className="text-muted">Device list unavailable. Resolve the error above and reload to try again.</p>
                         ) : devices.length === 0 ? (
                              <div className="p-4 text-muted">No devices found.</div>
                         ) : (
                              <div className="table-responsive">
                                   <Table hover className="mb-0 align-middle text-start">
                                        <thead className="table-light">
                                             <tr>
                                                  <th>Name</th>
                                                  <th>Device Info</th>
                                                  <th>Test Names</th>
                                                  <th>IP</th>
                                                  <th>Ports</th>
                                                  <th>Mode</th>
                                                  <th>TLS</th>
                                                  <th>Status</th>
                                                  <th>Last Connected</th>
                                                  <th>Actions</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {devices.map((device) => {
                                                  const isActive = isTruthyFlag(device.active);
                                                  return (
                                                       <tr key={device.id ?? `${device.ip}-${device.name}`}>
                                                            <td>
                                                                 <div className="fw-semibold">{device.name || "Unnamed device"}</div>
                                                                 {device.testid && <small className="text-muted">{Array.isArray(device.testid) ? device.testid.join(", ") : device.testid}</small>}

                                                            </td>
                                                            <td>
                                                               <div style={{textOverflow:"ellipsis", width:"300px"}}> {device.device_info }</div>
                                                            </td>
                                                            <td>
                                                                 <div>{device.test_names || "-"}</div>
                                                            </td>
                                                            <td>{device.ip || "-"}</td>
                                                            <td>
                                                                 <div>{device.dial_port || "-"}</div>
                                                                 <small className="text-muted">Listen: {device.listen_port || "-"}</small>
                                                            </td>
                                                            <td>
                                                                 <span className="text-capitalize">
                                                                      {device.connection_mode || "pull"}
                                                                 </span>
                                                            </td>
                                                            <td>
                                                                 {isTruthyFlag(device.use_tls) ? (
                                                                      <span>Enabled</span>
                                                                 ) : (
                                                                      <span>Disabled</span>
                                                                 )}
                                                            </td>
                                                            <td>
                                                                 <span className={isActive ? "text-success" : "text-muted"}>{isActive ? "Active" : "Inactive"}</span>
                                                            </td>
                                                            <td>{device.last_connected ? new Date(device.last_connected).toLocaleString() : "Never"}</td>
                                                            <td>
                                                                 <div className="d-flex gap-2">
                                                                      <Button variant="outline-primary" size="sm" aria-label={`Edit ${device.name || "device"}`} onClick={() => handleEdit(device)}>
                                                                           <RiEditLine size={14} aria-hidden="true" />
                                                                      </Button>
                                                                      <Button
                                                                           variant="outline-danger"
                                                                           size="sm"
                                                                           aria-label={`Delete ${device.name || "device"}`}
                                                                           onClick={() => {
                                                                                setDeleteTarget(device);
                                                                                setShowDeleteModal(true);
                                                                           }}
                                                                      >
                                                                           <RiDeleteBin6Line size={14} aria-hidden="true" />
                                                                      </Button>
                                                                      <Button
                                                                           variant={isActive ? "outline-secondary" : "outline-success"}
                                                                           size="sm"
                                                                           aria-label={`${isActive ? "Deactivate" : "Activate"} ${device.name || "device"}`}
                                                                           onClick={() => toggleActive(device)}
                                                                      >
                                                                           {isActive ? <RiCloseCircleLine size={14} aria-hidden="true" /> : <RiCheckLine size={14} aria-hidden="true" />}
                                                                      </Button>
                                                                 </section>
                                                            </td>
                                                       </tr>
                                                  );
                                             })}
                                        </tbody>
                                   </Table>
                              </div>
                         )}
                    </div>
               </div>

               <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton>
                         <Modal.Title>Delete Device</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         Are you sure you want to delete <strong>{deleteTarget?.name || "this device"}</strong>? This action cannot be undone.
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                              Cancel
                         </Button>
                         <Button variant="danger" onClick={confirmDelete}>
                              Delete
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}
