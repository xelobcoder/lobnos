import { useEffect, useMemo, useState } from "react";
import { TextField, Button } from "@mui/material";
import Indicator from "../accessories/Reports/indicator";
import CommentSection from "./commentSection";
import {
  CheckResultEntered,
  customFetch,
  handleComments,
  validateFormData,
} from "../Auth/customFetch";

export default function CardiacEnzymes({ clientdata }) {
  const [resultEntered, setResultEntered] = useState(false);
  const [formElement, setFormElement] = useState([]);
  const [comment, setComment] = useState({ COMMENT: '' })

  const handleSubmit = async function () {
    await validateFormData(
      {
        resultdata: formElement,
        testname: clientdata.test,
        billingid: clientdata.billingid,
        patientid: clientdata.patientid,
        testid: clientdata.testid,
        comment: comment.COMMENT
      },
      true,
      [],
      "test/result/enter",
      function (response) {
        if (response?.statusCode == 200 && response?.status == 'success') {
          alert(response?.message)
        }
      }
    );
  };





  const handleDataChange = (setupid, value) => {
    const updatedData = formElement.map((item) => {
      if (item.setupid === setupid) {
        return {
          ...item,
          value: parseInt(value),
        };
      }
      return item;
    });
    setFormElement(updatedData);
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
          let obj = {};
          obj.setupid = item.LIVERID;
          obj.parameter = item.PARAMETER;
          obj.value = item.VALUE;
          return obj;
        });


        const matchAndSetData = async () => {
          const response = await customFetch('test/setup/chemistry?panelname=CARDIAC_ENZYMES');
          const { records, status, statusCode } = response;
          console.log(mapped, records)
          if (status == 'success' && statusCode == 200) {
            if (records.length != 0 && mapped.length != 0) {
              const updatedData = records.map((item) => {
                const matchingItem = mapped.find((bItem) => bItem.parameter === item.parameter);
                if (matchingItem) {
                  return {
                    ...item,
                    value: matchingItem.value,
                  };
                }
                return item;
              });
              setFormElement(updatedData);
            }
          }
        };

        matchAndSetData()
      }
      else {
        async function getData() {
          const response = await customFetch('test/setup/chemistry?panelname=CARDIAC_ENZYMES');
          const { records, status, statusCode } = response;
          setFormElement(records);
        }
        getData();
      }
    }

    getData();
  }, [clientdata.billingid]);

  useEffect(() => {
    async function getComment() {
      const getComment = await customFetch(`result/preview/comments?billingid=${clientdata.billingid}&&testid=${clientdata.testid}`);
      if (getComment.length > 0) {
        const { comments } = getComment[0];
        setComment({ COMMENT: comments })
      }
    }
    getComment();
  }, [])



  return (
    <>
      <div className="p-2">
        <div>
          <form>
            {/* LDH */}
            <h5>Cardiac Enzymes</h5>
            <Indicator resultEntered={resultEntered} />
            {formElement.map((item, index) => (
              <div className="form-group" key={item.setupid}>
                <input
                  style={{ width: "100%", marginTop: "30px" }}
                  size="small"
                  label={item.parameter}
                  variant="standard"
                  type="number"
                  className="custom-input"
                  value={item.value}
                  onChange={(e) =>
                    handleDataChange(item.setupid, e.target.value)
                  }
                />
                <span style={{ color: "blue" }}>
                  Reference Range {item.upper} - {item.lower}
                </span>
              </div>
            ))}
            <CommentSection
              getcomment={handleComments}
              target={"COMMENT"}
              datasource={comment}
              datafunction={setComment}
              value={comment.COMMENT}
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
