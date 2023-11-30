import { Autocomplete, TextField } from "@mui/material";
import { useState ,useEffect} from "react";
import CommentSection from "./commentSection";
import { CheckResultEntered, customPost } from '../Auth/customFetch';
import Indicator from "../accessories/Reports/indicator";

export default function BloodGroup({ clientdata }) {
  const [client, setClientData] = useState(clientdata);
  const option = ['', 'A', 'B', 'AB', 'O'];
  const optionRhesus = ['', 'positive', 'negative'];
  const [group, setGroup] = useState('');
  const [rhesus, setRhesus] = useState('');
  const [remarks, setRemarks] = useState({comment:''});
  const [resultEntered, setResultEntered] = useState(false);


  const getComment = async function (e) {
    setRemarks(e.target.value)
  }

  // THIS CHECKS IF A RESULT WAS PREVIOUSLY ENTERED AND UPDATES THE STATE
  // IF RESULT WAS PREVIOUSLY ENTERED, THE RESULT IS DISPLAYED IN THE AUTOCOMPLETE

  useEffect(() => {
    const check = async () => {
      let customSend = await CheckResultEntered('blood_grouping', client.billingid);
      const { result, statusCode, records } = customSend;
      if (statusCode == 200 && result == true) {
        if (records.length > 0) {
          setResultEntered(result);
          const data = records[0];
          setGroup(data?.BGROUP);
          setRemarks({comment: data?.REMARKS});
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
      remarks:remarks.comment,
      bloodgroup: group,
      testname: client.test,
      patientid: client.patientid,
      billingid: client.billingid,
      testid: client.testid
    })

    const { status, message } = response;

    alert(message)
  }


  return (
    <>
      <div className="mx-3">
        <div className="card">
          <div className="card-header">
            <h4>Blood Grouping</h4>
            <Indicator resultEntered={resultEntered} />
          </div>
          <div className="card-body">
            <table className="billing-cart-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>grouping</td>
                  <td>
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
                    />
                  </td>
                </tr>
                <tr>
                  <td>rhesus</td>
                  <td>
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
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <CommentSection value={remarks.comment} datasource={remarks} target='comment' datafunction={setRemarks} getcomment={getComment} />
            <button className="btn btn-primary btn-sm mx-1" onClick={handleResult}> save </button>
          </div>
        </div>
      </div>
    </>
  );
}