import { useState, useEffect} from "react";
import { TextField, Button } from "@mui/material";
import CommentSection from "./commentSection";
import Indicator from "../accessories/Reports/indicator";
import {Autocomplete} from "@mui/material";
import { handleComments,Glucoseoptions,CheckResultEntered,validateFormData} from "../Auth/customFetch";
export default function FastingSugar({clientdata}) {
  const { billingid, test, testid, patientid } = clientdata;
  const [data, setData] = useState({ result: "", unit: '', comments: "" });
  const [resultEntered, setResultEntered] = useState(false);


  useEffect(() => {
    try {
      const entered = async function () {
        const response = await CheckResultEntered('fastingbloodsugar', billingid);
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
  }, [])


  const handleResult = async function () {
    const handleCalback = async function (response) {
      const { status, message, statusCode } = response;
      if (status == 'success' && statusCode == 200) {
        alert(message);
      }
    }
    const nw = { ...data, testname: 'fastingbloodsugar', testid, patientid, billingid }
    console.log(nw)
    await validateFormData(nw, true, [], 'test/result/enter', handleCalback)
  }

  return (
    <>
      <div className="p-4">
        <form>
          <Indicator  resultEntered={resultEntered}/>
          <h4 className="text-capitalize">fasting blood sugar test</h4>
          <div>
            <TextField
              size="small"
              label="fasting sugar"
              variant="outlined"
              type="number"
              sx={{width:'97%'}}
              value={data.result}
              onChange={(e) => setData({...data,result:e.target.value })}
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
          <CommentSection getcomment={handleComments}
           datasource={data} target={'comments'}
           value={data.comments} datafunction={setData} />
          <Button
            className="mt-3"
            variant="contained"
            color="primary"
            onClick={handleResult}
            type="button"
          >
            save result
          </Button>
        </form>
      </div>
    </>
  );
}
