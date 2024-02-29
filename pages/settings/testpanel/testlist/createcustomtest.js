import { useState } from "react";
import MainSettingsLayoutView from "../../../../components/settingsComponents/MainSettingsLayoutView";
import { customPost, handleChangeWithState } from "../../../../components/Auth/customFetch";
import { ToastContainer, toast } from 'react-toastify';

export default function CreateCustomTestList() {
   const [data, setData] = useState({ name: '', iscustom: 1 })

   const handleSubmit = async (ev) => {
      try {
         ev.preventDefault();
         if (data.name == "" || data.name.toString().length <= 0) {
            return toast.error("testname cannot be empty", { autoClose: 1000 })
         }
         const response = await customPost('testpanel/list/createcustom?stage=1', 'POST', data);
         if (response.status == "success") {
            toast.success("new test created successfully", { autoClose: 500 })
         } else {
            toast.error(response?.message || "test creation failed", { autoClose: 2000 });
         }
      } catch (err) {
         toast.error(err, { autoClose: 3000 })
      }
   }

   return (
      <MainSettingsLayoutView>
         <ToastContainer />
         <form className="mx-2 border border-secondary-subtle  p-2 bg-white">
            <div className="border-bottom">
               <h5>Create a custom test</h5>
            </div>
            <div className="form-row grid-reg mt-2 mx-2">
               <label className="mt-2">testname</label>
               <input value={data.name} onChange={(ev) => { handleChangeWithState(ev, 'name', setData, data) }} className="custom-input" type='text' />
            </div>
            <div className="d-flex justify-content-end">
               <button onClick={(ev) => { handleSubmit(ev) }} type='button' className="btn btn-primary btn-sm mt-2 ">
                  add test
               </button>
            </div>
         </form>
      </MainSettingsLayoutView>
   )
}