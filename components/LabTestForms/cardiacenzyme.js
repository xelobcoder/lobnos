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
  const [formElement, setFormElement] = useState([])
  const [data, setData] = useState({});

  const handleSubmit = async function () {
    await validateFormData(
      {
        resultdata : formElement,
        testname: clientdata.test,
        billingid: clientdata.billingid,
        patientid: clientdata.patientid,
        testid: clientdata.testid,
      },
      true,
      [],
      "test/result/enter",
      function (response) {
        if(response?.statusCode ==  200 && response?.status == 'success') {
          alert(response?.message)
        }
      }
    );
  };


  useMemo(() => {
    const getFormElement = async function () {
      const response = await customFetch('test/setup/chemistry?panelname=CARDIAC_ENZYMES');
      const { records, status, statusCode } = response;
      if (status == 'success' && statusCode == 200) {
        records.length == 0 ?
          setFormElement([]) :
          setFormElement(records.map((u, i) => {
            return { ...u, value: '' }
          }))
      }
    }
    getFormElement();
  }, [])


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





  useEffect(() => {
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

        const matchAndSetData = () => {
          if(formElement.length != 0 && mapped.length !=0) {
            const updatedData = formElement.map((item) => {
              const matchingItem = mapped.find((bItem) => bItem.parameter=== item.parameter);
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
        };

        matchAndSetData()

      }
    }

    getData();
  }, [clientdata.billingid,formElement]);
  return (
    <>
      <div className="p-4">
        <div>
          <form>
            <form>
              {/* LDH */}
              <h4>Cardiac Enzymes</h4>
              <Indicator resultEntered={resultEntered} />

              {formElement.map((item, index) => (
                <div className="form-group" key={item.setupid}>
                  <TextField
                    sx={{ width: "100%", marginTop: "30px" }}
                    size="small"
                    label={item.parameter}
                    variant="filled"
                    type="number"
                    value={item.value}
                    onChange={(e) => handleDataChange(item.setupid, e.target.value)}
                  />
                  <span style={{ color: 'blue' }}>  Reference Range {item.upper} - {item.lower}</span>
                  {item.value < item.lower && (
                    <p style={{ color: "red" }}>{`${item.parameter} is below the lower limit.`}</p>
                  )} <br></br>
                  {item.value > item.upper && (
                    <p style={{ color: "red" }}>{`${item.parameter} is above the upper limit.`}</p>
                  )}
                </div>
              ))}
            </form>
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
