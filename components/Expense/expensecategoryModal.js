import { useState } from "react"

export default function ExpenseCategory() {
     const [category, setCategory] = useState('');

     return (
          <div className="mx-2 my-2">
               <label>Expense Category</label>
               <input
                    className="custom-input"
                    type="text" value={category}
                    onChange={(ev) => {setCategory(ev.target.value) }}
                    name='category' />
               <button className="btn btn-primary btn-sm mb-2 my-2">
                    Add category
               </button>
          </div>
     )
}