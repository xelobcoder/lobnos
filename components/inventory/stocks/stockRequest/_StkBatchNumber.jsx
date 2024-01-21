import { useState } from "react";
export default function StkBatchNumber({ data }) {
   const { debitable } = data;
   const [batchnumber, setBatch] = useState(debitable || []);
   console.log(data);
   return (
      <>
         {batchnumber.length > 0
            &&
            (
               <select className="custom-select">
                  {
                     batchnumber.map((a, b) => {
                        return (<option key={b + 1}>{a.batchnumber}</option>)
                     })
                  }
               </select>
            )}
      </>
   )
}