import React, { useState } from 'react'
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout'
import { Button } from '@mui/material'
import { customFetch, customPost, validateFormData } from '../../../components/Auth/customFetch'
import esrparams from '../../../components/setup/biochemistry/esrparams';
import { useEffect } from 'react'

export default function ESR() {
  const defaultValues = {
    target: "general",
    upper: "",
    lower: "",
  }
  const [range, setRange] = useState(defaultValues);

  const onChangeValue = async function (e) {
    setRange({ ...range, [e.target.name]: e.target.value });
  };

  const pushResult = async function () {
    // this endpoint takes in key , a test category and its data
    //  data is type array and category string
    const tresult = await customPost("test/setup/chemistry", "POST", {
      category: "ESR",
      data: [range],
    });
    // get the status and statuscode and respond appropriately
    const { message, statusCode } = tresult;
    if (message == "success") {
      alert("Record update successful");
    }
  };


  useEffect(() => {
    try {
      async function getParams() {
        const response = await customFetch(
          `test/setup/chemistry?panelname=ESR`
        );
        const { records, status } = response;

        if (status == "success" && records.length > 0) {
          const data = records[0];
          setRange(data);
        }

        if (status == 'success' && records.length == 0) {
          setRange(esrparams[0])
        }
      }
      getParams();
    } catch (err) {
      console.log(esrparams[0])
      setRange(esrparams[0])
    }
  }, [])
  return (
    <div>
      <CHEMISTRY_LAYOUT_SETUP>
        <form>
          <div className="range-table">
            <h5>Erthyrocyte sedimentation rate</h5>
            <table>
              <thead>
                <tr>
                  <th>range</th>
                  <th>lower</th>
                  <th>upper</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>general</td>
                  <td>
                    <input
                      className="form-control"
                      placeholder="lower"
                      step={1}
                      minLength={0}
                      inputMode="numeric"
                      type="number"
                      value={range.lower}
                      name='lower'
                      onChange={(e) => onChangeValue(e)}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control"
                      placeholder="higher"
                      step={1}
                      value={range.upper}
                      name='upper'
                      onChange={(e) => onChangeValue(e)}
                      minLength={0}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="contained" sx={{ mt: 4 }} onClick={pushResult}>save changes</Button>
            </div>
          </div>
        </form>
      </CHEMISTRY_LAYOUT_SETUP>
    </div>
  );
}
