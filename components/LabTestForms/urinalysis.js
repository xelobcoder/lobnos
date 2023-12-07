import { Autocomplete, TextField} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import Indicator from "../accessories/Reports/indicator";
import {  getHematologicalResultEntered, handleComments, validateFormData } from "../Auth/customFetch";
import CommentSection from "./commentSection";
import { ToastContainer, toast } from 'react-toastify';
import ISLOADING from "../isLoading";
export default function Urinalysis({ clientdata,employeeid}) {
  const { billingid, test, patientid, testid } = clientdata;
  const [loading, setLoading] = useState(true);
  const [resultEntered, setResultEntered] = useState(false);
  const [data, setData] = useState({
    appearance: '',
    color: '',
    blood: 'yellpw',
    bilirubin: '',
    ketones: '',
    nitrite: '',
    urobilinogen: '',
    glucose: '',
    leukocytes: '',
    specific_gravity: '',
    microalbumin: '',
    ph: '',
    remarks: ''
  });


  const Appearanceoptions = ["", "straw", "Hazy", "Cloudy", "Turbid"];
  const Coloroptions = [
    "",
    "straw",
    "Amber",
    "Light Amber",
    "Deep",
    "Amber Coffee",
    ,
    "reddish brown",
    "Coffee Grand",
    "pot wine",
    "Not sure",
  ];
  const variantoptions = [
    "",
    "negative",
    "positive(+)",
    "trace",
    "positive(++)",
    "positive(+++)",
  ];
  const specificoptions = ["", 1.02, 1.05, 1.03];


  // this will constatnt check for a check in the status of whether the test result have veen entered or not

  const getPreviosResult = useCallback(async () => {
    getHematologicalResultEntered(billingid, test, setLoading, setData, setResultEntered);
  }, [billingid, test]);


  useEffect(() => {
    getPreviosResult();
  }, [getPreviosResult]);



  // this will handle the submit of the form

  const handleSubmit = async (e) => {
    const handleCallback = async (reponse) => {
      const { status, message, statusCode } = reponse;
      if (status === 'success' && statusCode === 200) {
        setResultEntered(true); 
        toast.success(message,{autoClose: 500});
      } else {
        toast.error(message,{autoClose: 500});
      }
     }
    e.preventDefault();
    await validateFormData({ ...data, billingid, testname:test, patientid, testid, employeeid }, true, [], 'test/result/enter', handleCallback);
  }

  return (
    <>
      <ToastContainer />
      <div className="mx-3">
        <div className="card">
          <div className="card-header modal-color">
            <h5>Urinalysis Test</h5>
            <Indicator resultEntered={resultEntered} />
          </div>
          <div className="card-body">
            {loading && <ISLOADING />}
            {!loading && (
              <>
                            <div>
              <Autocomplete
                size='small'
                value={data.appearance}
                onChange={(event, newValue) => { setData({ ...data, appearance: newValue }) }}
                options={Appearanceoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="Appearance" variant="filled" />}
              />
            </div>
            <div >
              <Autocomplete
                size='small'
                value={data.color}
                onChange={(event, newValue) => { setData({ ...data, color: newValue }) }}
                options={Coloroptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="Color" variant="filled" />}
              />
            </div>
            <div >
              <Autocomplete
                size='small'
                value={data.urobilinogen}
                onChange={(event, newValue) => { setData({ ...data, urobilinogen: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="urobilinogen" variant="filled" />}
              />
            </div>
            <div >
              <Autocomplete
                size='small'
                value={data.ketones}
                onChange={(event, newValue) => { setData({ ...data, ketones: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="ketones" variant="filled" />}
              />
            </div>
            <div >
              <Autocomplete
                size='small'
                value={data.bilirubin}
                onChange={(event, newValue) => { setData({ ...data, bilirubin: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="bilirubin" variant="filled" />}
              />
            </div>
            <div >
              <Autocomplete
                size='small'
                value={data.nitrite}
                onChange={(event, newValue) => { setData({ ...data, nitrite: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="nitrite" variant="filled" />}
              />
            </div>
            <div >
              <Autocomplete
                size='small'
                value={data.leukocytes}
                onChange={(event, newValue) => { setData({ ...data, leukocytes: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="leukocytes" variant="filled" />}
              />
            </div>
            <div >
              <Autocomplete
                size='small'
                value={data.microalbumin}
                onChange={(event, newValue) => { setData({ ...data, microalbumin: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="microalbumin" variant="filled" />}
              />
            </div>
            <div >
              <Autocomplete
                size='small'
                value={data.glucose}
                onChange={(event, newValue) => { setData({ ...data, glucose: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="glucose" variant="filled" />}
              />
            </div>
            <div >
              <Autocomplete
                size='small'
                value={data.specific_gravity}
                onChange={(event, newValue) => { setData({ ...data, specific_gravity: parseFloat(newValue) }) }}
                options={specificoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="specific_gravity" variant="filled" />}
              />
            </div>
            {/* ph */}
            <div >
              <TextField size='small' value={data.ph} sx={{ width: '100%' }} step='0.1' type="number"
                onChange={(event) => { setData({ ...data, ph: parseFloat(event.target.value) }) }} label="ph" variant="filled" />
              </div>
            <CommentSection getcomment={handleComments}  target={'remarks'} datasource={data} datafunction={setData} value={data.remarks} />
                <div ></div>
                <button type='button ' className="btn btn-primary btn-sm mt-2" onClick={(e) => handleSubmit(e)}>save results</button >
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}