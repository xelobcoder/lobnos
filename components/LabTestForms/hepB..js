import { Autocomplete, Button, TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { CheckResultEntered, customPost } from "../Auth/customFetch";
import CommentSection from "./commentSection";
export default function HepatitisB({ clientdata }) {
  const [client, setClientData] = useState(clientdata);
  // state for handling if result was previously entered
  const [resultEntered, setResultEntered] = useState(false);
  // select options
  const option = ['', 'reactive', 'non reactive'];
  // results of  test here 
  const [result, setResults] = useState({
    result: '',
    remarks: ''
  });
  // handle results


  const handleTestResult = async (e) => {
    e.preventDefault();
    if (result === '') {
      alert('please select a result');
      return;
    }
    else {
      let response = await customPost("test/result/enter", "POST", {
        testname: "hepatitisb",
        patientid: client.patientid,
        billingid: client.billingid,
        scientistid: 2,
        result: result.result,
        remarks: result.remarks,
      });

      const { statusCode, message } = response;
      if (statusCode == 200) {
        setResultEntered(true);
        alert(message);
      } else {
        alert(message);
      }
    }
  }

  // THIS CHECKS IF A RESULT WAS PREVIOUSLY ENTERED AND UPDATES THE STATE
  // IF RESULT WAS PREVIOUSLY ENTERED, THE RESULT IS DISPLAYED IN THE AUTOCOMPLETE

  useMemo(() => {
    const check = async () => {
      let customSend = await CheckResultEntered('hepatitisb', client.billingid);
      const { result, statusCode,records} = customSend;
      if (statusCode == 200) {
        result == false ? setResultEntered(false) : setResultEntered(true);
        if (result == true) {
          setResults(
            {remarks:  records[0].REMARKS,
            result: records[0].RESULTS}
          )
        }
      }
      else {
        alert('something went wrong');
      }
    }

    check();
  }, [resultEntered])


  console.log(result);


  const handleComments = (e) => {
    setResults({ ...result, remarks: e.target.value })
  }
  return (
    <>
      <div className="p-4">
        <div className="d-flex justify-content-end mb-2" >
          <div className={resultEntered ? 'bg-success state-indicator' : 'bg-danger state-indicator'}
          ></div>
        </div>
        <div>
          <form className="mb-3">
            <Autocomplete
              options={option}
              getOptionLabel={(option) => option}
              value={result.result}
              size='small'
              onChange={(event, newValue) => {
                setResults({
                  ...result,
                  result: newValue
                })
              }}
              renderInput={(params) => <TextField {...params} label="Hepatitis B test" variant="outlined" />}
            >
            </Autocomplete>
          </form>
          <CommentSection value={result.remarks} getcomment={handleComments} />
          <Button variant='contained' onClick={(e) => handleTestResult(e)} color='primary' sx={{ mt: 2 }}>
            {resultEntered ? 'update result' : 'enter result'}
          </Button>
          <Button variant='contained' sx={{mt:2,ml:2}} >
            preview Result
          </Button>
        </div>
      </div>
    </>
  )
}