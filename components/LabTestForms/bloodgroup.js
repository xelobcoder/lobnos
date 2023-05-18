import { Autocomplete, TextField, Button } from "@mui/material";
import { useState, useMemo ,useEffect} from "react";
import CommentSection from "./commentSection";
import { CheckResultEntered, customPost } from '../Auth/customFetch';
import Indicator from "../accessories/Reports/indicator";

export default function BloodGroup({ clientdata }) {
  const [client, setClientData] = useState(clientdata);
  const option = ['', 'A', 'B', 'AB', 'O'];
  const optionRhesus = ['', 'positive', 'negative'];
  const [group, setGroup] = useState('');
  const [rhesus, setRhesus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [resultEntered, setResultEntered] = useState(false);


  const getComment = async function (e) {
    setRemarks(e.target.value)
  }

  // THIS CHECKS IF A RESULT WAS PREVIOUSLY ENTERED AND UPDATES THE STATE
  // IF RESULT WAS PREVIOUSLY ENTERED, THE RESULT IS DISPLAYED IN THE AUTOCOMPLETE

  useEffect(() => {
    const check = async () => {
      let customSend = await CheckResultEntered('bloodgrouping', client.billingid);
      const { result, statusCode, records } = customSend;
      if (statusCode == 200 && result == true) {
        if (records.length > 0) {
          setResultEntered(result);
          const data = records[0];
          setGroup(data?.BGROUP);
          setRemarks(data?.REMARKS);
          setRhesus(data?.RHESUS)
        }
      }
    }

    check();
  }, [resultEntered,client.billingid])


  const handleResult = async function (e) {
    e.preventDefault();
    let response = await customPost('test/result/enter', 'POST', {
      rhesus,
      remarks,
      bloodgroup: group,
      testname: 'bloodgrouping',
      patientid: client.patientid,
      billingid: client.billingid
    })

    const { status, message } = response;

    alert(message)
  }


  return (
    <>
      <div className="p-3">
        <Indicator resultEntered={resultEntered} />
        <div>
          <Autocomplete
            size="small"
            options={option}
            getOptionLabel={(option) => option}
            renderInput={(params) => (
              <TextField {...params} label="blood group" variant="outlined" />
            )}
            sx={{ marginBottom: "20px" }}
            value={group}
            onChange={(e, newValue) => setGroup(newValue)}
          ></Autocomplete>
        </div>
        <div>
          <Autocomplete
            size="small"
            options={optionRhesus}
            getOptionLabel={(option) => option}
            renderInput={(params) => (
              <TextField {...params} label="rhesus" variant="outlined" />
            )}
            value={rhesus}
            onChange={(e, newValue) => {
              setRhesus(newValue);
            }}
          ></Autocomplete>
        </div>
        <CommentSection value={remarks} getcomment={getComment} />
        <div>
          <Button
            className="mt-3"
            variant="contained"
            color="primary"
            type="button"
            onClick={handleResult}
          >
            save result
          </Button>
          <Button variant='contained' sx={{ mt: 2, ml: 2 }} >
            preview Result
          </Button>
        </div>
      </div>
    </>
  );
}