import React, { useState } from 'react'
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout'
import { Button } from '@mui/material'
import { customFetch, customPost, validateFormData } from '../../../components/Auth/customFetch'
import esrparams from '../../../components/setup/biochemistry/esrparams';
import { useEffect } from 'react'
import { Suspense } from 'react';
import NODATA_FOUND from '../../../components/Nodata';

export default function ESR() {
  const [range, setRange] = useState(esrparams);

  const onChangeValue = async function (e, index, target) {
    setRange((prevState) => {
      const newRange = [...prevState]
      newRange[index] = { ...newRange[index], [target]: e.target.value };
      return newRange;
    });
  };

  const pushResult = async function () {
    // this endpoint takes in key , a test category and its data
    //  data is type array and category string
    const tresult = await customPost("test/setup/chemistry", "POST", {
      category: "ESR",
      data: range,
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

        if (status == "success") {
          records.length == 0 ? setRange(esrparams) : setRange(records)
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
                  <th>gender</th>
                  <th>agelimit</th>
                  <th>lower</th>
                  <th>upper</th>
                </tr>
              </thead>
              <tbody>
                <Suspense fallback={<NODATA_FOUND />}>
                  {
                    range.length == 0 ? null : (
                      range.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.gender}</td>
                            <td>{item.agelimit}</td>
                            <td>
                              <input
                                className='custom-input'
                                placeholder="lower"
                                step={1}
                                minLength={0}
                                inputMode="numeric"
                                type="number"
                                value={item.lower}
                                name='lower'
                                onChange={(e) => onChangeValue(e, index, 'lower')}
                              />
                            </td>
                            <td>
                              <input
                                placeholder="higher"
                                step={1}
                                className='custom-input'
                                value={item.upper}
                                name='upper'
                                onChange={(e) => onChangeValue(e, index, 'upper')}
                                minLength={0}
                              />
                            </td>
                          </tr>
                        )
                      })
                    )
                  }
                </Suspense>
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
