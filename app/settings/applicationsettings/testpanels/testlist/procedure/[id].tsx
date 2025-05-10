import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { customFetch, customPost } from "../../../../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../../../../components/Auth/useApplicationContext";
const MARKDOWN_EDITOR = dynamic(() => import('../../../../../../components/accessories/markdownEditor'), { ssr: false })

export default function Procedure() {
   const { user } = useApplicationSettings().applicationsettings;
   const employeeid = user?.employeeid;
   const defaultdata = { testid: "", createdby: employeeid, proceduremanual: "", title: "" };
   const [data, setData] = useState(defaultdata);
   const [isloading, setLoading] = useState(true);
   const testid = useRouter().query.id;

   const updatedata = (event, newValue) => {
      setData({ ...data, proceduremanual: newValue });
   }


   useEffect(() => {
      if (testid) {
         setLoading(true);
         customFetch(`test/getProcedureManual?testid=${testid}`)
            .then((data) => {
               setLoading(false);
               data.length > 0 && setData(data[0])
            })
            .catch((err) => {
               setLoading(false);
            })
      }
   }, [testid])



   const updateResult = async (ev) => {
      ev.preventDefault();

      if (data.title != "" && data.proceduremanual != "" && employeeid) {
         const response = await customPost(`test/updateprocedureManual`, 'PUT', { ...data, employeeid });
         if (response.status === "success") {
            toast.success("procedure manual updated successfully", { autoClose: 500 })
         } else {
            toast.error("procedure manual update failed", { autoClose: 2000 })
         }
      }
   }


   return (
      <section>
               <div className="mx-2">
                  <h4>Procedure Manual </h4>
                  <input value={data.title}
                     onChange={(ev) => { setData({ ...data, title: ev.target.value }) }}
                     type='text' className='custom-input' placeholder="Type in title of Manual here here" />
               </div>
               <div className="mx-2 mt-2">
                  <MARKDOWN_EDITOR initialData={data.proceduremanual || 'Type procedure manual here'} updatedata={updatedata} />
               </div>
               <div className="mx-2 mt-2">
                  <button className="btn btn-sm btn-success" onClick={(ev) => { updateResult(ev) }}>
                     update manual
                  </button>
               </div>
            </section>
   )
}