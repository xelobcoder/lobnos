import { useEffect, useState } from "react";
import { TextField, Button, Autocomplete } from "@mui/material";
import CommentSection from "./commentSection";
import Indicator from "../accessories/Reports/indicator";
import { CheckResultEntered, Glucoseoptions, handleComments, validateFormData } from "../Auth/customFetch";
export default function RandomBloodSugar({ clientdata, type }) {
  const { billingid, test, testid, patientid } = clientdata;
  const [data, setData] = useState({
    result: 0,
    unit: '',
    comments: "",
  });

  const [resultEntered, setResultEntered] = useState(false)


  // check if result have been etered

  useEffect(() => {
    try {
      const entered = async function () {
        const response = await CheckResultEntered('randombloodsugar', billingid);
        const { status, result, records } = response;
        if (result) {
          setResultEntered(true)
          setData(records[0])
        }
      }
      entered();
    }
    catch (err) {
      alert('error in connection');
    }
  }, [billingid])


  const handleResult = async function () {
    const handleCalback = async function (response) {
      const { status, message, statusCode } = response;
      if (status == 'success' && statusCode == 200) {
        alert(message);
      }
    }
    const nw = { ...data, testname: 'randombloodsugar', testid, patientid, billingid }
    console.log(nw)
    await validateFormData(nw, true, [], 'test/result/enter', handleCalback)
  }
  return (
    <>
      <div className="p-4">
        <form>
          <Indicator resultEntered={resultEntered} />
          <h4>Random Blood Sugar Test</h4>
          <div>
            <TextField
              sx={{ width: "100%" }}
              label='random sugar'
              variant="outlined"
              type="number"
              size='small'
              value={data.result}
              onChange={(e) =>
                setData({ ...data, result: e.target.value })
              }
            />
          </div>
          <div>
            <Autocomplete
              options={Glucoseoptions}
              getOptionLabel={(option) => option}
              size="small"
              value={data.unit}
              onChange={(e, newValues) => setData({ ...data, unit: newValues })}
              sx={{ marginTop: '20px' }}
              renderInput={(params) => <TextField {...params} label='unit' />}
            />
          </div>
          <CommentSection
            value={data.comments}
            datafunction={setData}
            datasource={data}
            target={'comments'}
            getcomment={handleComments}

          />
          <div className="form-group mt-3">
            <Button
              variant="contained"
              color="primary"
              size="medium"
              onClick={(e) => handleResult(e)}
            >
              save result
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
