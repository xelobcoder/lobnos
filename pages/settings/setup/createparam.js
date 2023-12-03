import { useState } from "react";
import CHEMISTRY_LAYOUT_SETUP from "../../../components/setup/biochemistry/Layout";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { customPost } from "../../../components/Auth/customFetch";


export default function CREATE_PARAMETER() {
  const defaultValue = { unit: "", parameter: "", upper: 0, lower: 0 };
  const [parameterDetails, setDetails] = useState(defaultValue);
  const [data, setData] = useState([]); 
  const target = useSearchParams().get('target');
  const gender = useSearchParams().get('gender');

  useEffect(() => {
    if (gender) { setDetails({ ...defaultValue, gender: '' }) };
},[gender])

  const handleSaving = async function () {
    const ObjectValues = Object.values(parameterDetails).includes("") || Object.values(parameterDetails).includes(0);
    if (ObjectValues) { 
      toast.error('fill all fields',{position:'top-center',autoClose:500})
      return;
    } else {
      if (data.length === 0) {
        setData([parameterDetails])
        setDetails(defaultValue)
        return;
      } else { 
        //  filter out the parameter that has the same name as the one being added
        let filteredData = [];
        if (gender == 'true') {
          // compare both gender and parameter
          filteredData = data.filter(item => {
            if (parameterDetails?.parameter === item?.parameter) {
              return item?.gender != parameterDetails?.gender;
            } else {
              return item?.parameter != parameterDetails?.parameter
               }
           })
        } else {
          // compare only parameter
          filteredData = data.filter(item => {
            return item?.parameter != parameterDetails?.parameter
          })
        }
        setData([...filteredData, parameterDetails])
        // if gender is true, we assume you want to add for both male and female and hence we dont want to clear the text field
        return;
      }
    }
  }

 

  const handleCreation = async function (ev) { 
    ev.preventDefault();
    if (data.length === 0) {
      toast.warning('Add parameter to save',{position:'top-center',autoClose:500})
      return;
    }
    const requestData = { parameterDetails: data, target }
    const response = await customPost('test/setup/createparams', 'POST', requestData)
    const {status,statusCode,message} = response;
    if(status == 'success' && statusCode == 200){
      setDetails(defaultValue)
      toast.success(message)
    }
    else{
      toast.error(message)
    }
  }
  return (
    <>
      <CHEMISTRY_LAYOUT_SETUP>
        <ToastContainer/>
        <div className="card mx-3 my-3">
          <div className="card-header bg-secondary text-white">
            <h4 className="card-title text-capitalize">Create Parameter for  {target || ''}</h4>
          </div>
          <div className="card-body" >
          <form className="form-row d-flex gap-2 justify-content-between" >
          <input
            className="form-control"
            value={parameterDetails.parameter}
            placeholder="parameter name"
            onChange={(e) =>
              setDetails({ ...parameterDetails, parameter: e.target.value })
            }
            type="text"
          />
          <input
            className="form-control"
            value={parameterDetails.unit}
            placeholder="unit"
            type="text"
            onChange={(e) => {
              setDetails({ ...parameterDetails, unit: e.target.value });
            }}
          />
          <input
            className="form-control"
            value={parameterDetails.upper}
            placeholder="upper limit"
            type="number"
            onChange={(e) => {
              setDetails({ ...parameterDetails, upper: e.target.value });
            }}
          />
          <input
            className="form-control"
            value={parameterDetails.lower}
            placeholder="lower limit"
            type="number"
            onChange={(e) => {
              setDetails({ ...parameterDetails, lower: e.target.value });
            }}
              />
              {
                gender == 'true' && (
                  <select className="form-control" value={parameterDetails?.gender} onChange={(ev) => {setDetails({...parameterDetails, gender:ev.target.value})}}>
                    <option>select gender</option>
                    <option value={'male'}>male</option>
                    <option value={'female'}>female</option>
                  </select>
                )
              }
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSaving}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
</svg>
                </button>
            </form>
            
            <table className="billing-cart-table my-3">
              <thead>
                <tr>
                  <th>parameter name</th>
                  <th>unit</th>
                  <th>upper</th>
                  <th>lower</th>
                  {gender == 'true' && <th>gender</th>}
                </tr>
              </thead>
              <tbody>
                {data.length > 0 &&(
                  data.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{item.parameter}</td>
                        <td>{item.unit}</td>
                        <td>{item.upper}</td>
                        <td>{item.lower}</td>
                        {gender == 'true' && <td>{ item?.gender}</td>}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            <button onClick={(ev) => {handleCreation(ev)}} className="btn btn-primary btn-sm my-3" type="button">save paramaters</button>
          </div>
        </div>
       
      </CHEMISTRY_LAYOUT_SETUP>
    </>
  );
}
