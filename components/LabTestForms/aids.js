import { useMemo, useState } from "react";
import { Autocomplete, TextField, Typography, Button } from "@mui/material";
import CommentSection from "./commentSection";
import { CheckResultEntered, handleComments, validateFormData } from "../Auth/customFetch";
import Indicator from "../accessories/Reports/indicator";
function AIDS({ clientdata }) {
  const { billingid, testid, test, patientid } = clientdata;
  // state for managing if result have been entered
  const [resultEntered, setResultEntered] = useState(false);
  const [results, setResults] = useState({
    reaction: 'non reactive',
    comments: ''
  });
  const options = ['reactive', 'non reactive', ""];

  const handleResult = async function (e) {
    const handleResponse = async (response) => {
      const { status, message, statusCode } = response;

      if (status == 'success') {
        alert(message);
        setResultEntered(true);
      }
    }
    const newdata = { ...results, billingid, patientid, testid, testname: test }
    await validateFormData(newdata, true, [], 'test/result/enter', handleResponse)
  }


  // use for checking if result have been entered or not

  useMemo(() => {
    const getData = async function () {
      const response = await CheckResultEntered(test, billingid);
      const { result, statusCode, message, records } = response;
      // if result is true
      if (result && statusCode == 200) {
        // make indicator turn green to indicate result was previously entered
        setResultEntered(true);
        const reaction = records[0]['reaction'];
        const comments = records[0]['comments'];
        setResults({
          reaction, comments
        })
      }
    }
    getData();
  }, [])

  return (
    <>
      <div className="p-4">
        <div className="mb-3">
          <Typography variant='h6'>A.I.D.S</Typography>
          <Indicator resultEntered={resultEntered} />
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