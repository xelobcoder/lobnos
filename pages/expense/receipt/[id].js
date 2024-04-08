import { Add } from "@mui/icons-material";
import ExpenseLayout from "../../../components/Expense/ExpenseLayout";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/router";

export default function ReceiptUploadForm() {
     const [files, setFiles] = useState([]);
     const expenseid = useRouter().query.id;

     const onDrop = useCallback((acceptedFiles) => {
          // Do something with the files, like upload to a server or display preview
          setFiles(
               acceptedFiles.map((file) => {
                    return {
                         file,
                         preview: URL.createObjectURL(file) // Create preview URL
                    }
               })
          );
     }, []);

     const { getRootProps, getInputProps } = useDropzone({ onDrop });


     const uploadFiles = () => {
          const formData = new FormData();
          files.map((file, index) => {
               file.file.originalname = `${Date.now()}-${expenseid}-${index}`;
               return file
          }).forEach((item, index) => {
               formData.append("images", item.file);
          })
          formData.append("receiptid", expenseid);

          fetch(`${process.env.BASEURL}/expenses/receipt/upload?id=${expenseid}`, {
               method: 'POST',
               body: formData,
          })
          console.log(formData)
     }

     return (
          <ExpenseLayout>
               <div className="container mt-5 border border-primary br-5 p-5">
                    <div {...getRootProps({ className: 'dropzone' })}>
                         <input {...getInputProps()} />
                         <p className="text-center">Drag & Drop images here, or click to select files</p>
                    </div>
               </div>
               {files.length > 0 && (
                    <div>
                         <h4 className="mt-3 mx-4">Selected Files:</h4>
                         <ul className="grid-30-30-30">
                              {files.map((file) => (
                                   <li key={file.file.name}>
                                        <img src={file.preview} alt={file.file.name} width={"300"} height={'300'} />
                                        {/* {file.file.name} */}
                                   </li>
                              ))}
                         </ul>
                    </div>
               )}
               <button className="btn btn-secondary btn-sm mx-5" onClick={(ev) => { uploadFiles() }}> upload Image(s)</button>
          </ExpenseLayout>
     )
}
