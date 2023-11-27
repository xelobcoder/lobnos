import React, { useState } from 'react';
import { customFetch, handleComments, handleResponse, validateFormData, CheckResultEntered } from '../Auth/customFetch';
import CommentSection from './commentSection';
import Indicator from '../accessories/Reports/indicator';

export default function FullBloodCountEntry({ clientdata }) {
  const { billingid, test, testid, patientid } = clientdata;
  const [setup, setSetup] = useState([]);
  const [data, setData] = useState([]);
  const [resultEntered, setResultEntered] = useState(false);
  const [comments, setComments] = useState({ comments: '' });


  useState(async () => {
    try {
      const setupdataResponse = await customFetch(`test/setup/fbc?patientid=${patientid}&&category=filling`);
      const { statusCode ,result} = setupdataResponse;
      if (statusCode == 200) {
        console.log(result);
        setSetup(result);
      }
      // setSetup(converted);

      const hasBeenEntered = await CheckResultEntered(test, billingid);

      if (hasBeenEntered?.result === true && hasBeenEntered.statusCode == 200) {
        setResultEntered(true);
        setData(hasBeenEntered.records)
      } else {
        setData([...setup]);
      }

      const getcomments = await customFetch(`result/preview/comments?billingid=${billingid}&&testid=${testid}`);
      if (getcomments.length !== 0) {
        setComments({ comments: getcomments[0]?.comments });
      }
    } catch (err) {
      console.log(err);
    }
  }, []);


  const handleChange = (name, value) => {
    const updatedSetup = data.map((item) => {
      if (item.parameter === name) {
        return { ...item, value };
      }
      return item;
    });

    setData(updatedSetup,data);
  };

  const saveResult = async () => {
    const forwardingData = {
      testname: test,
      testid,
      patientid,
      billingid,
      records: data,
      comments: comments.comments
    };

    await validateFormData(forwardingData, true, [], 'test/result/enter', handleResponse);
  };


  console.log(data);
  return (
    <div className='mx-3'>
      <div className="card m-0 br-5">
        <div className="card-header modal-color">
          <h5>Full Blood Count</h5>
          <Indicator resultEntered={resultEntered} />
        </div>
        <div className="card-body ">
          <table className="m-0 billing-cart-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Unit</th>
                <th>Reference Range</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-bottom">
                  <td className='lims-text-color'>{item.parameter}</td>
                  <td>
                    <input
                      type="number"
                      style={{ height: "30px" }}
                      className="custom-input"
                      step="0.5"
                      value={item.value}
                      onChange={(e) => handleChange(item.parameter, e.target.value)}
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
        </div>
      </div>
      <CommentSection
        getcomment={handleComments}
        datasource={comments}
        datafunction={setComments}
        target="comments"
        value={comments.comments}
      />
      <button className='btn btn-primary btn-sm' onClick={saveResult}>
        Save Result
      </button>
    </div>
  );
}
