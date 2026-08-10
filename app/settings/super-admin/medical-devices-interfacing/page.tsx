"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Badge, Button, Form, Modal, Table } from "react-bootstrap";
import { RiAddLine, RiCheckLine, RiCloseCircleLine, RiDeleteBin6Line, RiEditLine, RiPulseLine } from "@remixicon/react";
import { toast } from "react-toastify";
import { customFetch, customPost } from "../../../../components/Auth/customFetch";

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
     testid?: string;
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

const normalizeDevice = (item: any): MedicalDevice => ({
     ...item,
     use_tls: item?.use_tls === 1 || item?.use_tls === true || item?.use_tls === "1",
     active: item?.active === 1 || item?.active === true || item?.active === "1",
});

const isTruthyFlag = (value: boolean | number | string | undefined) => {
     if (value === true || value === 1 || value === "1" || value === "true") return true;
     if (value === false || value === 0 || value === "0" || value === "false") return false;
     return false;
};

const getStatusVariant = (value: boolean | number | string | undefined) => {
     return isTruthyFlag(value) ? "success" : "secondary";
};

export default function MedicalDevicesInterfacingPage() {
     const [devices, setDevices] = useState<MedicalDevice[]>([]);
     const [loading, setLoading] = useState(false);
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

     const fetchDevices = async () => {
          try {
               setLoading(true);
               setError(null);

               const response = await customFetch("devices/interfacing/verified/devices");
               const result =
                    response?.result ??
                    response?.data ??
                    response?.devices ??
                    response?.items ??
                    response ??
                    [];

               const normalized = Array.isArray(result) ? result.map(normalizeDevice) : [];
               setDevices(normalized);
          } catch (err) {
               const message = err instanceof Error ? err.message : "Unable to load devices";
               setError(message);
               toast.error("Failed to load medical interfacing devices");
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchDevices();
     }, []);

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
          setValue("testid", device.testid ?? "");
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
                    "devices/interfacing/verified/devices/" + editingId : "devices/interfacing/verified/devices";

               const isEditingMethod = isEditing && editingId ? "PUT" : "POST";


               const isEditingPayload = isEditing && editingId ? { ...payload, id: editingId } : payload;
               const response = await customPost(
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
               const response = await customPost(`devices/interfacing/verified/devices/${deleteTarget.id}`, "DELETE", { id: deleteTarget.id });
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
               const response = await customPost("devices/interfacing/verified/devices", "PUT", {
                    ...device,
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
                         <RiAddLine className="me-1" size={16} />
                         {isEditing ? "New Device" : "Add Device"}
                    </Button>
               </div>

               <div className="row g-3 mb-3">
                    <div className="col-md-4">
                         <div className="border rounded p-3 h-100 bg-body-tertiary">
                              <small className="text-muted d-block">Total devices</small>
                              <h4 className="mb-0">{summary.total}</h4>
                         </div>
                    </div>
                    <div className="col-md-4">
                         <div className="border rounded p-3 h-100 bg-body-tertiary">
                              <small className="text-muted d-block">Active</small>
                              <h4 className="mb-0 text-success">{summary.active}</h4>
                         </div>
                    </div>
                    <div className="col-md-4">
                         <div className="border rounded p-3 h-100 bg-body-tertiary">
                              <small className="text-muted d-block">Inactive</small>
                              <h4 className="mb-0 text-secondary">{summary.inactive}</h4>
                         </div>
                    </div>
               </div>

               {error && <Alert variant="danger">{error}</Alert>}

               <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-body-tertiary fw-semibold">
                         <RiPulseLine className="me-2" size={18} />
                         {isEditing ? "Edit Device Configuration" : "Create Device Configuration"}
                    </div>

                    <div className="card-body">
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
               </div>

               <div className="card border-0 shadow-sm">
                    <div className="card-header bg-body-tertiary fw-semibold">Registered Devices</div>
                    <div className="card-body p-0">
                         {loading ? (
                              <div className="p-4 text-center text-muted">Loading devices...</div>
                         ) : devices.length === 0 ? (
                              <div className="p-4 text-center text-muted">No devices found.</div>
                         ) : (
                              <div className="table-responsive">
                                   <Table hover className="mb-0 align-middle">
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
                                                  <th className="text-end">Actions</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {devices.map((device) => {
                                                  const isActive = isTruthyFlag(device.active);
                                                  return (
                                                       <tr key={device.id ?? `${device.ip}-${device.name}`}>
                                                            <td>
                                                                 <div className="fw-semibold">{device.name || "Unnamed device"}</div>
                                                                 {device.testid && <small className="text-muted">{device.testid}</small>}

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
                                                                 <Badge bg="light" text="dark" className="text-capitalize">
                                                                      {device.connection_mode || "pull"}
                                                                 </Badge>
                                                            </td>
                                                            <td>
                                                                 {isTruthyFlag(device.use_tls) ? (
                                                                      <Badge bg="info">Enabled</Badge>
                                                                 ) : (
                                                                      <Badge bg="secondary">Disabled</Badge>
                                                                 )}
                                                            </td>
                                                            <td>
                                                                 <Badge bg={getStatusVariant(isActive)}>{isActive ? "Active" : "Inactive"}</Badge>
                                                            </td>
                                                            <td>{device.last_connected ? new Date(device.last_connected).toLocaleString() : "Never"}</td>
                                                            <td>
                                                                 <div className="d-flex justify-content-end gap-2">
                                                                      <Button variant="outline-primary" size="sm" onClick={() => handleEdit(device)}>
                                                                           <RiEditLine size={14} />
                                                                      </Button>
                                                                      <Button
                                                                           variant="outline-danger"
                                                                           size="sm"
                                                                           onClick={() => {
                                                                                setDeleteTarget(device);
                                                                                setShowDeleteModal(true);
                                                                           }}
                                                                      >
                                                                           <RiDeleteBin6Line size={14} />
                                                                      </Button>
                                                                      <Button
                                                                           variant={isActive ? "outline-secondary" : "outline-success"}
                                                                           size="sm"
                                                                           onClick={() => toggleActive(device)}
                                                                      >
                                                                           {isActive ? <RiCloseCircleLine size={14} /> : <RiCheckLine size={14} />}
                                                                      </Button>
                                                                 </div>
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
