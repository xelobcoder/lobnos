import { useState } from "react"

export default function StkBrandList({ data }) {
   const { debitable } = data;
   const [brands, setBrands] = useState(debitable || []);
   return (
      <>
         {brands.length > 0
            &&
            (
            <select className="custom-select">
               {
               brands.map((a, b) => {
                  return( <option key={b+1}>{a.brand}</option>)
               })
               }
            </select>
            )} 
      </>
  )
}