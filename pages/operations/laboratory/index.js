import { useEffect, useState } from "react";
import Loader from "../../../components/accessories/Loader";
import { useRouter } from "next/navigation";
import { customFetch } from "../../../components/Auth/customFetch";

export default function LaboratoryEntryIndex() {
   const router = useRouter();

   useEffect(() => {
      customFetch("applicationsetting/resultsettings")
         .then((data) => {
            const { DepartmentEntry } = data;
            if (DepartmentEntry == 1) {
               router.push('/operations/laboratory/department')
            } else {
               router.push('/operations/viewtwo/departments');
            }
         })
         .catch((err) => {
            router.push('/operations/laboratory/department')
         })
   }, [router]);

   return (
      <div>
         <Loader />
      </div>
   )
}