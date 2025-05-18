"use client"
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import {useParams} from "next/navigation"
import { customFetch, customPost } from '../../../../../components/Auth/customFetch';
import Loader from '../../../../../components/accessories/Loader';
import { RiFolder2Fill, RiListOrdered } from "@remixicon/react";

export default function ReceiptUploadForm() {
     const [files, setFiles] = useState([]);
     const [previous, setPrevious] = useState([]);
     const [loading, setLoading] = useState(true);
     const [imagefull, setImageFull] = useState(false);
     const [deleteList, setDeleteList] = useState([]);
     const expenseid = useParams().id;

     const onDrop = useCallback((acceptedFiles) => {
          setFiles(acceptedFiles.map((file) => { return { file, preview: URL.createObjectURL(file) } }));
     }, []);

     const { getRootProps, getInputProps } = useDropzone({ onDrop });


     const uploadFiles = async () => {
          try {
               if (files.length == 0) {
                    return toast.warning('files not selected', { autoClose: 3000 });
               }
               const formData = new FormData();
               files.map((file, index) => {
                    file.file.originalname = `${Date.now()}-${expenseid}-${index}`;
                    return file
               }).forEach((item, index) => {
                    formData.append("images", item.file);
               })
               formData.append("receiptid", expenseid);

               const response = await fetch(`${process.env.BASEURL}expenses/receipt/upload?id=${expenseid}`, {
                    method: 'POST',
                    body: formData,
               })
               const resbody = await response.json();
               if (resbody?.status == 'success') {
                    toast.success("images uploaded successfully", { autoClose: 3000, position: 'top-center' });
                    console.log(files);
               }
          } catch (err) {
               toast.error("something wrong occured", { autoClose: 3000 })
          }
     }

     useEffect(() => {
          if (expenseid) {
               setLoading(true);
               customFetch(`expenses/receipt/uploaded/images/list?expenseid=${expenseid}`)
                    .then((data) => setPrevious(data))
                    .catch((err) => setPrevious([]))
                    .finally(() => { setLoading(false) })
          }
     }, [expenseid])



     const deleteReceipts = (ev) => {
          ev.preventDefault();
          if (deleteList.length > 0) {
               const confirmDeletion = confirm(`Do you really want to delete receipt uploaded?`);
               if (confirmDeletion) {
                    customPost(`expenses/receipt/uploaded/images`, 'DELETE', { data: deleteList })
                         .then((data) => {
                              if (typeof data == 'object' && data.status == "success") {
                                   for (let i = 0; i < deleteList.length; i++) {
                                        setPrevious((prev) => {
                                             return prev.filter((a, i) => a != deleteList[i]);
                                        })
                                   }
                                   toast.success('Receipt records deleted successfully', { autoClose: 3000, position: 'top-center' });
                                   setDeleteList([]);
                              }
                         }).catch((err) => {
                              console.log(err)
                         })
               }
          }
     }


     return (
          <div>
               <ToastContainer />
               <div className="mx-3 br-5 bg-white border-primary" style={{ borderStyle: 'dashed' }}>
                    <div {...getRootProps({ className: 'dropzone' })}>
                         <input {...getInputProps()} />
                         <div className="d-flex justify-content-center">
                              <RiFolder2Fill style={{ color: 'gray', fontSize: '100px' }} /> {/* Updated icon */}
                         </div>
                         <p className="text-center p-5">Drag & Drop images here, or click to select files</p>
                    </div>
               </div>
               {files.length > 0 && (
                    <div>
                         <div className="d-flex justify-content-between">
                              <h6 className="mt-3 mx-2">Selected Files:</h6>
                              <RiListOrdered className="pointer" fontSize="large" style={{ fontSize: '50px' }} onClick={(ev) => { setImageFull(!imagefull) }} /> {/* Updated icon */}
                         </div>
                         <ul className={`${imagefull ? "grid grid-100 container" : "grid-30-30-30"} bg-white border p-2`}>
                              {files.map((file) => (
                                   <li key={file.file.name}>
                                        <Image style={{ width: '100%' }} src={file.preview} alt={file.file.name} width={
                                             imagefull ? "1000" : "300"
                                        } className='mb-4'
                                             height={imagefull ? "600" : '300'} />
                                        {/* {file.file.name} */}
                                   </li>
                              ))}
                         </ul>
                    </div>
               )}
               <button className="btn btn-secondary btn-sm mx-3 mt-3" onClick={(ev) => { uploadFiles() }}> upload Image(s)</button>
               <hr />
               <div className="d-flex justify-content-between">
                    <h6>Previously Uploaded Image</h6>
                    <div>
                         <button onClick={(ev) => { deleteReceipts(ev) }} className="mb-2 mx-2  btn-sm btn btn-danger">
                              Delete receipts
                         </button>
                    </div>
               </div>
               <div>
                    {loading && <Loader />}
                    {previous.length == 0 ? <div className="alert alert-info">No Receipts Were Preveiously uploaded</div> : previous.map((item, index) => {
                         const url = `${process.env.BASEURL}expenses/receipt/upload/images?imageid=${item}`
                         return (<div key={index} style={{ display: 'grid', gridTemplateColumns: '5% 95%' }} >
                              <div>
                                   <input checked={deleteList.includes(item) ? true : false} onClick={(ev) => { setDeleteList([...deleteList, item]) }} type="checkbox" className="custom-input" />
                              </div>
                              <Image alt='expense receipt'
                                   className={'mb-3 container '}
                                   height={600}
                                   onClick={(ev) => { window.open(url) }}
                                   width={1000}
                                   src={url} />
                         </div>)

                    })}
               </div>
          </div>
     )
}
