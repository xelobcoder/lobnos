import { Button } from "@mui/material";
import { useMemo, useState } from "react";
import { customFetch, handleComments, handleResponse, validateFormData } from "../Auth/customFetch";
import CommentSection from "./commentSection";

export default function RenalResults({ clientdata }) {
  const [setup, setSetup] = useState([]);
  const [data, setData] = useState([]);
  const [comments, setComments] = useState({ comments: '' });

  useMemo(async () => {
    try {
      const response = await customFetch("test/setup/chemistry?panelname=RENAL_SETUP");
      const { records } = response;
      setSetup(records);
      setData(records.map((item, index) => { return { ...item, value: '' } }))
    }
    catch (err) {
      console.log(err)
    }
  }, []);

  const handleChange = (name, value) => {
    // Update the value in the setup state
    const updatedSetup = data.map((item) => {
      if (item.parameter === name) {
        return { ...item, value };
      }
      return item;
    });

    setData(updatedSetup);
  };


  const saveResult = async function () {
    const { billingid, testid, test, patientid } = clientdata;
    const forwardingData = {
      testname:test,
      testid,
      patientid,
      billingid, records: data,
      comments: comments.comments
    }
   await  validateFormData(forwardingData,true,[],'test/result/enter',handleResponse)
  }

  return (
    <>
      <div className="continue-scroll p-4">
        <div>
          <h5>Renal Function Test </h5>
          <form className="bg-white">
            <table id="entry-table-chemistry">
              <thead>
                <tr>
                  <th>parameter</th>
                  <th>value</th>
                  <th>unit</th>
                  <th>reference range</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  return (
                    <tr key={index} className="border-bottom">
                      <td>{item.parameter}</td>
                      <td>
                        <input
                          type="number"
                          style={{ height: "30px" }}
                          step={"0.5"}
                          value={item.value}
                          onChange={(e) => handleChange(item.parameter, e.target.value)}
                        />
                      </td>
                      <td>{item.unit}</td>
                      <td>
                        {item.upper} - {item.lower}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </form>
          <CommentSection
            getcomment={handleComments}
            datasource={comments}
            datafunction={setComments}
            target= {'comments'}
            value={comments.comments}
          />
          <Button variant="contained" color="primary" onClick={saveResult}>
            Save Result
          </Button>
        </div>
      </div>
    </>
  );
}
