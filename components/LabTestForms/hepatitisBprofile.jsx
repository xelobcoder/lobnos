import { useEffect, useState } from "react";
import { Autocomplete, TextField, Typography, Button } from "@mui/material";
import CommentSection from "./commentSection";
import { handleComments, validateFormData } from "../Auth/customFetch";
import Indicator from "../accessories/Reports/indicator";

function HEPATITISBPROFILE({ clientdata }) {
  const options = ['', 'reactive', 'non reactive'];
  const [resultEntered,setResultEntered] = useState(false)
  const [results, setResults] = useState({
    HBsAg: '',
    HBsAb: '',
    HBeAg: '',
    HBeAb: '',
    HBcAb: '',
    comments: '',
  });


  //  check if result have een previously entered or not and flagged the indicator
  useEffect(() => {

  }, [])


  const handleResult = async function () {
    await validateFormData(
      {
        ...results,
        testname: clientdata.test,
        patientid: clientdata.patientid,
        testid: clientdata.testid,
        billingid: clientdata.billingid,
      },
      true,
      [],
      'test/result/enter',
      function (response) {
        const { status, statusCode, message } = response;
        alert(message)
      }
    );

    console.log(results)
  }
  return (
    <>
      <div className="p-4">
        <form>
          <h5>HEPATITIS B PROFILE</h5>
           <Indicator resultEntered={resultEntered}/>
          <div>
            <label>
              HBsAg
            </label>
            <Autocomplete
              sx={{ mt: 2 }}
              options={options}
              size="small"
              getOptionLabel={(option) => option}
              renderInput={(params) => <TextField {...params} label="results" />}
              onChange={(e, newValue) => {
                setResults({ ...results, HBsAg: newValue });
              }}
            />
          </div>
          <div>
            <label>
              HBsAb
            </label>
            <Autocomplete
              sx={{ mt: 2 }}
              options={options}
              size="small"
              getOptionLabel={(option) => option}
              renderInput={(params) => <TextField {...params} label="results" />}
              onChange={(e, newValue) => {
                setResults({ ...results, HBsAb: newValue });
              }}
            />
          </div>
          <div>
            <label>
              HBeAg
            </label>
            <Autocomplete
              sx={{ mt: 2 }}
              options={options}
              size="small"
              getOptionLabel={(option) => option}
              renderInput={(params) => <TextField {...params} label="results" />}
              onChange={(e, newValue) => {
                setResults({ ...results, HBeAg: newValue });
              }}
            />
          </div>
          <div>
            <label>
              HBeAb
            </label>
            <Autocomplete
              sx={{ mt: 2 }}
              options={options}
              size="small"
              getOptionLabel={(option) => option}
              renderInput={(params) => <TextField {...params} label="results" />}
              onChange={(e, newValue) => {
                setResults({ ...results, HBeAb: newValue });
              }}
            />
          </div>
          <div>
            <label>
              HBcAb
            </label>
            <Autocomplete
              sx={{ mt: 2 }}
              options={options}
              size="small"
              getOptionLabel={(option) => option}
              renderInput={(params) => <TextField {...params} label="results" />}
              onChange={(e, newValue) => {
                setResults({ ...results, HBcAb: newValue });
              }}
            />
          </div>
          {/* comment */}
          <div>
            <CommentSection value={results.comments} datasource={results} datafunction={setResults} getcomment={handleComments} target={'comments'} />
          </div>
          <Button
            variant="contained"
            sx={{ mt: 4 }}
            color="primary"
            onClick={handleResult}
          >
            {" "}
            save result{" "}
          </Button>
        </form>
      </div>
    </>
  );
}


export default HEPATITISBPROFILE;