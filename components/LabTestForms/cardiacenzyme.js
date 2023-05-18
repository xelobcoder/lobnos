import { useEffect, useMemo, useState } from "react";
import { TextField, Button } from "@mui/material";
import Indicator from "../accessories/Reports/indicator";
import CommentSection from "./commentSection";
import {
  CheckResultEntered,
  handleComments,
  validateFormData,
} from "../Auth/customFetch";

export default function CardiacEnzymes({ clientdata }) {
  const [resultEntered, setResultEntered] = useState(false);
  const [data, setData] = useState({
    LDH: "",
    MYOGLOBIN: "",
    TROPONIN: "",
    CK_MB: "",
    AST: 0,
    COMMENT: "",
  });

  const handleSubmit = async function () {
    await validateFormData(
      {
        ...data,
        testname: clientdata.test,
        billingid: clientdata.billingid,
        patientid: clientdata.patientid,
        testid: clientdata.testid,
      },
      true,
      [],
      "test/result/enter",
      function (response) {
        console.log(response);
      }
    );
  };

  useMemo(() => {
    async function getData() {
      let response = await CheckResultEntered(
        "cardiac_enzymes",
        clientdata.billingid
      );
      const { message, statusCode, result, records } = response;

      if (result == true) {
        setResultEntered(true);
        // get the data and set to the data object useState
        const mapped = records.map((item, index) => {
          return {
            NAME: item.PARAMETERNAME,
            VALUE: item.VALUE,
            COMMENT: item.COMMENTS,
          };
        });
        // filter values using the parameter
        function getValue(name) {
          return mapped.filter((item, index) => {
            return item.NAME == name;
          })[0];
        }
        // set data
        setData({
          LDH: getValue("LDH")?.["VALUE"],
          MYOGLOBIN: getValue("MYOGLOBIN")?.["VALUE"],
          TROPONIN: getValue("TROPONIN")?.["VALUE"],
          CK_MB: getValue("CK_MB")?.["VALUE"],
          AST: getValue("AST")?.["VALUE"],
          COMMENT: mapped[0]["COMMENT"],
        });
      }
    }

    getData();
  }, [clientdata.billingid]);
  return (
    <>
      <div className="p-4">
        <div>
          <form>
            {/* LDH */}
            <h4>Cardiac Enzymes</h4>
            <Indicator resultEntered={resultEntered} />
            <div className="form-group">
              <TextField
                sx={{ width: "100%", marginTop: "30px" }}
                size="small"
                label="LDH"
                variant="filled"
                type="number"
                value={data.LDH}
                onChange={(e) => setData({ ...data, LDH: e.target.value })}
              />
            </div>
            {/* MYOGLOBIN */}
            <div className="form-group">
              <TextField
                sx={{ width: "100%", marginTop: "30px" }}
                size="small"
                label="MYOGLOBIN"
                variant="filled"
                type="number"
                value={data.MYOGLOBIN}
                onChange={(e) =>
                  setData({ ...data, MYOGLOBIN: e.target.value })
                }
              />
            </div>
            {/* TROPONIN */}
            <div className="form-group">
              <TextField
                sx={{ width: "100%", marginTop: "30px" }}
                size="small"
                label="TROPONIN"
                variant="filled"
                type="number"
                value={data.TROPONIN}
                onChange={(e) => setData({ ...data, TROPONIN: e.target.value })}
              />
            </div>
            {/* CK_MB */}
            <div className="form-group">
              <TextField
                sx={{ width: "100%", marginTop: "30px" }}
                size="small"
                label="CK_MB"
                variant="filled"
                type="number"
                value={data.CK_MB}
                onChange={(e) => setData({ ...data, CK_MB: e.target.value })}
              />
            </div>
            {/* AST */}
            <div className="form-group">
              <TextField
                sx={{ width: "100%", marginTop: "30px" }}
                size="small"
                label="AST"
                variant="filled"
                type="number"
                value={data.AST}
                onChange={(e) => setData({ ...data, AST: e.target.value })}
              />
            </div>
            {/* comment */}
            {/* <div className="form-group mt-3">
        <textarea className="form-control" value={data.comment} onChange={(e) => setData({ ...data, comment: e.target.value })} placeholder="comment"></textarea>
        </div> */}
            <CommentSection
              getcomment={handleComments}
              target={"COMMENT"}
              datasource={data}
              datafunction={setData}
              value={data.COMMENT}
            />
            {/* save result */}
            <div className="form-group">
              <Button
                className="mt-3"
                variant="contained"
                onClick={(e) => handleSubmit(e)}
                color="primary"
                type="button"
              >
                save result
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
