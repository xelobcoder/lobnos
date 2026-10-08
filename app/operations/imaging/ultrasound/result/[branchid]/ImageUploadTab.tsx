"use client";

import React, { useEffect, useState } from 'react';
import { customFile, customFetch, customPost } from '../../../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import { ProgressBar } from 'react-bootstrap';
import { RiUploadLine, RiImageLine, RiEyeLine, RiDeleteBinLine } from '@remixicon/react';
import { apiPath } from '../../../../../../lib/apiBaseUrl';

interface SelectedFile {
     id: string;
     file: File;
     preview: string;
     name: string;
     size: number;
     type: string;
}

interface UploadedImage {
     id: number;
     name: string;
     size: number;
     url: string;
     uploadedAt: string;
}

interface ImageUploadTabProps {
     ascensionid?: string | null;
     testid?: string | null;
     patientid?: string | null;
}export default function ImageUploadTab({ ascensionid, testid, patientid }: ImageUploadTabProps) {
     const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
     const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
     const [uploadingImages, setUploadingImages] = useState(false);
     const [uploadProgress, setUploadProgress] = useState(0);

     const getImageUrl = (filename: string) => {
          if (!filename) return '';
          if (filename.startsWith('http')) return filename;

          return apiPath(`ultrasound/images/file/${filename}`);
     };

     const mapResponseToImages = (data: any[]): UploadedImage[] => {
          return data.map((item: any) => {
               if (typeof item === 'string') {
                    return {
                         id: Math.random(), // Temporary ID until refresh
                         name: item,
                         size: 0,
                         url: getImageUrl(item),
                         uploadedAt: new Date().toISOString(),
                    };
               }
               return {
                    id: item.id,
                    name: item.filename,
                    size: 0,
                    url: getImageUrl(item.filename),
                    uploadedAt: item.created_at,
               };
          });
     };

     const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
          const files = event.target.files;
          if (!files || files.length === 0) return;

          const filePromises = Array.from(files).map(async (file) => {
               const preview = URL.createObjectURL(file);
               return {
                    id: `${Date.now()}-${Math.random()}`,
                    file,
                    preview,
                    name: file.name,
                    size: file.size,
                    type: file.type,
               };
          });

          const newSelectedFiles = await Promise.all(filePromises);
          setSelectedFiles(prev => [...prev, ...newSelectedFiles]);

          event.target.value = '';
     };

     const handleRemoveSelectedFile = (fileId: string) => {
          setSelectedFiles(prev => {
               const fileToRemove = prev.find(f => f.id === fileId);
               if (fileToRemove) {
                    URL.revokeObjectURL(fileToRemove.preview);
               }
               return prev.filter(f => f.id !== fileId);
          });
     };

     const handleUploadSelectedFiles = async () => {
          if (selectedFiles.length === 0) return;

          setUploadingImages(true);
          setUploadProgress(0);

          try {
               const formData = new FormData();
               selectedFiles.forEach(file => {
                    formData.append('file', file.file);
               });
               formData.append('ascensionid', ascensionid || '');
               formData.append('testid', testid || '');
               formData.append('patientid', patientid || '');

               const response = await customFile('ultrasound/images/upload', formData);
               
               const isSuccess = response.statusCode == 200 || response.statusCode == "200" || response.status === 'success' || (response.message && response.message.includes('successfully'));
               const resultData = response.result || response.results;

               if (isSuccess) {
                    toast.success(response.message || 'Images uploaded successfully');
                    
                    if (resultData && Array.isArray(resultData)) {
                         setUploadedImages(mapResponseToImages(resultData));
                         // If we only got strings, refresh to get real IDs
                         if (resultData.length > 0 && typeof resultData[0] === 'string') {
                              fetchUploadedImages();
                         }
                    } else {
                         fetchUploadedImages();
                    }
               } else {
                    toast.error(response.message || 'Upload failed');
                    fetchUploadedImages();
               }

               selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
               setSelectedFiles([]);
          } catch (error) {
               console.error('Upload failed:', error);
               toast.error('Failed to upload images');
          } finally {
               setUploadingImages(false);
               setUploadProgress(0);
          }
     };

     const handleDeleteImage = async (imageId) => {
          try {
               await customPost(`ultrasound/images/${imageId}`, 'DELETE', {});
               setUploadedImages(prev => prev.filter(img => img.id !== imageId));
               toast.success('Image deleted successfully');
          } catch (error) {
               console.error('Delete failed:', error);
               toast.error('Failed to delete image');
          }
     };

     const fetchUploadedImages = async () => {
          try {
               const response = await customFetch(`ultrasound/images/${ascensionid}`);
               const isSuccess = response && (response.statusCode == 200 || response.statusCode == "200" || response.status === 'success');
               const resultData = response?.result || response?.results;

               if (isSuccess && Array.isArray(resultData)) {
                    setUploadedImages(mapResponseToImages(resultData));
               } else if (response && Array.isArray(response)) {
                    setUploadedImages(mapResponseToImages(response));
               }
          } catch (error) {
               console.error('Failed to fetch images:', error);
          }
     };

     useEffect(() => {
          if (ascensionid) {
               fetchUploadedImages();
          }
     }, [ascensionid]);

     useEffect(() => {
          return () => {
               selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
          };
     }, [selectedFiles]);

     return (
          <div>
               <div className="list-group pls-color br-5 mb-3">
                    <div className="list-group-item fw-bold text-uppercase bg-body-secondary pls-color d-flex justify-content-between align-items-center">
                         <span><RiUploadLine className="me-2" />Select Images to Upload</span>
                         {selectedFiles.length > 0 && (
                              <button
                                   className="btn btn-light btn-sm"
                                   onClick={handleUploadSelectedFiles}
                                   disabled={uploadingImages}
                              >
                                   <RiUploadLine className="me-1" />
                                   Upload {selectedFiles.length} Image{selectedFiles.length > 1 ? 's' : ''}
                              </button>
                         )}
                    </div>
                    <div className="list-group-item">
                         <div className="mb-3">
                              <label className="form-label fw-bold">Choose Images</label>
                              <input
                                   type="file"
                                   className="form-control"
                                   multiple
                                   accept="image/*"
                                   onChange={handleFileSelection}
                                   disabled={uploadingImages}
                              />
                              <div className="form-text">
                                   Select multiple images at once. You can preview and remove them before uploading.
                              </div>
                         </div>

                         {uploadingImages && (
                              <div className="mb-3">
                                   <div className="d-flex justify-content-between mb-1">
                                        <small>Uploading {selectedFiles.length} images...</small>
                                        <small>{uploadProgress}%</small>
                                   </div>
                                   <ProgressBar now={uploadProgress} animated />
                              </div>
                         )}
                    </div>
               </div>

               {selectedFiles.length > 0 && (
                    <div className="list-group pls-color br-5 mb-3">
                         <div className="list-group-item fw-bold text-uppercase bg-info text-white">
                              <RiImageLine className="me-2" />Selected Images ({selectedFiles.length})
                         </div>
                         <div className="list-group-item">
                              <div className="row">
                                   {selectedFiles.map((file) => (
                                        <div className="col-md-3 mb-3" key={file.id}>
                                             <div className="position-relative" style={{ border: '1px solid #dee2e6', borderRadius: '5px', overflow: 'hidden' }}>
                                                  <button
                                                       className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                                       style={{ zIndex: 10 }}
                                                       onClick={() => handleRemoveSelectedFile(file.id)}
                                                  >
                                                       ×
                                                  </button>
                                                  <img
                                                       src={file.preview}
                                                       alt={file.name}
                                                       className="img-fluid"
                                                       style={{ height: '120px', width: '100%', objectFit: 'cover' }}
                                                  />
                                                  <div className="p-2">
                                                       <div className="small fw-bold text-truncate mb-1" title={file.name}>
                                                            {file.name}
                                                       </div>
                                                       <div className="small text-muted">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>
               )}

               <div className="list-group pls-color br-5">
                    <div className="list-group-item fw-bold text-uppercase bg-secondary text-white">
                         <RiImageLine className="me-2" />Uploaded Images ({uploadedImages.length})
                    </div>
                    <div className="list-group-item">
                         {uploadedImages.length === 0 ? (
                              <p className="text-muted text-center mb-0">No images uploaded yet.</p>
                         ) : (
                              <div className="row">
                                   {uploadedImages.map((image) => (
                                        <div className="col-md-3 mb-3" key={image.id}>
                                             <div style={{ border: '1px solid #dee2e6', borderRadius: '5px', overflow: 'hidden' }}>
                                                  <img
                                                       src={image.url}
                                                       alt={image.name}
                                                       className="img-fluid"
                                                       style={{ height: '120px', width: '100%', objectFit: 'cover' }}
                                                  />
                                                  <div className="p-2">
                                                       <div className="small fw-bold text-truncate mb-2" title={image.name}>
                                                            {image.name}
                                                       </div>
                                                       <div className="small text-muted mb-2">
                                                            {(image.size / 1024 / 1024).toFixed(2)} MB
                                                       </div>
                                                       <div className="d-flex justify-content-between">
                                                            <button
                                                                 className="btn btn-outline-primary btn-sm"
                                                                 onClick={() => window.open(image.url, '_blank')}
                                                            >
                                                                 <RiEyeLine />
                                                            </button>
                                                            <button
                                                                 className="btn btn-outline-danger btn-sm"
                                                                 onClick={() => handleDeleteImage(image.id)}
                                                            >
                                                                 <RiDeleteBinLine />
                                                            </button>
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
     );
}
