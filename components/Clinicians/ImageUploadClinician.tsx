import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

interface ImageUploadProps {
     onSubmit?: (data: File | null) => void;
     toast?: { success: (message: string) => void; error: (message: string) => void };
}

export default function ImageUploadClinician({ onSubmit, toast }: ImageUploadProps) {
     const [selectedImage, setSelectedImage] = useState<string | null>(null);
     const [file, setFile] = useState<File | null>(null);
     const [dragging, setDragging] = useState(false);
     const [error, setError] = useState<string | null>(null);

     const validateFile = (file: File) => {
          if (!["image/jpeg", "image/png"].includes(file.type)) {
               setError("Only JPEG and PNG files are allowed.");
               return false;
          }
          setError(null);
          return true;
     };

     const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
          const uploadedFile = event.target.files?.[0];
          if (uploadedFile && validateFile(uploadedFile)) {
               if (selectedImage) {
                    URL.revokeObjectURL(selectedImage);
               }
               const imageURL = URL.createObjectURL(uploadedFile);
               setSelectedImage(imageURL);
               setFile(uploadedFile);
          }
     };

     const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setDragging(false);
          const droppedFile = event.dataTransfer.files[0];
          if (droppedFile && validateFile(droppedFile)) {
               if (selectedImage) {
                    URL.revokeObjectURL(selectedImage);
               }
               const imageURL = URL.createObjectURL(droppedFile);
               setSelectedImage(imageURL);
               setFile(droppedFile);
          }
     };

     const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setDragging(true);
     };

     const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setDragging(false);
     };

     const submitHandler = (event: React.FormEvent) => {
          event.preventDefault();
          if (file) {
               if (onSubmit) {
                    onSubmit(file);
               } else if (toast) {
                    toast.success("Image submitted successfully!");
               }
          } else {
               if (toast) {
                    toast.error("Please upload an image before submitting.");
               }
          }
     };

     return (
          <div className="p-3">
               <Form onSubmit={submitHandler}>
                    <Form.Group>
                         <div
                              role="button"
                              aria-label="Upload image"
                              style={{
                                   height: "200px",
                                   width: "100%",
                                   border: "2px dashed #ddd",
                                   display: "flex",
                                   alignItems: "center",
                                   justifyContent: "center",
                                   backgroundColor: dragging ? "#f0f0f0" : "#fff",
                                   cursor: "pointer",
                              }}
                              onClick={() => document.getElementById("fileInput")?.click()}
                              onDrop={handleDrop}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                         >
                              {selectedImage ? (
                                   <img
                                        src={selectedImage}
                                        alt="Preview"
                                        style={{ maxHeight: "100%", maxWidth: "100%" }}
                                   />
                              ) : (
                                   <span>Drag & drop or click to select an image</span>
                              )}
                         </div>
                         <input
                              type="file"
                              id="fileInput"
                              accept="image/jpeg, image/png"
                              onChange={handleImageUpload}
                              style={{ display: "none" }}
                         />
                         {error && <Form.Text className="text-danger">{error}</Form.Text>}
                    </Form.Group>
               </Form>
          </div>
     );
}
