import { useState } from "react";
export default function G6PD() {
 const [result, setResult] = useState('');
 const option = ['', 'full defect', 'partial defect', 'normal'];
 const handleResult = (e) => {
  console.log(result)
 }
 return (
  <>
     <div className="p-4">
      <label className="form-label">G6PD</label>
       <select className="custom-select" aria-label="Default select example" onChange={(e) => setResult(e.target.value)}>
         {option.map((item, index) => (
            <option key={index} value={item}>{item}</option>
         ))}
        </select>
  
    <button  type='button' className="btn btn-primary btn-sm"
     sx={{ mt: 3 }} onClick={(e) => { handleResult(e) }}>save results
    </button >
   </div>
  </>
 )
}