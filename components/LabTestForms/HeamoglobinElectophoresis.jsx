import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';

const HemoglobinElectrophoresisForm = () => {
  const [hemoglobinResult, setHemoglobinResult] = useState({
    sampleId: '',
    dateOfAnalysis: '',
    hbA: '',
    hbA2: '',
    hbF: '',
    hbS: '',
  });

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
    <form onSubmit={handleSubmit}>
      <TextField
        label="Sample ID"
        name="sampleId"
        value={hemoglobinResult.sampleId}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Date of Analysis"
        name="dateOfAnalysis"
        value={hemoglobinResult.dateOfAnalysis}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Hb A"
        name="hbA"
        value={hemoglobinResult.hbA}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Hb A2"
        name="hbA2"
        value={hemoglobinResult.hbA2}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Hb F"
        name="hbF"
        value={hemoglobinResult.hbF}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Hb S"
        name="hbS"
        value={hemoglobinResult.hbS}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" type="submit">
        Submit
      </Button>
    </form>
  );
};

export default HemoglobinElectrophoresisForm;
