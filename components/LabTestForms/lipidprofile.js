import { useState, useMemo } from "react";
import { TextField, Button } from "@mui/material";
import { customFetch, handleChange, handleComments, handleResponse, validateFormData } from "../../components/Auth/customFetch";
import CommentSection from "./commentSection";
import Indicator from "../accessories/Reports/indicator";

export default function LipidProfile({ clientdata }) {
  const { billingid, test, testid, patientid } = clientdata;
  // setting the default parameters of the test
  const defaultParameters = []
  // result placeholder 
  const [data, setData] = useState(defaultParameters);
  const [resultEntered, setResultEntered] = useState(false);
  const [comment, setComment] = useState({ comment: '' })


  const [forwardData, setForwardData] = useState([]);


  //  using usememo to fetch data from the server


  const getSetupData = async function () {
    try {
      let response = await customFetch("test/setup/chemistry?panelname=LIPID_PROFILE_SETUP");
      const { records, statusCode, status } = response;
      if (statusCode == 200 && status == "success") {
        setData(records.map((item) => { return { ...item, value: 0 } }));
      }
    } catch (err) {
      setData([]);
    }
  };


  const CheckResultEntered = async function () {
    const checker = await customFetch(`test/result/check?billingid=${billingid}&&testname=${test}`)
    const { result, statusCode, records } = checker;

    if (result === true && statusCode == 200) {
      setData(records)
    }
  }


  useMemo(() => {
    getSetupData();
    CheckResultEntered()
    console.log(data)
  }, []);


  const handleResult = async function () {
    const backend_data = { testname: test, testid, billingid, patientid, records: data, comments: comment.comment }
    // send data to backend via this helper function
    await validateFormData(backend_data, true, [], 'test/result/enter', handleResponse,setResultEntered(true));
  }


  const handleChange = (event, collection) => {
    const { value } = event.target;
    // find index of the parameter using the setupid
    setData((prev) => {
      return prev.map((item, index) => {
        if (item.setupid == collection.setupid) {
          item.value = value;
        }
        return item;
      })
    })
  }


  const resetValues = async function() {
     if (Array.isArray(data) && data.length > 0) {
      let current = data.map( (e,i) => {e.value = 0 
      return  {...e}})
      setData(current);
      setComment({...comment, comment:''})
     }
  }



  return (
    <>
      <div className="p-2" style={{ backgroundColor: 'whitesmoke' }}>
        <div>
          <h5>Lipid Profile</h5>
          <form className="bg-white">
            <Indicator resultEntered={resultEntered} />
            <table id="entry-table-chemistry">
              <thead>
                <tr>
                  <th>paramater</th>
                  <th>value</th>
                  <th> unit</th>
                  <th>reference</th>
                </tr>
              </thead>
              <tbody >
                {data.length > 0 &&
                  (data.map((item, index) => {
                    return (
                      <tr key={index} className="border-bottom">
                        <td>{item.parameter}</td>
                        <td><input type='number' onChange={(e) => handleChange(e, item)} value={item.value} name={item.parameter} style={{ height: '30px' }} step={'0.5'} /></td>
                        <td>{item.unit}</td>
                        <td>{item.upper} - {item.lower}</td>
                      </tr>
                    )
                  }))
                }
              </tbody>
            </table>
          </form>
          <CommentSection
            target={'comment'}
            datasource={comment}
            datafunction={setComment}
            getcomment={handleComments}
            value={comment.comment}
          />
        </div>
        <Button variant='contained' className="mt-2 btn btn-primary" type="button" onClick={handleResult}>
          save result 
        </Button>
        <Button sx={{ml:3}} type='reset' className="btn btn-danger mt-2" variant="contained" onClick={resetValues}> 
          reset values
        </Button>
      </div>
    </>
  )
}