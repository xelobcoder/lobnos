import { useEffect, useState } from "react"
import { customFetch, handleChangeWithState } from "../../../../components/Auth/customFetch";
import { Form } from 'react-bootstrap';
import MainSettingsLayoutView from "../../../../components/settingsComponents/MainSettingsLayoutView";
import TableDisplay from "../../../../components/accessories/TableDisplay";
import { useSearchParams } from "next/navigation";
export default function CreateTestFields() {
   const [data, setData] = useState([]);
   const [error, setError] = useState("");
   const testid = useSearchParams().get("testid");
   const [field, setField] = useState({});

   const handleCreateField = async () => {
      setError("");
      if (field.name.toString().length == 0) {
         setError('parameter or field name is required');
      }

      if (field.type.toString().length == 0) {
         setError('Data type of field required');
      }
      setData([...data, field]);
      setField({})
   }


   const columns = [
      { Header: 'name', accessor: 'name' },
      { Header: 'type', accessor: 'type' },
      { Header: 'hasoptions', accessor: 'hasoptions' },
      { Header: "haslimits", accessor: 'haslimits' },
      { Header: 'upperlimits', accessor: 'upperlimit' },
      { Header: 'lowerlimits', accessor: 'lowerlimit' },
      {
         Header: 'actions', accessor: '', Cell: ({ value }) => {
            return (<button className="btn btn-danger btn-sm">delete</button>)
         }
      }
   ]

   useEffect(() => {
      if (testid) {
         customFetch(`testpanel/list/customtestrule?testid=${testid}`)
            .then((data) => {
               console.log(data)
            }).catch((err) => {
               console.log(err)
            })
      }
   }, [testid])
   return (
      <MainSettingsLayoutView>
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
                  <label>has limits</label>
                  <Form.Switch
                     onChange={(ev) => {
                        setField({ ...field, haslimits: ev.target.checked })
                     }}
                     type='switch' style={{ fontSize: '25px' }} checked={field.haslimits} />
               </div>
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
            <TableDisplay column={columns} data={data} />
         </section>
      </MainSettingsLayoutView>
   )
}