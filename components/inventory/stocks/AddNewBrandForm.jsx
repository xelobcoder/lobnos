import { useState } from "react"

export default function AddNewBrandForm({ updateBrands }) {
   const [brand, setBrand] = useState('');
   return (
      <form className="my-2 mx-3">
         <label>Brand Name</label>
         <input value={brand} onChange={(ev) => {setBrand(ev.target.value)}} className="custom-input" type='text' />
         <button type="button" onClick={(ev) => { updateBrands(brand); setBrand('') }}  className="btn btn-primary btn-sm mt-2">
            save brand
          </button>
     </form>
   )
}