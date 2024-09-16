import { Row } from "react-bootstrap";
import { MoneyRounded, Clear } from "@mui/icons-material";
import { useContext, useState } from "react";
import { BillingContext } from "./BillingContext";
import Select from "react-select";
import AuthContext from "../../Auth/useAuthentification";
import { useSearchParams } from "next/navigation";
import { validateFormData } from "../../Auth/customFetch";
import { toast } from "react-toastify";
import { organizationOptions, urgencyOptions } from "../../../lib/billingLib";

export default function BillingPageAdditionalInformation() {
  const [showMoreBtn, setShowMoreBtn] = useState(false);
  const { billingdata, updateBilling } = useContext(BillingContext);
  const { auth } = useContext(AuthContext);
  const patientid = useSearchParams().get("patientid");
  const employeeid = auth?.employeeid;
  const branchid = auth?.branchid;
  const role = auth?.role;
  const [payment, setPayment] = useState({ amount: 0, mode: "", concession: "" });

  const recalculateTotalBill = function () {
    const { discount = 0, paid = 0, appsettings, cart } = billingdata;
    const { taxIncluded, taxValue } = appsettings;
    const totalTest = cart.length > 0
      ? cart.reduce((a, b) => {
        return a + b.discountedValue;
      }, 0)
      : 0;
    let total = 0;
    let amountIncurredDueTax = 0;
    if (taxIncluded == 1) {
      amountIncurredDueTax = (taxValue / 100) * parseFloat(totalTest);
      total = amountIncurredDueTax + parseFloat(totalTest);
    } else total = totalTest;
    const payable = total - discount;
    const outstanding = (payable - paid);
    updateBilling((prev) => {
      const nw = {
        ...prev,
        payable: payable,
        outstanding,
        amountIncurredDueTax,
        taxValue,
        testcost: totalTest,
        cost: total,
        taxIncluded: taxIncluded == 1 ? true : false,
      };
      return nw;
    });
  };

  const updatePaymentMode = (selectedOption) => {
    const { label, value } = selectedOption;
    if (label === "free") {
      updateBilling({ ...billingdata, paymentmode: value, testcost: 0, cost: 0, payable: 0, outstanding: 0, isFree: true });
    } else {
      updateBilling({ ...billingdata, paymentmode: value });
    }
  };

  const handleSubmit = async (ev) => {

    ev.preventDefault();
    const test = billingdata.cart.map((item) => item.id);
    const samplingCenter = parseInt(branchid);
    const { cost, paid, discount, payable, outstanding, paymentmode, organization, testcost, appsettings, clinician, taxIncluded, taxValue, type, status } = billingdata;
    const data = {
      paymentmode: parseInt(paymentmode),
      samplingCenter,
      test,
      patientid: parseInt(patientid),
      clinician: clinician || 0,
      organization: organization || 0,
      paid: parseFloat(paid),
      payable: parseFloat(payable),
      outstanding,
      discount: parseFloat(discount),
      samplingCenter,
      taxIncluded,
      taxValue,
      status,
      testcost,
      employeeid,
      type,
    };

    // const callbackResponse = async function (data) {
    //   const { status, statusCode, message, billingid } = data;
    //   if (status == "success" && (statusCode == 201 || statusCode == 200)) {
    //     toast.success(message);
    //   } else {
    //     toast.error(message);
    //   }
    // };

    // const { PaidBillsBeforeTransaction } = appsettings;
    // if (PaidBillsBeforeTransaction == 1 && data.payable != data.paid) {
    //   return toast.error("Full payment must be made outright please.To change this behaviour,please kindly updates the settings");
    // }
    // if (data.patientid && employeeid) {
    //   validateFormData(data, false, ["test", "cost", "type", "patientid", "samplingCenter", "concession", "paid", "paymentmode", "status"], "billing", callbackResponse);
    // }
    console.log(data, billingdata);
  };

  return (
    <Row>
      <div>
        <section>
          <div className="p-1 grid-50">
            <div>
              <div>
                <label>Select Patient Type</label>
                <Select
                  isDisabled={billingdata.billingSource == 2}
                  value={{ label: billingdata.type, value: billingdata.type }}
                  onChange={(selectedOption) => updateBilling({ ...billingdata, type: selectedOption.value })}
                  options={organizationOptions}
                />
              </div>

              <div>
                <label>Select Urgency</label>
                <Select
                  value={{ label: billingdata.status, value: billingdata.status }}
                  onChange={(selectedOption) => updateBilling({ ...billingdata, status: selectedOption.value })}
                  options={urgencyOptions}
                />
              </div>

              <div>
                <label>Organization Name</label>
                <Select
                  isDisabled={billingdata.type != "organization" || billingdata.billingSource == 2}
                  placeholder="Search organization here"
                  onChange={(newValue) => {
                    updateBilling({ ...billingdata, organization: newValue?.id });
                  }}
                  options={billingdata.organizationData}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                />
              </div>
            </div>
            <div>
              <div>
                <label>Select Clinician</label>
                <Select
                  isDisabled={billingdata.type != "clinician"}
                  placeholder="Search clinician"
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  onChange={(newValue) => {
                    updateBilling({ ...billingdata, clinician: newValue?.id });
                  }}
                  options={billingdata.clinicianData}
                />
              </div>

              <div>
                <label>Payment Mode</label>
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
                <label>Concession</label>
                <input
                  type="number"
                  value={billingdata.discount}
                  disabled={["manager", "admin"].includes(role) ? false : true}
                  className="custom-input"
                  onChange={(e) => {
                    updateBilling({ ...billingdata, discount: e.target.value });
                  }}
                  onBlur={recalculateTotalBill}
                />
              </div>
              <div>
                <label className="text-primary">Advance Payment</label>
                <input
                  type="number"
                  className="custom-input"
                  value={billingdata.paid}
                  onChange={(e) => updateBilling({ ...billingdata, paid: e.target.value })}
                  onBlur={recalculateTotalBill}
                />
              </div>
            </div>
          </div>
        </section>
        <hr />
        <div className="mx-2">
          <div className="mt-2 d-flex justify-content-end">
            <button
              disabled={
                parseFloat(billingdata.paid) === 0 || parseFloat(billingdata.paid) < 0 || parseFloat(billingdata.paid) > billingdata.payable
              }
              className="btn btn-success mx-2"
              onClick={(ev) => {
                handleSubmit(ev);
              }}>
              <MoneyRounded /> Bill Client{" "}
            </button>
            <button
              onClick={(ev) => {
                updateBilling({});
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
