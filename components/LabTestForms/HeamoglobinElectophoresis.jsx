import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import CommentSection from './commentSection';
import Indicator from '../accessories/Reports/indicator';
import { Send, SendTimeExtension } from '@mui/icons-material';
import electrophoresisParams from '../setup/biochemistry/electrophoresisParams';
const HemoglobinElectrophoresisForm = () => {
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
    console.log(hemoglobinResult);
  };

  return (
    <div className='p-2' >
      <div>
        <h5>Hemoglobin Electrophoresis</h5>
        <Indicator />
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
                  <td>{item.parameters}</td>
                  <td>
                    <input type='number' name={item.parameters} style={{ height: '30px' }} step={'0.5'} />
                  </td>
                  <td>{item.unit}</td>
                  <td>{item.reference.upper} - {item.reference.lower}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <CommentSection />
        </form>
        <div className='d-flex justify-content-start'>
          <Button variant='contained' type='submit' className='mt-2'>
          <SendTimeExtension/>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HemoglobinElectrophoresisForm;
