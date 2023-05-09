import { useEffect, useMemo, useState } from "react";
import { TextField, Button } from "@mui/material";
import Indicator from "../accessories/Reports/indicator";
import { customFetch, CheckResultEntered, handleComments, validateFormData } from "../Auth/customFetch";
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
        let transformedData = records.map((item, index) => { return { ...item, value: 0 } })
        // get the prevoius enter data and match parameter and the value 
        const checkresponse = await CheckResultEntered('thyroidfunctionaltest', clientdata.billingid);
        if (checkresponse?.result == true) {
          // transformed data represent the setup data 
          // records in this boundary represent the inputed data
          const { records } = checkresponse;
          setResultEntered(true);
          // adding the pevious entered data
          for (let i = 0; i < records.length; i++) {
            for(let j = 0; j < transformedData.length; j++) {
              if (records[i]['PARAMETER'] == transformedData[j]['parameter']) {
                transformedData[j]['value'] = records[i]['VALUE']
              }
            }
          }
          // update state 
          setData(transformedData)
          // update comment section
          setComments({ comments: records[0]['COMMENTS'] })
        }else {
            setResultEntered(false);
            setData(transformedData)
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
      testdata: data,
      testname: 'thyroidfunctionaltest',
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
      function (response) {
        const { status, statusCode, message } = response;
        alert(message)
      }
    );
  }
  return (
    <>
      <div className="p-4">
        <div>
          <Indicator resultEntered={resultEntered} />
          <div className="p-2" style={{ backgroundColor: 'whitesmoke' }}>
            <div>
              <h5>Thyroid functional test</h5>
              <form className="bg-white">
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