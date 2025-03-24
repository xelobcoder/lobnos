import { useEffect, useState } from "react"
import { getDepartment } from "../../../../Lib/departLib";
import { DepartmentList } from "../../../interfaces/departmentInterface";

export default function SelectedDeptServe({ updateDept }) {
   const [departments, setDepartments] = useState<DepartmentList[]>([]);
   useEffect(() => {
      getDepartment(setDepartments);
   }, []);

   return (
      <>
         {Array.isArray(departments) && departments.length > 0 &&
            departments.map((item, index) => <button onClick={(ev) => { updateDept(item?.id) }} className="btn btn-orange  mx-1 text-capitalize" key={index}>{item?.department}</button>)
         }
      </>
   )
}