import { useState } from "react";
export default function StkBatchNumber({ data }) {
   const { debitable } = data;
   const [batchnumber, setBatch] = useState(debitable || []);
  
   const renderer = () => {
      if (batchnumber.length == 0) {
         return <div>No Batchnumber Available</div>
      } else {
         return (
            <select className="custom-select">
               {
                  batchnumber.map((a, b) => {
                     return (<option key={b + 1}>{a.batchnumber}</option>)
                  })
               }
            </select>
         )
      }
   }
   return (
      <>
        {renderer()}
      </>
   )
}