import React, { useState } from 'react';
import { Button } from '@mui/material';
import { customFetch, handleComments, handleResponse, validateFormData,CheckResultEntered } from '../Auth/customFetch';
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
      const response = await customFetch('test/setup/fbc');
      const { records } = response;
      setSetup(records);
      setData(records.map((item, index) => ({ ...item, value: '' })));

      const hasBeenEntered = await CheckResultEntered(test, billingid);

      if (hasBeenEntered?.result === true) {
        setResultEntered(true);
        const { result, statusCode, message, records } = hasBeenEntered;
        setData(records.map((item, index) => {
          let obj = {};
          Object.entries(item).forEach((s, i) => {
            const [key, value] = s;
            obj[key.toLowerCase()] = value;
          });
          const filteredPanels = setup.find((item, index) => item.parameter === obj.parameter);
          obj.upper = filteredPanels.upper;
          obj.lower = filteredPanels.lower;
          return obj;
        }));
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

    setData(updatedSetup);
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

  return (
    <div className="continue-scroll p-4">
      <div>
        <h5>Full Blood Count</h5>
        <Indicator resultEntered={resultEntered} />
        <form className="bg-white">
          <table id="entry-table-chemistry">
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
                  <td>{item.parameter}</td>
                  <td>
                    <input
                      type="number"
                      style={{ height: '30px' }}
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
        </form>
        <CommentSection
          getcomment={handleComments}
          datasource={comments}
          datafunction={setComments}
          target="comments"
          value={comments.comments}
        />
        <Button variant="contained" color="primary" onClick={saveResult}>
          Save Result
        </Button>
      </div>
    </div>
  );
}
