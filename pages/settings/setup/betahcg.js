import  { useEffect, useState } from "react";
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
        <div className="my-2 mx-2">
        <div className="card">
            <div className="card-header d-flex justify-content-between">
            <h4>Beta Hcg</h4>
              <div>
                  <input
                    className="custom-input"
                    type="text"
                    placeholder="enter unit here"
                    onChange={(e) => updateUnit(e)}
                  />
                </div>
                <div className="d-flex gap-1">
                  <button className="btn btn-primary btn-sm"
                    onClick={() => setDataModification(betahcgparameter)}
                    sx={{ marginRight: "20px" }}
                  >
                    default values
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={getCustomValues}>
                    custom values
                  </button>
                </div>
              </div>
              <div className="card-body">
                <table className="billing-cart-table">
            <thead>
              <tr>
                <th>weeks</th>
                <th>lower</th>
                <th>upper</th>
              </tr>
            </thead>
            <tbody>
              {dataModification.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.weeks}</td>
                    <td>
                      <input
                        className="custom-input"
                        type="number"
                        value={item.lower}
                        onChange={(e) => onChangeLower(e, index)}
                      />
                    </td>
                    <td>
                      <input
                        className="custom-input"
                        type="number"
                        value={item.upper}
                        onChange={(e) => onChangeUpper(e, index)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
                </table>
                <div
            className="fbc_header mt-2"
            style={{ display: "flex", justifyContent: "right" }}
          >
            <Button variant="contained" color="success" onClick={handleResult}>
              save changes
            </Button>
          </div>
              </div>
           </div>
        </div>
      </CHEMISTRY_LAYOUT_SETUP>
    </>
  );
}
