import React from 'react'
import { BarChart, DeleteForeverOutlined, MedicalInformation, Money, Visibility } from "@mui/icons-material";

import { TextField, MenuItem, Select, FormControl, Button, InputLabel, TextareaAutosize } from '@mui/material';

export default function BasicInformationClinician({data,handleChange}) {
  return (
    <>
      <form
        style={{
          height: "max-content",
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        <div>
          <div className="mb-3 mt-3">
            <TextField
              type="text"
              required
              id="name"
              variant="outlined"
              size="medium"
              label="Name"
              onChange={(event) => handleChange(event,'name')}
              sx={{ width: "100%" }}
            />
          </div>
          <div className="mb-3 mt-3">
            <TextField
              type="tel"
              value={data.phone}
              onChange={(event) => handleChange(event,'phone')}
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
              onChange={(event) => handleChange(event,'email')}
              variant="outlined"
              size="medium"
              label="Email"
              sx={{ width: "100%" }}
            />
          </div>
          <div className="mb-3 mt-3">
            <TextField
              type="text"
              id="website"
              onChange={(event) => handleChange(event,'website')}
              variant="outlined"
              size="medium"
              label="Website"
              sx={{ width: "100%" }}
            />
          </div>
          <div className="mb-3 mt-3">
            <TextField
              type="text"
              required
              onChange={(event) => handleChange(event,'organization')}
              variant="outlined"
              size="medium"
              label="Organization"
              sx={{ width: "100%" }}
            />
          </div>
          <div className="mb-3 mt-3">
            <TextField
              type="text"
              onChange={(event) => handleChange(event,'location')}
              id="location"
              variant="outlined"
              size="medium"
              label="Location"
              sx={{ width: "100%" }}
            />
          </div>
          <div className="mb-3 mt-3">
            <TextField
              id="address"
              variant="outlined"
              size="medium"
              onChange={(event) => handleChange(event,'address')}
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
                onChange={(event) => handleChange(event,'occupation')}
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
