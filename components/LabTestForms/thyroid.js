import { useEffect, useMemo, useState } from "react";
import { TextField, Button } from "@mui/material";
import Indicator from "../accessories/Reports/indicator";
import { customFetch, CheckResultEntered, handleComments, validateFormData, handleResponse, resultCommentHander } from "../Auth/customFetch";
import CommentSection from "./commentSection";


export default function ThyroidTest({ clientdata }) {
  const [data, setData] = useState([]);
  const [comments, setComments] = useState({ comments: '' });
  const [resultEntered, setResultEntered] = useState(false);



  useEffect(() => {
    // get all the test parameter of this pacticular test
    const getSetupData = async function () {
      const response = await customFetch('test/setup/chemistry?panelname=THYROID_SETUP');
      const { status, statusCode, records } = response;
      if (status == 'success' && statusCode === 200) {
        // transform the data to include a value placeholder
        // get the prevoius enter data and match parameter and the value 
        const checkresponse = await CheckResultEntered(clientdata.test, clientdata.billingid);
        if (checkresponse?.result == true) {
          // records data represent the setup data 
          // previousResult in this boundary represent the inputed data
          const previousResult = checkresponse?.records;
          setResultEntered(true);
          // adding the pevious entered data
          const transformedData = records.map((dataset, index) => {
            const nw = previousResult.filter((item, index) => { return item.parameter == dataset.parameter });
            if (nw.length > 0) {
              const { value } = nw[0];
              dataset.value = value;
            }
            return dataset;
          })
          // update state 
          setData(transformedData)
          // update comment section
          resultCommentHander(setComments,'comments',comments,clientdata.testid,clientdata.billingid)
        } else {
          setResultEntered(false);
          setData(records.map((item, index) => { return { ...item, value: 0 } }))
        }
      }
    }
    getSetupData();
  }, [])


  console.log(data)






  const handleInput = function (e) {
    const { name, value } = e.target;
    // filter the index of paramater
    const index = data.indexOf(data.filter((item, index) => item.parameter == name)[0])
    // if index is more than 0 and less than 2
    const nd = [...data];
    nd[index].value = value;
    // update the state
    setData(nd);
  }


  const handleResult = async function () {
    const formData = {
      records: data,
      testname: clientdata.test,
      billingid: clientdata.billingid,
      testid: clientdata.testid,
      patientid: clientdata.patientid,
      comments: comments['comments']
    }
    await validateFormData(
      formData,
      true,
      [],
      "test/result/enter",
      handleResponse,
      setResultEntered(true)
    );
  }
  return (
    <>
      <div className="p-4" >
        <div>
          <div >
            <div>
              <h5>Thyroid functional test</h5>
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
                            <td><input type='number' value={item.value} onChange={(e) => { handleInput(e) }} name={item.parameter} style={{ height: '30px' }} step={'0.5'} /></td>
                            <td>{item.unit}</td>
                            <td>{item.upper} - {item.lower}</td>
                          </tr>
                        )
                      }))
                    }
                  </tbody>
                </table>
              </form>
              <CommentSection target={'comments'} getcomment={handleComments} value={comments.comments} datasource={comments} datafunction={setComments} />
              {/* save result */}
              <div className="form-group">
                <Button className="mt-3" variant='contained' color='primary' type='button'
                  onClick={handleResult}
                >save result</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}