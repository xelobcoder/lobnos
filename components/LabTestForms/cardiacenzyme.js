import { useCallback, useEffect, useState } from "react";
import Indicator from "../accessories/Reports/indicator";
import CommentSection from "./commentSection";
import ISLOADING from "../isLoading";
import Link from "next/link";
import { CheckResultEntered, customFetch, handleComments, validateFormData } from "../Auth/customFetch";

export default function CardiacEnzymes({ clientdata }) {
  const [resultEntered, setResultEntered] = useState(false);
  const [formElement, setFormElement] = useState([]);
  const [comment, setComment] = useState({ COMMENT: '' })
  const [isParams, setupParams] = useState(true);
  const [loading, setLoading] = useState(true);

  const handleSubmit = async function () {
    const callbackhandler = function (response) {
      if (response?.statusCode == 200 && response?.status == 'success') { alert(response?.message) }
    }

    await validateFormData({
      resultdata: formElement, testname: clientdata.test, billingid: clientdata.billingid, patientid: clientdata.patientid, testid: clientdata.testid, comment: comment.COMMENT
    }, true, [], "test/result/enter", callbackhandler);
  };





  const handleDataChange = (setupid, value) => {
    const updatedData = formElement.map((item) => {
      if (item.setupid === setupid) {
        return { ...item, value: parseInt(value) };
      }
      return item;
    });
    setFormElement(updatedData);
  };


  async function getData() {
    const response = await customFetch('test/setup/chemistry?panelname=CARDIAC_ENZYMES');
    const { records, status, statusCode } = response;
    if (status == 'success' && statusCode == 200) {
      return records;
    } else {
      setupParams(false);
      return [];
    }
  }

  const populateForm = useCallback(async () => {
    let response = await CheckResultEntered("cardiac_enzymes", clientdata.billingid);
    const { message, statusCode, result } = response;
      if (result == true) {
        const prev = response?.records;
        setResultEntered(true);
        // get the data and set to the data object useState
        const setupdata = await getData();
        if (Array.isArray(setupdata) && setupdata.length > 0) {
          const updatedData = setupdata.map((item) => {
            const matchingItem = prev.find((bItem) => bItem.parameter === item.parameter);
            if (matchingItem) {
              return {
                ...item,
                value: matchingItem.value,
              };
            }
            return item;
          });
          setFormElement(updatedData);
          setLoading(false);
        } else {
          setLoading(false)
          setupParams(false);
        }
      }
      else {
      setLoading(false);
      setFormElement(await getData());
    }

  }, [clientdata.billingid]);

  useEffect(() => { populateForm(); }, [clientdata.billingid, populateForm]);

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
      {
        (loading === true && formElement.length == 0 && isParams) ?
          <div className="d-flex justify-content-center my-5"><ISLOADING /></div> : (
            <div>
              <form className="bg-white br-5 p-2">
                <div className="card br-5 p-0 m-0">
                  <div className="card-header modal-color">
                    <h5 >Cardiac Enzymes</h5>
                    <Indicator resultEntered={resultEntered} />
                  </div>
                  <div className="card-body">
                    <table className="billing-cart-table">
                      <thead>
                        <tr>
                          <th>Test</th>
                          <th>Result</th>
                          <th>Reference Interval</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formElement.map((item, index) => (
                          <tr key={index}>
                            <td className="lims-text-color">{item.parameter}</td>
                            <td>
                              <input
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
                            </td>
                            <td>({item.upper} - {item.lower}){item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="card-foote">
                      <CommentSection
                        getcomment={handleComments}
                        target={"COMMENT"}
                        datasource={comment}
                        datafunction={setComment}
                        value={comment.COMMENT}
            />
                    </div>
                    <div className="form-group d-flex justify-content-between">
                      <button type="button" className="btn btn-primary btn-sm" onClick={handleSubmit}>
                        Save Result
                      </button>
                      <Link href='/settings/setup/cardiacenzymes'>
                        <button type="button" className="btn btn-primary btn-sm">
                          + parameters
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
          </form>
        </div>
          )
      }
      {isParams === false && <div className="bg-danger p-3 br-5 text-white mx-2 text">Test Params Not set</div>}
    </>
  );
}
