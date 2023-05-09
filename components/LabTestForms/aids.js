import { useState } from "react";
import { Autocomplete, TextField, Typography, Button } from "@mui/material";
import CommentSection from "./commentSection";
import { handleComments, validateFormData, handleResponse } from "../Auth/customFetch";
import Indicator from "../accessories/Reports/indicator";
function AIDS({clientdata}) {
  const {billingid, testid, test, patientid} = clientdata;
  const [results, setResults] = useState({
    reaction: 'non reactive',
    comments: ''
  });
  const options = ['reactive', 'non reactive', ""];

  const handleResult = async function (e) {
    const newdata = {... results, billingid,patientid,testid,testname: test}
    await validateFormData(newdata, true, [], 'test/result/enter', handleResponse)
  }

  return (
    <>
      <div className="p-4">
        <div className="mb-3">
          <Typography variant='h6'>A.I.D.S</Typography>
          <Indicator/>
        </div>
        <form>
          <Autocomplete options={options} onChange={(e, newValue) => setResults({ ...results, reaction: newValue })} value={results.reaction} size='small' renderInput={(params) => <TextField {...params} label='results' />}
            getOptionLabel={(option) => option}
          />
          <CommentSection getcomment={handleComments} target={'comments'} datasource={results} datafunction={setResults} value={results.comments} />
          <Button variant="contained" color='primary'
            onClick={handleResult}
            sx={{ mt: 3 }}>save changes</Button>
        </form>
      </div>
    </>
  )
}


export default AIDS;