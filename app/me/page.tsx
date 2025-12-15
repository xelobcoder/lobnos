'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Modal, Button } from 'react-bootstrap';
import { RiCameraLine, RiBarcodeBoxLine, RiStopCircleLine, RiCameraLensLine, RiMapPinLine, RiTimeLine, RiUserLine } from '@remixicon/react';
import { useApplicationSettings } from '../../components/Auth/useApplicationContext';
import dayjs from 'dayjs';

export default function ScannerPage() {
     const { applicationsettings } = useApplicationSettings() || {};
     const user = applicationsettings?.user;

     const [scanning, setScanning] = useState(false);
     const [result, setResult] = useState<string | null>(null);
     const [capturedImage, setCapturedImage] = useState<string | null>(null);
     const [showModal, setShowModal] = useState(false);
     const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
     const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
     const [permissionError, setPermissionError] = useState<string | null>(null);

     // Attendance State
     const [attendanceType, setAttendanceType] = useState<'In' | 'Out' | null>(null);
     const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
     const [locationError, setLocationError] = useState<string | null>(null);
     const [captureTime, setCaptureTime] = useState<string | null>(null);
     const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
     const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
     const [showDetailModal, setShowDetailModal] = useState(false);

     const videoRef = useRef<HTMLVideoElement>(null);
     const codeReader = useRef<BrowserMultiFormatReader | null>(null);

     useEffect(() => {
          if (typeof window !== 'undefined' && (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)) {
               console.warn("Media Devices API not available. Ensure you are using HTTPS.");
               setPermissionError("Camera access is not supported in this browser or context. Please ensure you are using HTTPS.");
               return;
          }

          codeReader.current = new BrowserMultiFormatReader();

          // Try to list devices initially, but don't worry if it's empty (permissions might not be granted yet)
          codeReader.current.listVideoInputDevices()
               .then((videoInputDevices) => {
                    setDevices(videoInputDevices);
                    if (videoInputDevices.length > 0) {
                         setSelectedDeviceId(videoInputDevices[0].deviceId);
                    }
               })
               .catch((err) => {
                    console.error("Error listing devices:", err);
               });

          return () => {
               if (codeReader.current) {
                    codeReader.current.reset();
               }
          };
     }, []);

     const refreshDevices = async () => {
          if (!codeReader.current) return;
          try {
               const videoInputDevices = await codeReader.current.listVideoInputDevices();
               setDevices(videoInputDevices);
               if (videoInputDevices.length > 0 && !selectedDeviceId) {
                    setSelectedDeviceId(videoInputDevices[0].deviceId);
               }
          } catch (err) {
               console.error("Error refreshing devices:", err);
          }
     };

     const getLocation = () => {
          setLocationError(null);
          if (!navigator.geolocation) {
               setLocationError("Geolocation is not supported by your browser.");
               return;
          }
          navigator.geolocation.getCurrentPosition(
               (position) => {
                    setLocation({
                         lat: position.coords.latitude,
                         lng: position.coords.longitude
                    });
               },
               (error) => {
                    setLocationError("Unable to retrieve your location. " + error.message);
               }
          );
     };

     const startScan = async (type: 'In' | 'Out' | 'Scan' = 'Scan') => {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
               setPermissionError("Camera access is not supported in this browser or context. Please ensure you are using HTTPS.");
               return;
          }

          if (type === 'In' || type === 'Out') {
               setAttendanceType(type);
               getLocation();
          } else {
               setAttendanceType(null);
          }

          setScanning(true);
          setResult(null);
          setCapturedImage(null);
          setPermissionError(null);
          setCaptureTime(null);

          try {
               // If no device selected, null will trigger default device and permission prompt
               const deviceIdToUse = selectedDeviceId || null;

               await codeReader.current?.decodeFromVideoDevice(
                    deviceIdToUse,
                    videoRef.current!,
                    (result, err) => {
                         if (result) {
                              setResult(result.getText());
                              setScanning(false);
                              setShowModal(true);
                              codeReader.current?.reset();
                         }
                         if (err && !(err instanceof NotFoundException)) {
                              console.error(err);
                         }
                    }
               );

               // After starting scan (which requests permissions), refresh device list
               await refreshDevices();

          } catch (error: any) {
               console.error(error);
               setScanning(false);
               if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    setPermissionError("Camera permission denied. Please allow camera access in your browser settings.");
               } else {
                    setPermissionError("Failed to start camera: " + (error.message || "Unknown error"));
               }
          }
     };

     const stopScan = () => {
          codeReader.current?.reset();
          setScanning(false);
          setAttendanceType(null);
     };

     const captureImage = () => {
          if (videoRef.current) {
               const canvas = document.createElement('canvas');
               canvas.width = videoRef.current.videoWidth;
               canvas.height = videoRef.current.videoHeight;
               const ctx = canvas.getContext('2d');
               if (ctx) {
                    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/png');
                    setCapturedImage(dataUrl);
                    setCaptureTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
                    setResult(null);

                    // For attendance, directly save without modal
                    if (attendanceType) {
                         const newRecord = {
                              id: Date.now(),
                              type: attendanceType,
                              user: user?.username || 'Unknown User',
                              employeeId: user?.employeeid || 'N/A',
                              role: user?.role || 'N/A',
                              time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                              location: location,
                              image: dataUrl
                         };
                         setAttendanceHistory(prev => [newRecord, ...prev]);
                         setAttendanceType(null);
                         setLocation(null);
                    } else {
                         // For barcode scanning, show modal
                         setShowModal(true);
                    }
                    stopScan();
               }
          }
     };

     const handleClose = () => {
          setShowModal(false);
          setResult(null);
          setCapturedImage(null);
          setAttendanceType(null);
     };

     const handleConfirmSubmission = () => {
          if (attendanceType && capturedImage) {
               const newRecord = {
                    id: Date.now(),
                    type: attendanceType,
                    user: user?.username || 'Unknown User',
                    employeeId: user?.employeeid || 'N/A',
                    role: user?.role || 'N/A',
                    time: captureTime,
                    location: location,
                    image: capturedImage
               };
               setAttendanceHistory(prev => [newRecord, ...prev]);
               handleClose();
          }
     };

     const handleViewDetails = (record: any) => {
          setSelectedRecord(record);
          setShowDetailModal(true);
     };

     const handleCloseDetailModal = () => {
          setShowDetailModal(false);
          setSelectedRecord(null);
     };

     return (
          <div className="container-fluid px-4 py-3">
               <div className="row g-4">
                    <div className="col-lg-7">
                         <div className="card h-100" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)' }}>
                              <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
                                   <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                                        <RiCameraLine size={22} className="me-2 flex-shrink-0" />
                                        Attendance & Scanner
                                   </h2>
                              </div>
                              <div className="card-body d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>

                                   <div className="position-relative mb-3" style={{ width: '100%', maxWidth: '640px', aspectRatio: '4/3', backgroundColor: '#000', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                        <video
                                             ref={videoRef}
                                             style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        {!scanning && (
                                             <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white bg-dark bg-opacity-75">
                                                  <div className="text-center">
                                                       <RiCameraLine size={48} className="mb-2" />
                                                       <p>Camera is off</p>
                                                  </div>
                                             </div>
                                        )}
                                        {scanning && attendanceType && (
                                             <div className="position-absolute top-0 start-0 m-3 badge bg-primary fs-6">
                                                  Clocking {attendanceType}
                                             </div>
                                        )}
                                   </div>

                                   <div className="d-flex gap-2 flex-wrap justify-content-center">
                                        {!scanning ? (
                                             <>
                                                  <Button variant="success" onClick={() => startScan('In')} className="px-4">
                                                       <RiTimeLine size={20} className="me-2" />
                                                       Clock In
                                                  </Button>
                                                  <Button variant="danger" onClick={() => startScan('Out')} className="px-4">
                                                       <RiTimeLine size={20} className="me-2" />
                                                       Clock Out
                                                  </Button>
                                                  <Button variant="outline-secondary" onClick={() => startScan('Scan')}>
                                                       <RiBarcodeBoxLine size={20} className="me-2" />
                                                       Scan Barcode
                                                  </Button>
                                             </>
                                        ) : (
                                             <>
                                                  <Button variant="secondary" onClick={stopScan}>
                                                       <RiStopCircleLine size={20} className="me-2" />
                                                       Cancel
                                                  </Button>
                                                  <Button variant="primary" onClick={captureImage}>
                                                       <RiCameraLensLine size={20} className="me-2" />
                                                       Capture & Submit
                                                  </Button>
                                             </>
                                        )}
                                   </div>

                                   {permissionError && (
                                        <div className="alert alert-danger mt-3">
                                             {permissionError}
                                        </div>
                                   )}

                                   {locationError && (
                                        <div className="alert alert-warning mt-3">
                                             <RiMapPinLine size={16} className="me-2" />
                                             {locationError}
                                        </div>
                                   )}

                                   {devices.length === 0 && !permissionError && (
                                        <p className="text-muted mt-3">Select an action to enable camera access.</p>
                                   )}

                                   {devices.length > 1 && !scanning && (
                                        <div className="mt-3">
                                             <select
                                                  className="form-select"
                                                  value={selectedDeviceId || ''}
                                                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                                             >
                                                  {devices.map((device) => (
                                                       <option key={device.deviceId} value={device.deviceId}>
                                                            {device.label || `Camera ${device.deviceId}`}
                                                       </option>
                                                  ))}
                                             </select>
                                        </div>
                                   )}

                              </div>
                         </div>
                    </div>

                    <div className="col-lg-5">
                         <div className="card h-100" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)' }}>
                              <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
                                   <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                                        <RiTimeLine size={22} className="me-2 flex-shrink-0" />
                                        Recent Activity ({attendanceHistory.length})
                                   </h2>
                              </div>
                              <div className="card-body p-0" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                   {attendanceHistory.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                             <p className="mb-0">No attendance records yet.</p>
                                             <small className="text-muted d-block mt-2">Clock in or out to see records here</small>
                                        </div>
                                   ) : (
                                        <div className="list-group list-group-flush">
                                             {attendanceHistory.map((record) => (
                                                  <div key={record.id} className="list-group-item p-3" style={{ cursor: 'pointer' }} onClick={() => handleViewDetails(record)}>
                                                       <div className="d-flex align-items-start">
                                                            <img
                                                                 src={record.image}
                                                                 alt="User"
                                                                 className="rounded me-3 object-fit-cover border"
                                                                 style={{ width: '80px', height: '80px' }}
                                                            />
                                                            <div className="flex-grow-1">
                                                                 <div className="d-flex justify-content-between align-items-center mb-2">
                                                                      <div>
                                                                           <h6 className="mb-0 fw-bold">{record.user}</h6>
                                                                           <small className="text-muted">ID: {record.employeeId} • {record.role}</small>
                                                                      </div>
                                                                      <span className={`badge ${record.type === 'In' ? 'bg-success' : 'bg-danger'}`}>
                                                                           Clock {record.type}
                                                                      </span>
                                                                 </div>
                                                                 <div className="small text-muted mb-1">
                                                                      <RiTimeLine size={14} className="me-1 align-text-bottom" />
                                                                      {record.time}
                                                                 </div>
                                                                 <div className="small text-muted">
                                                                      <RiMapPinLine size={14} className="me-1 align-text-bottom" />
                                                                      {record.location ?
                                                                           `${record.location.lat.toFixed(4)}, ${record.location.lng.toFixed(4)}` :
                                                                           'Location not available'
                                                                      }
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               <Modal show={showModal} onHide={handleClose} centered size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title>
                              {attendanceType ? `Attendance: Clock ${attendanceType}` : (result ? 'Scan Result' : 'Captured Image')}
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                         {attendanceType && (
                              <div className="mb-3 text-start border rounded p-3 bg-light">
                                   <h5 className="mb-3 border-bottom pb-2">Attendance Details</h5>
                                   <div className="mb-2">
                                        <RiUserLine size={18} className="me-2 text-muted" />
                                        <strong>User:</strong> {user?.username || 'Unknown User'}
                                   </div>
                                   <div className="mb-2">
                                        <RiTimeLine size={18} className="me-2 text-muted" />
                                        <strong>Time:</strong> {captureTime}
                                   </div>
                                   <div className="mb-2">
                                        <RiMapPinLine size={18} className="me-2 text-muted" />
                                        <strong>Location:</strong> {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Fetching location...'}
                                   </div>
                              </div>
                         )}

                         {result && (
                              <div className="alert alert-success text-break">
                                   <strong>Content:</strong> {result}
                              </div>
                         )}
                         {capturedImage && (
                              <div className="mt-3">
                                   <p className="text-muted mb-2">Captured Photo:</p>
                                   <img src={capturedImage} alt="Captured" className="img-fluid rounded border" style={{ maxHeight: '400px' }} />
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={handleClose}>
                              Close
                         </Button>
                         {attendanceType && (
                              <Button variant="primary" onClick={handleConfirmSubmission}>
                                   Confirm Submission
                              </Button>
                         )}
                    </Modal.Footer>
               </Modal>

               <Modal show={showDetailModal} onHide={handleCloseDetailModal} centered size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title>
                              Attendance Details - Clock {selectedRecord?.type}
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedRecord && (
                              <>
                                   <div className="row mb-4">
                                        <div className="col-md-5 text-center">
                                             <img
                                                  src={selectedRecord.image}
                                                  alt="User"
                                                  className="img-fluid rounded border shadow-sm"
                                                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                                             />
                                        </div>
                                        <div className="col-md-7">
                                             <div className="border rounded p-3 bg-light h-100">
                                                  <h5 className="mb-3 border-bottom pb-2">Employee Information</h5>
                                                  <div className="mb-3">
                                                       <RiUserLine size={18} className="me-2 text-primary" />
                                                       <strong>Name:</strong>
                                                       <div className="ms-4 mt-1">{selectedRecord.user}</div>
                                                  </div>
                                                  <div className="mb-3">
                                                       <RiUserLine size={18} className="me-2 text-primary" />
                                                       <strong>Employee ID:</strong>
                                                       <div className="ms-4 mt-1">{selectedRecord.employeeId}</div>
                                                  </div>
                                                  <div className="mb-3">
                                                       <RiUserLine size={18} className="me-2 text-primary" />
                                                       <strong>Role:</strong>
                                                       <div className="ms-4 mt-1">{selectedRecord.role}</div>
                                                  </div>
                                                  <div className="mb-3">
                                                       <span className={`badge ${selectedRecord.type === 'In' ? 'bg-success' : 'bg-danger'} fs-6 px-3 py-2`}>
                                                            Clock {selectedRecord.type}
                                                       </span>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="border rounded p-3 bg-light">
                                        <h5 className="mb-3 border-bottom pb-2">Time & Location Details</h5>
                                        <div className="mb-3">
                                             <RiTimeLine size={18} className="me-2 text-primary" />
                                             <strong>Timestamp:</strong>
                                             <div className="ms-4 mt-1">{selectedRecord.time}</div>
                                        </div>
                                        <div className="mb-3">
                                             <RiMapPinLine size={18} className="me-2 text-primary" />
                                             <strong>Location:</strong>
                                             <div className="ms-4 mt-1">
                                                  {selectedRecord.location ? (
                                                       <>
                                                            <div>Latitude: {selectedRecord.location.lat.toFixed(6)}</div>
                                                            <div>Longitude: {selectedRecord.location.lng.toFixed(6)}</div>
                                                            <a
                                                                 href={`https://www.google.com/maps?q=${selectedRecord.location.lat},${selectedRecord.location.lng}`}
                                                                 target="_blank"
                                                                 rel="noopener noreferrer"
                                                                 className="btn btn-sm btn-outline-primary mt-2"
                                                            >
                                                                 View on Map
                                                            </a>
                                                       </>
                                                  ) : (
                                                       'Location not available'
                                                  )}
                                             </div>
                                        </div>
                                   </div>
                              </>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={handleCloseDetailModal}>
                              Close
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}