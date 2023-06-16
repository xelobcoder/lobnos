import { Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { CheckResultEntered, customFetch, handleComments, handleResponse, validateFormData } from "../Auth/customFetch";
import CommentSection from "./commentSection";
import Indicator from "../accessories/Reports/indicator";

export default function RenalResults({ clientdata }) {
  const { billingid, test, testid, patientid } = clientdata;
  const [setup, setSetup] = useState([]);
  const [data, setData] = useState([]);
  const [resultEntered, setResultEntered] = useState(false);
  const [comments, setComments] = useState({ comments: '' });

  useEffect(() => {
    const getData = async function () {
      try {
        const hasBeenEntered = await CheckResultEntered(test, billingid);


        const response = await customFetch("test/setup/chemistry?panelname=RENAL_SETUP");
        const { records } = response;
        setSetup(records.map((item, index) => { return { ...item, value: '' } }))

        if (hasBeenEntered?.result == true && setSetup.length > 0) {
          setResultEntered(true)
          const { result, statusCode, message, records } = hasBeenEntered;
          const finalizedData = records.map((item, index) => {
            // modify the data to lowercase to fit to the useState nature 
            let obj = {};
            Object.entries(item).forEach((s, i) => {
              const [key, value] = s;
              obj[key.toLowerCase()] = value;
            })
            // filter from setup data and get lower and upper values as reference range
            const filteredPanels = setup.find((item, index) => {
              return item.parameter == obj.parameter;
            })

            obj['upper'] = filteredPanels?.upper;
            obj['lower'] = filteredPanels?.lower;
            // return the object
            return obj;
          })
          setData(finalizedData)
        }
        else {
          setData(records)
        }
        // get comments from this api
        const getcomments = await customFetch(`result/preview/comments?billingid=${billingid}&&testid=${testid}`);
        getcomments.length != 0 && setComments({ comments: getcomments[0]?.comments })
      }
      catch (err) {
        console.log(err)
      }
    }
    getData()
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
    const forwardingData = {
      testname: test,
      testid,
      patientid,
      billingid, records: data,
      comments: comments.comments
    }
    await validateFormData(forwardingData, true, [], 'test/result/enter', handleResponse)
  }

  return (
    <>
      <div className="continue-scroll p-4">
        <div>
          <h5>Renal Function Test </h5>
          <Indicator resultEntered={resultEntered} />
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
            target={'comments'}
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
