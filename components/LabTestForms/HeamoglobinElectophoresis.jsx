import React, { useState, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import CommentSection from './commentSection';
import Indicator from '../accessories/Reports/indicator';
import { Send, SendTimeExtension } from '@mui/icons-material';
import electrophoresisParams from '../setup/biochemistry/electrophoresisParams';
import { CheckResultEntered, customFetch } from '../Auth/customFetch';
import { getRecords } from '../setup/connector';
const HemoglobinElectrophoresisForm = ({ clientdata }) => {
  // destuture thr billingid ,testname ,patirntid and testid from the clientdata object
  const { billingid, testname, testid, patientid } = clientdata;
  // set the initial state of the hemoglobinResult to the electrophoresisParams object
  const [resultEntered, setResultEntered] = useState(false);
  const [hemoglobinResult, setHemoglobinResult] = useState(electrophoresisParams);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setHemoglobinResult((prevResult) => ({
      ...prevResult,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Perform desired actions with the hemoglobinResult object
  };


  // using useEffect we check to see if result was entered previously 
  // if it was we set the value of the input to the previous value
  // if not we set the value to an empty string
  useEffect(() => {
    // get test params
    const getTestParams = async function () {
      const response = await getRecords('ELECTROPHORESIS_SETUP', setHemoglobinResult, electrophoresisParams);
      // const { message, statusCode, result, records } = response;
    }

    getTestParams();
    // check if result was entered previously
    const checker = async function () {
      const resultChecker = await CheckResultEntered('haemoglobin_electrophoresis', billingid);
      const { message, statusCode, result, records } = resultChecker;
      if (statusCode === 200 && result == true) {
        // if result is true we want to, we get thr previous result
        // through records of resultChecker
        if (hemoglobinResult.length != 0 ) {
          hemoglobinResult.map((item, index) => {
            // we want to filter item.parameter to match the records.parameter
            // and set the value of the input to the previous value 
            // or zero
            const previousResult = records.filter((record) => record.parameter == item.parameter);
            if (previousResult.length > 0) {
              item.value = previousResult[0].value;
            }
            else {
              item.value = 0;
            }
          })
          setResultEntered(true);
          setHemoglobinResult(hemoglobinResult);
        }
      }
    }
    checker();

  }, []);



  return (
    <div className='p-2' >
      <div>
        <h5>Hemoglobin Electrophoresis</h5>
        <Indicator resultEntered={resultEntered} />
        <form onSubmit={handleSubmit} className='bg-white'>
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
              {hemoglobinResult.length > 0 && hemoglobinResult.map((item, index) => (
                <tr key={index} className='border-bottom'>
                  <td>{item.parameter}</td>
                  <td>
                    <input type='number' name={item.parameter} style={{ height: '30px' }}
                    value={item.value}
                    step={'0.5'} />
                  </td>
                  <td>{item.unit}</td>
                  <td>{item.upper} - {item.lower}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <CommentSection />
        </form>
        <div className='d-flex justify-content-start'>
          <Button variant='contained' type='submit' className='mt-2'>
            <SendTimeExtension />
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HemoglobinElectrophoresisForm;
