import { Col, Row } from "react-bootstrap";
import TopComponentBillingButton from "../topComponentBillingButton";
import { Menu, MoneyRounded, Clear } from "@mui/icons-material";
import { useContext, useState } from "react";
import { BillingContext } from "./BillingContext";
import Select from "react-select";
import AuthContext from "../../Auth/useAuthentification";
import { useSearchParams } from "next/navigation";
import { validateFormData } from "../../Auth/customFetch";
import { toast } from "react-toastify";

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
    const { discount, paid, appsettings, cart } = billingdata;
    const { includeTax, taxValue } = appsettings;
    const totalTest =
      cart.length > 0
        ? cart.reduce((a, b) => {
            return a + b.price;
          }, 0)
        : 0;
    let total = 0;
    if (includeTax == 1) {
      total = (taxValue / 100) * totalTest + totalTest;
    } else total = totalTest;
    const payable = total - discount;
    const outstanding = payable - paid;
    updateBilling((prev) => {
      const nw = {
        ...prev,
        payable: payable,
        outstanding,
        taxValue,
        testcost: totalTest,
        cost: total,
        taxIncluded: includeTax == 1 ? true : false,
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
    const { cost, paid, discount, payable,outstanding, paymentmode, organization, testcost, appsettings, clinician ,taxIncluded,taxValue,type,status} = billingdata;
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

    const callbackResponse = async function (data) {
      const { status, statusCode, message, billingid } = data;
      if (status == "success" && (statusCode == 201 || statusCode == 200)) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    };

    const { PaidBillsBeforeTransaction } = appsettings;
    if (PaidBillsBeforeTransaction == 1 && data.payable != data.paid) {
      return toast.error("Full payment must be made outright please.To change this behaviour,please kindly updates the settings");
    }
    if (data.patientid && employeeid) {
      await validateFormData(
        data,
        false,
        ["test", "cost", "type", "patientid", "samplingCenter", "concession", "paid", "paymentmode", "status"],
        "billing",
        callbackResponse
      );
    }
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
                  value={{ label: billingdata.type, value: billingdata.type }}
                  onChange={(selectedOption) => updateBilling({ ...billingdata, type: selectedOption.value })}
                  options={[
                    { value: "self", label: "Self" },
                    { value: "organization", label: "Organization" },
                    { value: "clinician", label: "Clinician" },
                  ]}
                />
              </div>

              <div>
                <label>Select Urgency</label>
                <Select
                  value={{ label: billingdata.status, value: billingdata.status }}
                  onChange={(selectedOption) => updateBilling({ ...billingdata, status: selectedOption.value })}
                  options={[
                    { value: "urgent", label: "Urgent/Critical" },
                    { value: "routine", label: "Routine" },
                    { value: "normal", label: "Normal" },
                    { value: "moderate", label: "Moderate" },
                  ]}
                />
              </div>

              <div>
                <label>Organization Name</label>
                <Select
                  isDisabled={billingdata.type != "organization"}
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
                updateBilling(defaultdata);
                setCart([]);
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
