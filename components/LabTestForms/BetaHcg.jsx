import React, { useState, useEffect } from "react";
import CommentSection from "./commentSection";
import { Button } from "@mui/material";
import Indicator from "../accessories/Reports/indicator";
import {
  CheckResultEntered,
  customFetch,
  handleComments,
  validateFormData,
} from "../Auth/customFetch";
export default function BetaHcg({ clientdata }) {
  const [data, setData] = useState({ value: "", unit: "" ,comments: ''});
  const [resultEntered, setResultEntered] = useState(true);
  const [reference, setReference] = useState([]);

  useEffect(() => {
    async function getData() {
      try {
        const response = await customFetch("setup/get/betahcg");
        const checkresult = await CheckResultEntered(
          clientdata.test,
          clientdata.billingid
        );
        setReference(response?.records);
        setData({ ...data, unit: response?.records[0]["UNIT"] });
        setResultEntered(checkresult?.result ? true : false);
        // if result have been entered then we get collect the previously entered data
        if (checkresult?.result == true) {
          const { records } = checkresult;
        }
      } catch (err) {
        console.log(err);
      }
    }
    getData();
  }, []);

  // enter result

  const handleResult = async function () {
    await validateFormData(
      {
        ...data,
        testname: clientdata.testname,
        billingid: clientdata.billingid,
        testid: clientdata.testid,
        patientid: clientdata.patientid,
      },
      true,
      [],
      "test/result/enter",
      function (response) {
        console.log(response);
      }
    );
  };
  return (
    <div>
      <div className="p-2" style={{ backgroundColor: "whitesmoke" }}>
        <div>
          <h5>Beta human chorionic hormone (Beta Hcg) test</h5>
          <Indicator resultEntered={resultEntered} />
          <form className="bg-white">
            <table id="entry-table-chemistry">
              <thead>
                <tr>
                  <th>paramater</th>
                  <th>value</th>
                  <th> unit</th>
                  <th>reference</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-bottom">
                  <td>beta hcg</td>
                  <td>
                    <input
                      type="number"
                      name=""
                      style={{ height: "30px" }}
                      value={data.value}
                      onChange={(e) =>
                        setData({ ...data, value: e.target.value })
                      }
                      step={"0.5"}
                    />
                  </td>
                  <td>{data.unit}</td>
                  <td>
                    {reference.map((single, index) => {
                      return (
                        <p key={index} style={{ fontSize: 10 }}>
                          {single["WEEKS"] +
                            " Weeks: " +
                            "(" +
                            single["LOWER"] +
                            "-" +
                            single["UPPER"] +
                            ")"}
                        </p>
                      );
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
          <CommentSection getcomment={handleComments} datasource={data} datafunction={setData} value={data.comments} target={'comments'}/>
          <Button variant='contained' className="mt-3" color='primary' onClick={handleResult}>
            save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
