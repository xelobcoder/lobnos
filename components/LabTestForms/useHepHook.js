import { Autocomplete, TextField, Button } from "@mui/material";
import React, { useState, useMemo } from "react";
import CommentSection from "./commentSection";
import Indicator from "../accessories/Reports/indicator";
import { customFetch, CheckResultEntered, customPost, handleComments, validateFormData, handleResponse } from "../Auth/customFetch";

export default function UseHepHook({ testname, clientdata, description }) {
  const { billingid, patientid, testid } = clientdata;
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
    const formdata = {
      ...result,
      billingid,
      patientid,
      testid,
      testname,
      scientistid: 2
    }
    await validateFormData(formdata, true, [], 'test/result/enter', handleResponse,setResultEntered(true))
  }

  // THIS CHECKS IF A RESULT WAS PREVIOUSLY ENTERED AND UPDATES THE STATE
  // IF RESULT WAS PREVIOUSLY ENTERED, THE RESULT IS DISPLAYED IN THE AUTOCOMPLETE

  useMemo(() => {
    const check = async () => {
      let customSend = await CheckResultEntered(testname, billingid);
      const { result, statusCode, records } = customSend;
      if (statusCode == 200 && result == true) {
        result == false ? setResultEntered(false) : setResultEntered(true);
        if (result == true) {
          setResults(
            {
              remarks: records[0]?.REMARKS,
              result: records[0]?.RESULTS
            }
          )
        }
      }
    }

    try { check() } catch (err) { console.log(err) }
  }, [resultEntered])



  return (
    <>
      <div className="p-4">
        <Indicator resultEntered={resultEntered} />
        <div>
          <form className="mb-3">
            <Autocomplete
              options={option}
              getOptionLabel={(option) => option}
              value={result.result}
              size="small"
              onChange={(event, newValue) => {
                setResults({
                  ...result,
                  result: newValue,
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={description}
                  variant="outlined"
                />
              )}
            ></Autocomplete>
          </form>
          <CommentSection
            value={result.remarks}
            target={"remarks"}
            getcomment={handleComments}
            datasource={result}
            datafunction={setResults}
          />
          <Button
            variant="contained"
            onClick={(e) => handleTestResult(e)}
            color="primary"
            sx={{ mt: 2 }}
          >
            {resultEntered ? "update result" : "enter result"}
          </Button>
        </div>
      </div>
    </>
  );

}
