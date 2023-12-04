import { useCallback, useEffect, useState } from "react";
import { Autocomplete, TextField} from "@mui/material";
import CommentSection from "./commentSection";
import { handleComments, validateFormData,CheckResultEntered, getHematologicalResultEntered } from "../Auth/customFetch";
import Indicator from "../accessories/Reports/indicator";
import ISLOADING from "../isLoading";

function HEPATITISBPROFILE({ clientdata,employeeid }) {
  const { billingid, test, testid, patientid } = clientdata;
  const options = ['reactive', 'non reactive'];
  const [loading, setLoading] = useState(true);
  const [resultEntered, setResultEntered] = useState(false)
  const [results, setResults] = useState({
    HBsAg: '',
    HBsAb: '',
    HBeAg: '',
    HBeAb: '',
    HBcAb: '',
    comments: '',
  });

  const getPreviousResult = useCallback(async function () {
    getHematologicalResultEntered(billingid, test, setLoading, setResults, setResultEntered);
  },[billingid, test])



  //  check if result have een previously entered or not and flagged the indicator
  useEffect(() => {
    getPreviousResult();
  }, [])

  console.log(results)


  const handleResult = async function () {
    await validateFormData(
      { ...results,testname: test,patientid,testid,billingid,employeeid},
      true,
      [],
      'test/result/enter',
      function (response) {
        const { status, statusCode, message } = response;
        alert(message)
      }
    );

  }
  return (
    <>
      <div className="mx-3">
        <div className="card">
          <div className="card-header">
            <h5>HEPATITIS B PROFILE</h5>
            <Indicator resultEntered={resultEntered} />
          </div>
          <div className="card-body">
            {loading && <ISLOADING />}
            {!loading && (
              <>
               <table className="billing-cart-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>HBsAg</td>
                  <td>
                    <Autocomplete
                      sx={{ m: 2 }}
                      options={options}
                      size="small"
                      value={results.HBsAg}
                      getOptionLabel={(option) => option}
                      renderInput={(params) => <TextField {...params} label="results" />}
                      onChange={(e, newValue) => {
                        setResults({ ...results, HBsAg: newValue });
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>HBsAb</td>
                  <td>
                    <Autocomplete
                      sx={{ m: 2 }}
                      options={options}
                      size="small"
                      value={results.HBsAb}
                      getOptionLabel={(option) => option}
                      renderInput={(params) => <TextField {...params} label="results" />}
                      onChange={(e, newValue) => {
                        setResults({ ...results, HBsAb: newValue });
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>HBeAg</td>
                  <td>
                    <Autocomplete
                      sx={{ m: 2 }}
                      options={options}
                      value={results.HBeAg}
                      size="small"
                      getOptionLabel={(option) => option}
                      renderInput={(params) => <TextField {...params} label="results" />}
                      onChange={(e, newValue) => {
                        setResults({ ...results, HBeAg: newValue });
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>HBeAb</td>
                  <td>
                    <Autocomplete
                      sx={{ m: 2 }}
                      options={options}
                      size="small"
                      value={results.HBeAb}
                      getOptionLabel={(option) => option}
                      renderInput={(params) => <TextField {...params} label="results" />}
                      onChange={(e, newValue) => {
                        setResults({ ...results, HBeAb: newValue });
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>HBcAb</td>
                  <td>
                    <Autocomplete
                      sx={{ m: 2 }}
                      options={options}
                      size="small"
                      value={results.HBcAb}
                      getOptionLabel={(option) => option}
                      renderInput={(params) => <TextField {...params} label="results" />}
                      onChange={(e, newValue) => {
                        setResults({ ...results, HBcAb: newValue });
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            {/* comment */}
            <div>
              <CommentSection
                value={results.comments}
                datasource={results}
                datafunction={setResults}
                getcomment={handleComments}
                target={"comments"}
              />
            </div>
            <button className="btn btn-primary btn-sm mx-1 my-3" onClick={handleResult}>
              Save result
            </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


export default HEPATITISBPROFILE;