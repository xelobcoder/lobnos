import { Autocomplete, TextField, Typography,Button } from "@mui/material";
import { useState } from "react";
export default function Urinalysis() {
 const [data, setData] = useState({
  appearance: '',
  color: '',
  blood: '',
  bilirubin: '',
  ketones: '',
  nitrite: '',
  urobilinogen: '',
  glucose: '',
  leukocytes: '',
  specific_gravity: '',
  microalbumin: '',
  ph: '',
  comment: ''
 });


 const Appearanceoptions = ['', 'straw', 'Hazy', 'Cloudy', 'Turbid'];
 const Coloroptions = ['', 'straw', 'Amber', 'Light Amber', 'Deep', 'Amber Coffee',
  , 'reddish brown', 'Coffee Grand', 'pot wine', 'Not sure'];
 const variantoptions = ['', 'negative', 'positive(+)', 'trace', 'positive(++)', 'positive(+++)'];
 const specificoptions = ['', 1.020, 1.050, 1.030];

 return (
  <>
   <div>
    <div className="p-4">
     <form>
      <div className="form-group">
       <Autocomplete
        size='small'
        value={data.appearance}
        onChange={(event, newValue) => { setData({ ...data, appearance: newValue }) }}
        options={Appearanceoptions}
        getOptionLabel={(option) => option}
        renderInput={(params) => <TextField {...params} label="Appearance" variant="outlined" />}
       />
      </div>
      <div className="form-group mt-3">
       <Autocomplete
        size='small'
        value={data.color}
        onChange={(event, newValue) => { setData({ ...data, color: newValue }) }}
        options={Coloroptions}
        getOptionLabel={(option) => option}
        renderInput={(params) => <TextField {...params} label="Color" variant="outlined" />}
       />
      </div>
      <div className="form-group mt-3">
       <Autocomplete
        size='small'
        value={data.urobilinogen}
        onChange={(event, newValue) => { setData({ ...data, urobilinogen: newValue }) }}
        options={variantoptions}
        getOptionLabel={(option) => option}
        renderInput={(params) => <TextField {...params} label="urobilinogen" variant="outlined" />}
       />
      </div>
      <div className="form-group mt-3">
       <Autocomplete
        size='small'
        value={data.ketones}
        onChange={(event, newValue) => { setData({ ...data, ketones: newValue }) }}
        options={variantoptions}
        getOptionLabel={(option) => option}
        renderInput={(params) => <TextField {...params} label="ketones" variant="outlined" />}
       />
      </div>
      <div className="form-group mt-3">
       <Autocomplete
        size='small'
        value={data.bilirubin}
        onChange={(event, newValue) => { setData({ ...data, bilirubin: newValue }) }}
        options={variantoptions}
        getOptionLabel={(option) => option}
        renderInput={(params) => <TextField {...params} label="bilirubin" variant="outlined" />}
       />
      </div>
      <div className="form-group mt-3">
       <Autocomplete
        size='small'
        value={data.nitrite}
        onChange={(event, newValue) => { setData({ ...data, nitrite: newValue }) }}
        options={variantoptions}
        getOptionLabel={(option) => option}
        renderInput={(params) => <TextField {...params} label="nitrite" variant="outlined" />}
       />
      </div>
      <div className="form-group mt-3">
       <Autocomplete
        size='small'
        value={data.leukocytes}
        onChange={(event, newValue) => { setData({ ...data, leukocytes: newValue }) }}
        options={variantoptions}
        getOptionLabel={(option) => option}
        renderInput={(params) => <TextField {...params} label="leukocytes" variant="outlined" />}
       />
      </div>
      <div className="form-group mt-3">
       <Autocomplete
        size='small'
        value={data.microalbumin}
        onChange={(event, newValue) => { setData({ ...data, microalbumin: newValue }) }}
        options={variantoptions}
        getOptionLabel={(option) => option}
        renderInput={(params) => <TextField {...params} label="microalbumin" variant="outlined" />}
       />
      </div>
      <div className="form-group mt-3">
       <Autocomplete
        size='small'
        value={data.glucose}
        onChange={(event, newValue) => { setData({ ...data, glucose: newValue }) }}
        options={variantoptions}
        getOptionLabel={(option) => option}
        renderInput={(params) => <TextField {...params} label="glucose" variant="outlined" />}
       />
      </div>
      <div className="form-group mt-3">
       <Autocomplete
        size='small'
        value={data.specific_gravity}
        onChange={(event, newValue) => { setData({ ...data, specific_gravity: newValue }) }}
        options={specificoptions}
        getOptionLabel={(option) => option}
        renderInput={(params) => <TextField {...params} label="specific_gravity" variant="outlined" />}
       />
      </div>
      {/* ph */}
      <div className="form-group mt-3 mb-2">
       <TextField size='small' value={data.ph} sx={{ width: '100%' }}
        onChange={(event) => { setData({ ...data, ph: event.target.value }) }} label="ph" variant="outlined" />
      </div>
      <Typography variant="h6">Microscopy</Typography>
      <div className="form-group mt-3">
       {/* comments */}
       <TextField size='small' value={data.comment} sx={{ width: '100%' }} rows={4} multiline={true}
        onChange={(event) => { setData({ ...data, comment: event.target.value }) }} label="comments" variant="outlined" />
      </div>
      <div className="form-group mt-3">
       <Button type='button' variant='contained' color='primary'>save results</Button>
      </div>
     </form>
    </div>
   </div>
  </>
 )
}