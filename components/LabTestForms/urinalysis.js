import { Autocomplete, TextField, Typography, Button } from "@mui/material";
import { useEffect, useState } from "react";
import Indicator from "../accessories/Reports/indicator";
import { customFetch, validateFormData } from "../Auth/customFetch";
export default function Urinalysis({ clientdata }) {
  // have test been entered state
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


  const Appearanceoptions = ['', 'straw', 'Hazy', 'Cloudy', 'Turbid'];
  const Coloroptions = ['', 'straw', 'Amber', 'Light Amber', 'Deep', 'Amber Coffee',
    , 'reddish brown', 'Coffee Grand', 'pot wine', 'Not sure'];
  const variantoptions = ['', 'negative', 'positive(+)', 'trace', 'positive(++)', 'positive(+++)'];
  const specificoptions = ['', 1.020, 1.050, 1.030];


  // this will constatnt check for a check in the status of whether the test result have veen entered or not

  useEffect(() => {
    try {
      async function checkedEntered() {
        const response = await customFetch(`test/result/check?testname=urinalysis&&billingid=${clientdata.billingid}`)
        const { status, statusCode, result,records } = response;
        if (result == true && statusCode == 200 && records.length > 0) {
          setResultEntered(true)
          setData(records[0])
        }
      }

      checkedEntered()
    }
    catch (error) {
      console.log(error)
    }
  }, []);



  // this will handle the submit of the form

  const handleSubmit = async (e) => {
    e.preventDefault();

    async function callback(response) {
      const { status, statusCode, message } = response;
      // if the status is true, we set the result entered to true
      if (status == true) {
        setResultEntered(true)
        alert(message)
      }
      else {
        alert(message)
      }
    }
    try {
      await validateFormData({
        ...data,
        testname: 'urinalysis',
        billingid: clientdata.billingid,
        patientid: clientdata.patientid,
        testid: clientdata.testid,
      }, true, ['comment'], `test/result/enter`, callback)
    }
    catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div>
        <div className="p-4">
          <form>
            <h5>Urinalysis Test</h5>
            <Indicator resultEntered={resultEntered} />
            <div className="form-group">
              <Autocomplete
                size='small'
                value={data.appearance}
                onChange={(event, newValue) => { setData({ ...data, appearance: newValue }) }}
                options={Appearanceoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="Appearance" variant="filled" />}
              />
            </div>
            <div className="form-group mt-3">
              <Autocomplete
                size='small'
                value={data.color}
                onChange={(event, newValue) => { setData({ ...data, color: newValue }) }}
                options={Coloroptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="Color" variant="filled" />}
              />
            </div>
            <div className="form-group mt-3">
              <Autocomplete
                size='small'
                value={data.urobilinogen}
                onChange={(event, newValue) => { setData({ ...data, urobilinogen: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="urobilinogen" variant="filled" />}
              />
            </div>
            <div className="form-group mt-3">
              <Autocomplete
                size='small'
                value={data.ketones}
                onChange={(event, newValue) => { setData({ ...data, ketones: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="ketones" variant="filled" />}
              />
            </div>
            <div className="form-group mt-3">
              <Autocomplete
                size='small'
                value={data.bilirubin}
                onChange={(event, newValue) => { setData({ ...data, bilirubin: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="bilirubin" variant="filled" />}
              />
            </div>
            <div className="form-group mt-3">
              <Autocomplete
                size='small'
                value={data.nitrite}
                onChange={(event, newValue) => { setData({ ...data, nitrite: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="nitrite" variant="filled" />}
              />
            </div>
            <div className="form-group mt-3">
              <Autocomplete
                size='small'
                value={data.leukocytes}
                onChange={(event, newValue) => { setData({ ...data, leukocytes: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="leukocytes" variant="filled" />}
              />
            </div>
            <div className="form-group mt-3">
              <Autocomplete
                size='small'
                value={data.microalbumin}
                onChange={(event, newValue) => { setData({ ...data, microalbumin: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="microalbumin" variant="filled" />}
              />
            </div>
            <div className="form-group mt-3">
              <Autocomplete
                size='small'
                value={data.glucose}
                onChange={(event, newValue) => { setData({ ...data, glucose: newValue }) }}
                options={variantoptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="glucose" variant="filled" />}
              />
            </div>
            <div className="form-group mt-3">
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
            <div className="form-group mt-3 mb-2">
              <TextField size='small' value={data.ph} sx={{ width: '100%' }} step='0.1' type="number"
                onChange={(event) => { setData({ ...data, ph: parseFloat(event.target.value) }) }} label="ph" variant="filled" />
            </div>
            <Typography variant="h6">Microscopy</Typography>
            <div className="form-group mt-3">
              {/* comments */}
              <TextField size='small' value={data.remarks} sx={{ width: '100%' }} rows={4} multiline={true}
                onChange={(event) => { setData({ ...data, remarks: event.target.value }) }} label="comments" variant="filled" />
            </div>
            <div className="form-group mt-3">
              <Button type='button' variant='contained' color='primary' onClick={(e) => handleSubmit(e)}>save results</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}