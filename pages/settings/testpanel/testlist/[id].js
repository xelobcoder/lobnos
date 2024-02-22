import { useEffect, useState, useCallback, useContext } from "react";
import MainSettingsLayoutView from "../../../../components/settingsComponents/MainSettingsLayoutView";
import { useRouter } from "next/router";
import { customFetch, getDepartment, getSampleTypeList, defaultTestEditValues, handleChangeWithState, customPost } from "../../../../components/Auth/customFetch";
import Textarea from '@mui/joy/Textarea';
import Input from '@mui/joy/Input';
import { Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import AuthContext from "../../../../components/Auth/useAuthentification";
import Loader from "../../../../components/accessories/Loader";
export default function SingleTestEdit() {
   const { auth } = useContext(AuthContext);
   const employeeid = auth?.employeeid;
   const testid = useRouter().query.id;
   const [sampleType, setSample] = useState([]);
   const [category, setCategory] = useState([]);
   const [data, setTestData] = useState(defaultTestEditValues);
   const [isLoading, setLoading] = useState(true);


   const getTestParams = useCallback(async () => {
      if (testid) {
         setLoading(true);
         customFetch(`gettestpanel/edit?id=${testid}`)
            .then((data) => {
               setTestData(data)
               setLoading(false);
            })
            .catch((err) => {
               setLoading(false);
            })
      }
   }, [testid])

   useEffect(() => {
      getTestParams();
   }, [getTestParams])


   useEffect(() => {
      getDepartment(setCategory);
      getSampleTypeList(setSample);
   }, [])



   const handleSwitch = (event, target) => {
      if (!target) return;
      setTestData({ ...data, [target]: event.target.checked === true ? 1 : 0 });
   }



   const handleForm = async (ev) => {
      ev.preventDefault();
      const { category, sample_container, sample, name, testprice } = data;

      if (sample == "" || sample_container == "" || name == "" || category == 0 || sample == 0) {
         toast.error('sample type, container and category required', { autoClose: 2000 });
         return;
      }

      if (parseInt(testprice) < 0) {
         toast.error('test price must be 0 or more', { autoClose: 2000 });
         return;
      }

      const response = await customPost(`testpanel/list`, 'PUT', { ...data, employeeid });

      if (response.status === "success") {
         toast.success("test panel updated successfully", { autoClose: 500 });
      } else {
         toast.error("test panel not updated", { autoClose: 500 });
      }
   }


   const renderingView = () => {
      if (isLoading) return <Loader />
      else {
         return (
            <>
               <div className="mx-2">
                  <h5 className="text-capitalize">{data?.name}</h5>
               </div>

               <div className="border bg-white border-secondary-subtle mx-2 p-2">
                  <form className="mx-4">
                     <h5>Basic </h5>
                     <hr />
                     <div className="form-row grid-reg mt-2">
                        <label>category</label>
                        <select required className="custom-select"
                           value={data.category}
                           onChange={(ev) => {
                              handleChangeWithState(ev, "category", setTestData, data)
                           }}>
                           <option value=''>select a category</option>
                           {category.map((a, i) => <option key={i} value={a.id}>{a.department}</option>)}
                        </select>
                     </div>
                     <div className="form-row grid-reg mt-2">
                        <label>sample type</label>
                        <select required className="custom-select"
                           value={data.sample}
                           onChange={(ev) => {
                              handleChangeWithState(ev, "sample", setTestData, data);
                           }}>
                           <option value=''>select a sample type</option>
                           {sampleType.map((b, index) => <option value={b.id} key={index}>{b.name}</option>)}
                        </select>
                     </div>
                     <div className="form-row grid-reg mt-2">
                        <label>sample container</label>
                        <Input
                           onChange={(ev) => handleChangeWithState(ev, 'sample_container', setTestData, data)} type="text" className="custom-input" value={data.sample_container} />
                     </div>
                     <div className="form-row grid-reg mt-2">
                        <label>unit</label>
                        <Input onChange={(ev) => handleChangeWithState(ev, 'unit', setTestData, data)}
                           type="text" className="custom-input" value={data.unit} />
                     </div>
                     <div className="form-row grid-reg mt-2">
                        <label>sample qty</label>
                        <Input onChange={(ev) => handleChangeWithState(ev, 'qty_required', setTestData, data)}
                           type="text" className="custom-input" value={data.qty_required} />
                     </div>
                     <div className="form-row grid-reg mt-2">
                        <label>shorttext</label>
                        <Input type="text"
                           value={data.shorttext}
                           onChange={(ev) => handleChangeWithState(ev, 'shorttext', setTestData, data)}
                           className="custom-input" />
                     </div>
                     <div className="form-row grid-reg mt-2">
                        <label>cost of test</label>
                        <Input type="number"
                           onChange={(ev) => handleChangeWithState(ev, 'testcost', setTestData, data)}
                           className="custom-input" value={data.testcost} />
                     </div>
                     <div className="form-row grid-reg mt-2">
                        <label>test of price</label>
                        <Input type="number"
                           onChange={(ev) => handleChangeWithState(ev, 'testprice', setTestData, data)}
                           className="custom-input" value={data.testprice} />
                     </div>
                     <hr />
                     <h5>Description</h5>
                     <div className="form-row mt-2">
                        <Textarea minRows={5}
                           onChange={(ev) => handleChangeWithState(ev, 'description', setTestData, data)}
                           value={data.description}
                           placeholder="type test description here" />
                     </div>
                     <hr />
                     <h5>Configurations</h5>
                     <hr></hr>
                     <div className="form-row grid-reg mt-2">
                        <label>hasManual</label>
                        <Form.Switch
                           onChange={(ev) => { handleSwitch(ev, 'hasManual') }}
                           checked={data.hasManual == 1 ? true : false}
                           type='switch' style={{ fontSize: "25px" }} />
                     </div>
                     <div className="form-row grid-reg mt-2">
                        <label>show trend</label>
                        <Form.Switch
                           onChange={(ev) => { handleSwitch(ev, 'showtrend') }}
                           checked={data.showtrend == 1 ? true : false}
                           type='switch' style={{ fontSize: "25px" }} />
                     </div>
                     <div className="form-row grid-reg mt-2">
                        <label>outsourced test</label>
                        <Form.Switch
                           checked={data.isoutsourced == 1 ? true : false}
                           onChange={(ev) => { handleSwitch(ev, 'isoutsourced') }}
                           type='switch' style={{ fontSize: "25px" }} />
                     </div>
                     {
                        data.hasManual == 1
                        &&
                        (
                           <div className="form-row grid-reg mt-2">
                              <label>procedureCode</label>
                              <Input type="text"
                                 onChange={(ev) => { handleChangeWithState(ev, 'procedureCode', setTestData, data) }}
                                 className="custom-input" value={data.procedureCode} />
                           </div>
                        )
                     }
                     <hr />
                     <h5>Tat(Turn Around Time) set up</h5>
                     <div className="form-row grid-reg d-flex justify-content-between">
                        <Input type="number"
                           onChange={(ev) => handleChangeWithState(ev, 'tatCount', setTestData, data)}
                           className="custom-input" value={data.tatCount} placeholder="Count of test to use" />
                        <Input type="number"
                           onChange={(ev) => handleChangeWithState(ev, 'pre_Tat', setTestData, data)}
                           className="custom-input" value={data.pre_Tat} placeholder="Pre Tat value" />
                        <Input type="number"
                           onChange={(ev) => handleChangeWithState(ev, 'tat', setTestData, data)}
                           className="custom-input" value={data.tat} placeholder="Tat Value" />
                        <Input
                           onChange={(ev) => handleChangeWithState(ev, 'post_Tat', setTestData, data)}
                           type="number" className="custom-input" value={data.post_Tat} placeholder="Post Tat Value" />
                     </div>
                     <hr />
                     <div>
                        <button type='button' className="btn btn-success btn-sm mt-2"
                           onClick={(ev) => { handleForm(ev) }}>
                           save changes
                        </button>
                     </div>
                  </form>
               </div>
            </>
         )
      }
   }



   return (
      <MainSettingsLayoutView>
         <ToastContainer />
         {renderingView()}
      </MainSettingsLayoutView>
   )
}