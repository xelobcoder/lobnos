import { Row, Spinner } from "react-bootstrap";
import { MoneyRounded, Clear } from "@mui/icons-material";
import { useContext, useState } from "react";
import { BillingContext } from "./BillingContext";
import Select from "react-select";
import AuthContext from "../../Auth/useAuthentification";
import { toast } from "react-toastify";
import { Billingdefaultdata, organizationOptions, urgencyOptions, ValidateAndSubmitBillingInformation } from "../../../lib/billingLib";

export default function BillingPageAdditionalInformation({ patientid, billingid }) {
  const [showMoreBtn, setShowMoreBtn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { billingdata, updateBilling } = useContext(BillingContext);
  const { auth } = useContext(AuthContext);
  const employeeid = auth?.employeeid;
  const branchid = auth?.branchid;
  const role = auth?.role;
  const [payment, setPayment] = useState({ amount: 0, mode: "", concession: "" });

  const isButtonDisabled = parseFloat(billingdata.paid) === 0 || parseFloat(billingdata.paid) < 0 || parseFloat(billingdata.paid) > billingdata.payable


  const updatePaymentMode = (selectedOption) => {
    const { label, value } = selectedOption;
    if (label === "free") {
      updateBilling({ ...billingdata, paymentmode: value, testcost: 0, cost: 0, payable: 0, outstanding: 0, isFree: true });
    } else {
      updateBilling({ ...billingdata, paymentmode: value });
    }
  };

  const handleSubmit = async (ev) => {
    // setIsSaving(true);
    const dataToBeUploaded = { ...billingdata, employeeid, branchid, patientid };
    const method = billingid ? 'PUT' : 'POST';
    const data = await ValidateAndSubmitBillingInformation(dataToBeUploaded, method, billingid);

    // setIsSaving(false);
    // if (typeof data === "object") {
    //   const { status, message } = data;
    //   (status == true | status == "success") ? toast.success(message) : toast.error(message | data);
    // }
  };




  return (
    <Row>
      <div>
        <section>
          <div className="text-sm p-2 pls-color">
            <div >
              <div>
                <label className="pls-label">Referal Type</label>
                <div >
                  <Select
                    isDisabled={billingdata.billingSource == 2}
                    value={{ label: billingdata.type, value: billingdata.type }}
                    onChange={(selectedOption) => updateBilling({ ...billingdata, type: selectedOption.value })}
                    options={organizationOptions}
                  />
                </div>
              </div>

              <div>
                <label className="pls-label text-sm">Select Urgency</label>
                <Select
                  value={{ label: billingdata.status, value: billingdata.status }}
                  onChange={(selectedOption) => updateBilling({ ...billingdata, status: selectedOption.value })}
                  options={urgencyOptions}
                />
              </div>

              <div>
                <label className="pls-label text-sm">Organization Name</label>
                <Select
                  isDisabled={billingdata.type != "organization" || billingdata.billingSource == 2}
                  placeholder="Search organization here"
                  onChange={(newValue) => {
                    updateBilling({ ...billingdata, organizationId: newValue?.id });
                  }}
                  options={billingdata.organizationData}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                />
              </div>
            </div>
            <div >
              <div >
                <label className="pls-label text-sm" >Select Clinician</label>
                <Select
                  isDisabled={billingdata.type != "clinician"}
                  placeholder="Search clinician"
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  onChange={(newValue) => {
                    updateBilling({ ...billingdata, clinicianId: newValue?.id });
                  }}
                  options={billingdata.clinicianData}
                />
              </div>

              <div className="form-group">
                <label className="pls-label text-sm">Payment Mode</label>
                <Select
                  onChange={(selectedOption) => {
                    updatePaymentMode(selectedOption);
                  }}
                  options={billingdata.paymentmodeData.map((item) => ({
                    value: item.KeyID,
                    label: item.PaymentMode,
                  }))}
                />
              </div>

              <div>
                <label className="pls-label text-sm">Advance Payment</label>
                <input
                  type="number"
                  className="custom-input"
                  value={billingdata.paid}
                  onChange={(e) => updateBilling({ ...billingdata, paid: e.target.value })}

                />
              </div>
            </div>
          </div>
        </section>
        <hr />
        <div className="mx-2">
          <div className="mt-2 d-flex justify-content-end">
            <button
              disabled={isButtonDisabled}
              className="btn btn-success mx-2"
              onClick={(ev) => { handleSubmit() }}>
              {isSaving && <Spinner size="sm" />}<MoneyRounded /> Bill Client
            </button>
            <button
              onClick={(ev) => {
                updateBilling(Billingdefaultdata);
              }}
              className="btn btn-danger">
              <Clear /> Cancel
            </button>
          </div>
        </div>
      </div>
      <section className="d-flex justify-content-end"></section>
    </Row>
  );
}
