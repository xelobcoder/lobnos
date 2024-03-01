import { useEffect, useState } from "react"
import { customFetch, customPost, defaultCreationRule, handleChangeWithState } from "../../../../components/Auth/customFetch";
import { Form } from 'react-bootstrap';
import MainSettingsLayoutView from "../../../../components/settingsComponents/MainSettingsLayoutView";
import TableDisplay from "../../../../components/accessories/TableDisplay";
import { useSearchParams } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
export default function CreateTestFields() {
   const [data, setData] = useState([]);
   const [error, setError] = useState("");
   const testid = useSearchParams().get("testid");
   const testname = useSearchParams().get('testname');
   const [field, setField] = useState(defaultCreationRule);

   const handleCreateField = async () => {
      setError("");
      if (field.name.toString().length == 0) {
         return setError('parameter or field name is required');
      }

      if (field.type.toString().length == 0) {
         return setError('Data type of field required');
      }

      if (field.hasoptions == true) {
         setField({ ...field, field: 'select' })
      } else {
         setField({ ...field, field: 'input' })
      }
      setData([...data, field]);
      setField(defaultCreationRule);
   }


   const removeField = async (item) => {
      const { name } = item;
      setData((prev) => {
         const filtered = prev.filter((a, index) => a.name != name);
         return filtered;
      })
   }


   const columns = [
      { Header: 'name', accessor: 'name' },
      { Header: 'type', accessor: 'type' },
      { Header: 'hasoptions', accessor: 'hasoptions', Cell: ({ value }) => { return <div>{value === true ? "Yes" : 'No'}</div> } },
      { Header: "haslimits", accessor: 'haslimits', Cell: ({ value }) => { return <div>{value === true ? "Yes" : 'No'}</div> } },
      { Header: 'upperlimits', accessor: 'upperlimit' },
      { Header: 'lowerlimits', accessor: 'lowerlimit' },
      {
         Header: 'actions', accessor: '', Cell: ({ value, row }) => {
            return (<button onClick={(ev) => { removeField(row.original) }} className="btn btn-danger btn-sm">remove field</button>)
         }
      }
   ]

   useEffect(() => {
      if (testid) {
         customFetch(`testpanel/list/customtestrule?testid=${testid}`)
            .then((data) => {
               setData(data);
            }).catch((err) => {
               console.log(err);
            })
      }
   }, [testid])


   const updateFieldsRules = async () => {
      if (data.length === 0) return;
      const response = await customPost('testpanel/list/customtestrule', 'PUT', { testid, data });
      if (response.status === true) {
         toast.success('test fields updated successfully', { autoClose: 500 });
      } else {
         toast.error(response?.message || 'test fields creation failed', { autoClose: 2000 })
      }
   }
   return (
      <MainSettingsLayoutView>
         <ToastContainer />
         <h5 className="mx-2 text-capitalize">{testname}</h5>
         <section className="mx-2 bg-white border border-secondary-subtle p-2">
            <h5>Parameter / field Creation</h5>
            <hr />
            <div>
               <div className={error.length > 0 ? "alert alert-danger" : ''}>
                  {error}
               </div>
               <div className="form-row">
                  <label>Field name</label>
                  <input
                     value={field?.name}
                     placeholder="name"
                     onChange={(ev) => { handleChangeWithState(ev, 'name', setField, field) }} className="custom-input" type="text" />
               </div>
               <div className="form-row">
                  <label>data type</label>
                  <select
                     value={field?.type}
                     placeholder=""
                     onChange={(ev) => { handleChangeWithState(ev, 'type', setField, field) }} className="custom-select" type="text" >
                     <option value=''>select data type of field</option>
                     <option value='number'>number</option>
                     <option value='text'>text</option>
                  </select>
               </div>
               <div>
                  <label>has options</label>
                  <Form.Switch
                     onChange={(ev) => {
                        const value = ev.target.checked;
                        if (value === true) {
                           setField({ ...field, hasoptions: value, haslimits: false })
                        } else {
                           setField({ ...field, hasoptions: value })
                        }
                     }}
                     type='switch' style={{ fontSize: '25px' }} checked={field.options} />
               </div>
               <div>
                  <label>has units</label>
                  <Form.Switch
                     onChange={(ev) => {
                        const value = ev.target.checked;
                        setField({ ...field, hasunits: value, })
                     }}
                     type='switch' style={{ fontSize: '25px' }} checked={field.hasunits} />
               </div>
               <div>
                  <label>has limits</label>
                  <Form.Switch
                     onChange={(ev) => {
                        setField({ ...field, haslimits: ev.target.checked })
                     }}
                     type='switch' style={{ fontSize: '25px' }} checked={field.haslimits} />
               </div>
               {field.hasunits && (<div>
                  <label>field units</label>
                  <input
                     onChange={(ev) => { handleChangeWithState(ev, 'units', setField, field) }}
                     value={field.units} multiple className="custom-input" />
               </div>)}
               {field.hasoptions && (<div>
                  <label>options(separate options using a comma delimiter)</label>
                  <input
                     onChange={(ev) => { handleChangeWithState(ev, 'options', setField, field) }}
                     value={field.options} multiple className="custom-input" />
               </div>)}
               {field.haslimits && field.type == 'number' && !field.hasoptions && (<div>
                  <label>limits</label>
                  <div className="d-flex justify-content-between">
                     <input
                        placeholder="upper limit"
                        type='number'
                        onChange={(ev) => { handleChangeWithState(ev, 'upperlimit', setField, field) }}
                        value={field.upperlimit} className="custom-input" />
                     <input
                        placeholder="lower limit"
                        type='number'
                        onChange={(ev) => { handleChangeWithState(ev, 'lowerlimit', setField, field) }}
                        value={field.lowerlimit} className="custom-input mx-2" />
                  </div>
               </div>)}
               <button onClick={(ev) => { handleCreateField() }} className="btn btn-success btn-sm mt-2">create field</button>
            </div>
         </section>
         <section className="mx-2">
            {data.length > 0 && (
               <div>
                  <TableDisplay showpage={false} column={columns} data={data} />
                  <div>
                     <button onClick={(ev) => { updateFieldsRules() }} className="btn btn-success btn-sm mt-2">update fields</button>
                  </div>
               </div>
            )}
         </section>
      </MainSettingsLayoutView>
   )
}