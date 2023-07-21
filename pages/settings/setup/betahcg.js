import React, { useEffect, useState } from "react";
import CHEMISTRY_LAYOUT_SETUP from "../../../components/setup/biochemistry/Layout";
import betahcgparameter from "../../../components/setup/biochemistry/betahcgparameter";
import { Button } from "@mui/material";
import { customFetch, customPost } from "../../../components/Auth/customFetch";

export default function BetaHcg() {
  const [dataModification, setDataModification] = useState(betahcgparameter);
  const [unit, setUnit] = useState(betahcgparameter[0]["unit"] || "");

  const onChangeLower = (e, index) => {
    setDataModification((prevState) => {
      return [
        ...prevState.slice(0, index),
        { ...prevState[index], lower: e.target.value },
        ...prevState.slice(index + 1),
      ];
    });
  };

  const onChangeUpper = (e, index) => {
    setDataModification((prevState) => {
      return [
        ...prevState.slice(0, index),
        { ...prevState[index], upper: e.target.value },
        ...prevState.slice(index + 1),
      ];
    });
  };

  const handleResult = async function () {
    const data = {
      records: dataModification,
      target: "betahcg",
    };
    let pushResource = await customPost("setup/create/betahcg", "POST", data);

    const { status, statusCode } = pushResource;

    if (status == "success") {
      alert("update successfull");
    }
  };
  // get the parameters setup in the databbase when component is fully mounted

  const getCustomValues = async function () {
    const response = await customFetch("setup/get/betahcg");
    const { records, status } = response;
    // modify the records
    const transformedData = records.map((i, ii) => {
      return {
        weeks: i["WEEKS"],
        upper: i["UPPER"],
        lower: i["LOWER"],
        unit: i["UNIT"],
      };
    });

    setDataModification(transformedData);
    // update unit to reflect

    setUnit(transformedData[0]["unit"]);
  };

  const updateUnit = async function (e) {
    const { value } = e.target;
    // update the unit value to reflect all
    setUnit(value);
    // update data
    const updateData = dataModification.map((item, index) => {
      return { ...item, unit: value };
    });

    setDataModification(updateData);
  };
  return (
    <>
      <CHEMISTRY_LAYOUT_SETUP>
        <div className="_fbc">
          <header className="d-flex justify-content-between">
            <h4>Setup BetaHcg</h4>
            <div>
              <Button
                variant="contained"
                onClick={() => setDataModification(betahcgparameter)}
                sx={{ marginRight: "20px" }}
              >
                default values
              </Button>
              <Button variant="contained" onClick={getCustomValues}>
                custom values
              </Button>
            </div>
          </header>
          <input
            className="custom-input mt-2"
            type="text"
            placeholder="enter unit here"
            onChange={(e) => updateUnit(e)}
          />
          <div className="wrapperx">
            <div className="fbc_header">
              <ul>
                <li>weeks</li>
                <li>unit</li>
                <li>upper</li>
                <li>lower</li>
                <li>entered</li>
              </ul>
            </div>
            <div className="fbc_header">
              <div className="parameter-list">
                {dataModification.length == 0 ? (
                  <h5>No data found</h5>
                ) : (
                  dataModification.map((item, index) => {
                    return (
                      <ul
                        key={index}
                        style={{
                          border: `${
                            item.upper == 0 ||
                            item.lower == 0 ||
                            item.lower > item.upper
                              ? "1px solid red"
                              : ""
                          }`,
                        }}
                      >
                        <li>{item.weeks}</li>
                        <li>
                          <input type="text" disabled value={unit} />
                        </li>
                        <li>
                          <input
                            value={item.upper || 0}
                            type="number"
                            className="form-control"
                            onChange={(e) => onChangeUpper(e, index)}
                          />
                        </li>
                        <li>
                          <input
                            value={item.lower || 0}
                            type="number"
                            className="form-control"
                            onChange={(e) => onChangeLower(e, index)}
                          />
                        </li>
                        <li>
                          {item.upper != 0 && item.lower != 0
                            ? "true"
                            : "false"}
                        </li>
                      </ul>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <div
            className="fbc_header mt-2"
            style={{ display: "flex", justifyContent: "right" }}
          >
            <Button variant="contained" color="success" onClick={handleResult}>
              save changes
            </Button>
          </div>
        </div>
      </CHEMISTRY_LAYOUT_SETUP>
    </>
  );
}
