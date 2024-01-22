import { useEffect, useState } from "react"
import { getDepartment } from "../../../Auth/customFetch";

export default function SelectedDeptServe({updateDept}) {
   const [departments, setDepartments] = useState([]);
   useEffect(() => {
      getDepartment(setDepartments);
   },[]);

   return (
      <>
         {
            departments.map((item, index) => <button onClick={(ev) => {updateDept(item?.id)}} className="btn btn-orange  mx-1 text-capitalize" key={index}>{item?.department}</button>)
         }
      </>
   )
}