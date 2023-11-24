import { useEffect, useState } from "react";
import { CheckResultEntered, customFetch, handleComments, handleResponse, validateFormData } from "../Auth/customFetch";
import CommentSection from "./commentSection";
import Indicator from "../accessories/Reports/indicator";

export default function RenalResults({ clientdata }) {
  const { billingid, test, testid, patientid } = clientdata;
  const [setup, setSetup] = useState([]);
  const [data, setData] = useState([]);
  const [resultEntered, setResultEntered] = useState(false);
  const [comments, setComments] = useState({ comments: '' });

  const getData = async function () {
    try {
      const hasBeenEntered = await CheckResultEntered(test, billingid);
      const response = await customFetch("test/setup/chemistry?panelname=RENAL_SETUP");
      const { records } = response;
      if (hasBeenEntered?.result == true) {
        setResultEntered(true)
        const previousEntered = hasBeenEntered.records;

        const finalizedData = previousEntered.map((item, index) => {
          // modify the data to lowercase to fit to the useState nature 
          let obj = {};
          Object.entries(item).forEach((s, i) => {
            const [key, value] = s;
            obj[key.toLowerCase()] = value;
          })
          return obj
        })
        
        for(let i = 0; i < records.length; i++) {
          for(let j = 0; j < finalizedData.length; j++) {
            // compare the setup to the previously entered data;
            if (records[i]['parameter'] == finalizedData[i]['parameter']) {
              // set the value of the finalized dataset to the records data
              records[i]['value'] = finalizedData[j]['value'];
            }
          }
        } 

        setData(records)

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
  useEffect(() => {
   
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
      <div className="mx-2">
        <div className="card">
          <div className="card-header modal-color">
            <h5>Renal Function Test </h5>
          <Indicator resultEntered={resultEntered} />
          </div>
          <div className="card-body">
            <table className="billing-cart-table">
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
                          className="custom-input"
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
            <CommentSection
            getcomment={handleComments}
            datasource={comments}
            datafunction={setComments}
            target={'comments'}
            value={comments.comments}
          />
            <button className="btn btn-primary btn-sm mx-1" onClick={saveResult}>
            Save Result
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
