import { Alert, Button } from "@mui/material";
import React from "react";
import AddIcon from '@mui/icons-material/Add';
import { useState } from "react";
import CHEMISTRY_LAYOUT_SETUP from "../../../components/setup/biochemistry/Layout";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { customPost } from "../../../components/Auth/customFetch";

export default function CREATE_PARAMETER() {
  const defaultValue = { unit: "", parameter: "", upper: 0, lower: 0 };
  const [parameterDetails, setDetails] = useState(defaultValue);
  const { target } = useRouter().query;


  useEffect(() => {
    if (target === null) {
      return;
    }

  }, [target])


  const handleSaving = async function () {
    if (target != undefined) {
      const emptyFields = Object.values(parameterDetails)
        .filter((item, index) => { return item === '' || item == 0 })
        .length;

      if (emptyFields == 0) {
        const data = { parameterDetails, target }
        const response = await customPost('test/setup/createparams', 'POST', data)
        const {status,statusCode,message} = response;
        if(status == 'success'){
          setDetails(defaultValue)
          alert(message)
        }
        else{
          alert(message)
        }
      }
      else {
        alert('fill in all blank fields')
      }
    }
  }
  return (
    <>
      <CHEMISTRY_LAYOUT_SETUP>
        <h6 className="create-param-header">
          create parameter here  for {target}
        </h6>
        <form className="create-param-form">
          <input
            className="custom-input"
            value={parameterDetails.parameter}
            placeholder="parameter name"
            onChange={(e) =>
              setDetails({ ...parameterDetails, parameter: e.target.value })
            }
            type="text"
          />
          <input
            className="custom-input"
            value={parameterDetails.unit}
            placeholder="unit"
            type="text"
            onChange={(e) => {
              setDetails({ ...parameterDetails, unit: e.target.value });
            }}
          />
          <input
            className="custom-input"
            value={parameterDetails.upper}
            placeholder="upper limit"
            type="number"
            onChange={(e) => {
              setDetails({ ...parameterDetails, upper: e.target.value });
            }}
          />
          <input
            className="custom-input"
            value={parameterDetails.lower}
            placeholder="lower limit"
            type="number"
            onChange={(e) => {
              setDetails({ ...parameterDetails, lower: e.target.value });
            }}
          />
          <Button variant='contained' color='primary' startIcon={<AddIcon />}
            onClick={handleSaving}
          >
            send
          </Button>
        </form>
      </CHEMISTRY_LAYOUT_SETUP>
    </>
  );
}
