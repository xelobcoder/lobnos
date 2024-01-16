import { useEffect, useState } from "react"

export default function AddNewBrandForm({ updateBrands,editing }) {
   const [brand, setBrand] = useState('');
   const [method, setMethod] = useState('POST');

   useEffect(() => {
      const { edit, data } = editing;
      if (edit === true && data.brandid) {
         setBrand(data?.brand);
         setMethod('PUT');
      }
   }, [editing]);

   return (
      <form className="my-2 mx-3">
         <label>Brand Name</label>
         <input value={brand} onChange={(ev) => {setBrand(ev.target.value)}} className="custom-input" type='text' />
         <button type="button" onClick={(ev) => {
            updateBrands(
               method === 'POST' ? brand : {...editing.data,brand}
               , method); setBrand(''); setMethod('POST'); }}  className="btn btn-primary btn-sm mt-2">
            save brand
          </button>
     </form>
   )
}