import { useEffect, useState } from "react";
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
        // update the state
        let transformedData = records.map((item, index) => { return { ...item, value: 0 } })
        setData(transformedData)
      }
    }
    getSetupData();
    // is result entered
    async function isResultEntered() {
      const response = await CheckResultEntered('thyroidfunctionaltest', clientdata.billingid);
      if (response?.result == true) {
        setResultEntered(true)
        console.log(response?.records)
      }
    }
    isResultEntered()
  }, [])




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
    console.log(clientdata)
    await validateFormData(
      formData,
      true,
      [],
      "test/result/enter",
      function (response) {
        console.log(response);
      }
    );
  }
  return (
    <>
      <div className="p-4">
        <div>
          <Indicator resultEntered={false} />
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