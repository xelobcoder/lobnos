import React from 'react'

import { TextField, MenuItem, Select, FormControl, Button, InputLabel, TextareaAutosize, Autocomplete } from '@mui/material';
import { useState } from 'react';

export default function BasicInformationClinician({ data, handleChange, stateUpdate, organization }) {

  return (
    <>
      <form
        autoCapitalize="true"
        autoComplete="true"
      >
        <div>
          <div className="mb-3 mt-3">
            <TextField
              type="text"
              required
              id="name"
              variant="outlined"
              value={data.name}
              size="medium"
              label="Name"
              onChange={(event) => handleChange(event, "name")}
              sx={{ width: "100%" }}
            />
          </div>
          <div className="mb-3 mt-3">
            <TextField
              type="tel"
              inputMode='numeric'   
              value={data.phone}
              onChange={(event) => handleChange(event, "phone")}
              sx={{ width: "100%" }}
              required
              inputProps={{
                maxLength: 10,
                minLength: 10,
              }}
              id="phone"
              variant="outlined"
              size="medium"
              label="Phone"
            />
          </div>
          <div className="mb-3 mt-3">
            <TextField
              type="email"
              required
              id="email"
              value={data.email}
              onChange={(event) => handleChange(event, "email")}
              variant="outlined"
              size="medium"
              label="Email"
              sx={{ width: "100%" }}
            />
          </div>
          <div className="mb-3 mt-3">
            <Autocomplete
              id="organization"
              options={organization}
              getOptionLabel={(option) => option.NAME}
              sx={{ width: "100%" }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Organization"
                  variant="outlined"
                  size="medium"
                />
              )}
              onChange={(event, value) => {
                console.log(value)
                stateUpdate({ ...data, organization: value.ID })
              }}
            />
          </div>
          <div className="mb-3 mt-3">
            <TextField
              type="text"
              onChange={(event) => handleChange(event, "location")}
              id="location"
              variant="outlined"
              size="medium"
              value={data.location}
              label="Location"
              sx={{ width: "100%" }}
            />
          </div>
          <div className="mb-3 mt-3">
            <TextField
              id="address"
              variant="outlined"
              size="medium"
              value={data.address}
              onChange={(event) => handleChange(event, "address")}
              label="Address"
              sx={{ width: "100%" }}
            />
          </div>
          <div className="mb-3 mt-3">
            <p>Select occupation that matches closest to yours</p>
            <FormControl sx={{ width: "100%" }}>
              <InputLabel id="occupation-label">Occupation</InputLabel>
              <Select
                labelId="occupation-label"
                id="occupation"
                value={data.occupation}
                onChange={(event) => handleChange(event, "occupation")}
                variant="outlined"
                size="medium"
              >
                <MenuItem value="">Select occupation</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
                <MenuItem value="nurse">Nurse</MenuItem>
                <MenuItem value="pharmacist">Pharmacist</MenuItem>
                <MenuItem value="therapist">Therapist</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </form>
    </>
  );
}
