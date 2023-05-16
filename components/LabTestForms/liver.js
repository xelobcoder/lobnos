import { useState, useMemo, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import { CheckResultEntered, customFetch, handleComments, handleResponse, validateFormData } from "../Auth/customFetch";
import CommentSection from "./commentSection";
import Indicator from "../accessories/Reports/indicator";

export default function LiverTest({ clientdata }) {
  const { test, testid, billingid, patientid } = clientdata;
  const [data, setData] = useState([]);
  const [resultEntered, setResultEntered] = useState(false);
  const [comments, setComments] = useState({ comments: '' })
  // Fetch data from the server using useMemo
  useMemo(async () => {
    try {
      const response = await customFetch('test/setup/chemistry?panelname=LIVER_SETUP');
      const check = await CheckResultEntered('liverfunctiontest', billingid);
      const { records } = response;
      // Transform data and add value key to each object 
      const transformedData = records.map(item => ({ ...item, value: 0 }));
      setData(transformedData);

      if (check?.result == true) {
        setResultEntered(true)
        const { status, message, records } = check;

        for (let i = 0; i < transformedData.length; i++) {
          for (let j = 0; j < records.length; j++) {
            if (transformedData[i]['parameter'] == records[i]['parameter']) {
              transformedData[i].value = records[i]['value'];
            }
          }
        }
        setComments({ ...comments, comments: '' })
        setData(transformedData)
      }
    } catch (error) {
      setData([]);
    }
  }, []);

  // Handle input value change
  const handleValueChange = (event, index) => {
    const { value } = event.target;
    setData(prevData => prevData.map((item, itemIndex) => {
      if (itemIndex === index) {
        return { ...item, value };
      }
      return item;
    }));
  };

  const handleResult = async (e) => {
    const formdata = { testname: 'liverfunctiontest', patientid, testid, billingid, comments: comments.comments, records: [...data] }
    await validateFormData(formdata, true, [], 'test/result/enter', handleResponse)
  }


  return (
    <>
      <div className="p-4">
        <div>
          <h5>Liver Function Test</h5>
          <form className="bg-white">
            <Indicator resultEntered={resultEntered} />
            <table id="entry-table-chemistry">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="border-bottom">
                    <td>{item.parameter}</td>
                    <td>
                      <input
                        type="number"
                        name={item.parameter}
                        value={item.value}
                        onChange={(e) => handleValueChange(e, index)}
                        style={{ height: "30px" }}
                        step="0.5"
                      />
                    </td>
                    <td>{item.unit}</td>
                    <td>
                      {item.upper} - {item.lower}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>
          <CommentSection getcomment={handleComments} target={'comments'} value={comments.comments} datasource={comments} datafunction={setComments} />
          <Button variant="contained" color='success' onClick={handleResult}>
            save changes
          </Button>
        </div>
      </div>
    </>
  );
}
