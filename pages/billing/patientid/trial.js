import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import { Add, Clear, Menu, MoneyRounded } from "@mui/icons-material";
import { Col, Row } from "react-bootstrap";

import FrontDeskLayout from "../../../components/Layout/FrontDeskLayout";
import CardRack from "../../../components/accessories/CardRacks";
import TESTCART from "../../../components/registration/testCart";
import TopComponentBillingButton from "../../../components/Billing/topComponentBillingButton";
import AuthContext from "../../../components/Auth/useAuthentification";
import { currencyFormatter, customFetch, validateFormData } from "../../../components/Auth/customFetch";
import { useSearchParams } from "next/navigation";

const defaultdata = {
  test: "",
  organization: "",
  clinician: "",
  paymentmode: "",
  paid: 0,
  discount: 0,
  cost: "",
  status: "normal",
  payable: "",
  testcost: "",
  type: "",
  taxIncluded: true,
  taxValue: "",
  patientid: "",
  outstanding: "",
  samplingCenter: "",
  employeeid: "",
};

export default function Billing({}) {
  const { auth } = useContext(AuthContext);
  const [showMoreBtn, setShowMoreBtn] = useState(false);
  const employeeid = auth?.employeeid;
  const branchid = auth?.branchid;
  const role = auth?.role;
  const router = useRouter();
  const [billingdata, setBillingdata] = useState(defaultdata);
  const [payment, setPayment] = useState({ amount: 0, mode: "", concession: "" });
  const [paymentmodes, setPaymentModes] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [clinicians, setClinicians] = useState([]);
  const [selected, setSelected] = useState(null);
  const [testpanels, setTestPanels] = useState([]);
  const [cart, setCart] = useState([]);
  const clientid = useSearchParams().get("patientid");
  const [appsettings, setAppsettings] = useState({});

  // Fetch necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const panels = await customFetch("testpanel/list/bulk");
        const organization = await customFetch("organization");
        const clinician = await customFetch("clinicians");
        const paymentModes = await customFetch("paymentmodes");

        setTestPanels(panels?.data || []);
        setOrganizations(organization?.result || []);
        setClinicians(clinician?.result || []);
        setPaymentModes(paymentModes?.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Something went wrong while fetching data.", { autoClose: 3000 });
      }
    };

    fetchData();
  }, []);

  // Function to handle adding test to cart
  const addtoCart = () => {
    if (!selected) return;

    // Check if test is already in cart
    const isInCart = cart.some((item) => item.id === selected.id);
    if (!isInCart) {
      setCart([...cart, selected]);
    } else {
      toast.warn("Selected test is already in the cart.", { autoClose: 3000 });
    }
  };

  // Function to handle removing test from cart
  const removeFromCart = (itemToRemove) => {
    const updatedCart = cart.filter((item) => item.id !== itemToRemove.id);
    setCart(updatedCart);
  };

  // Function to handle form submission
  const handleSubmit = async (ev) => {
    ev.preventDefault();

    const data = {
      ...billingdata,
      paid: parseFloat(billingdata.paid),
      cost: parseFloat(billingdata.cost),
      discount: parseFloat(billingdata.discount),
      payable: parseFloat(billingdata.payable),
      paymentmode: parseInt(billingdata.paymentmode),
      clinician: parseInt(billingdata.clinician) || 0,
      organization: parseInt(billingdata.organization) || 0,
      employeeid,
      samplingCenter: parseInt(branchid),
      test: cart.map((item) => item.id),
      patientid: parseInt(clientid),
    };

    // Validate form data
    const callbackResponse = (response) => {
      const { status, statusCode, message, billingid } = response;
      if (status === "success" && (statusCode === 201 || statusCode === 200)) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    };

    const { PaidBillsBeforeTransaction } = appsettings;
    if (PaidBillsBeforeTransaction === 1 && data.payable !== data.paid) {
      return toast.error("Full payment must be made outright. Please update settings to change this behavior.");
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

  // Function to recalculate total bill
  const recalculateTotalBill = () => {
    const { discount, paid } = billingdata;
    const { includeTax, taxValue } = appsettings;
    const totalTestCost = cart.reduce((total, item) => total + parseFloat(item.price), 0);

    let totalCost = totalTestCost;
    if (includeTax === 1) {
      totalCost += (taxValue / 100) * totalTestCost;
    }

    const payable = totalCost - discount;
    const outstanding = payable - paid;

    setBillingdata((prevData) => ({
      ...prevData,
      payable,
      outstanding,
      testcost: totalTestCost,
      cost: totalCost,
      taxIncluded: includeTax === 1,
      taxValue,
    }));
  };

  // Fetch application settings and check billing conditions
  const getAppSettings = () => {
    customFetch(`applicationsettings/billing`)
      .then((response) => {
        setAppsettings(response);
        const { PaidBillsBeforeTransaction } = response;
        if (PaidBillsBeforeTransaction === 1) {
          getOutstandingBill();
        } else {
          getAllNecessaryData();
        }
      })
      .catch((error) => {
        console.error("Error fetching application settings:", error);
      });
  };

  // Check outstanding bills for the client
  const getOutstandingBill = () => {
    if (clientid) {
      customFetch(`billing/client/bulk/outstanding?patientid=${clientid}`)
        .then((response) => {
          const outstandingDebt = response?.result[0]?.outstanding || 0;
          if (outstandingDebt > 0) {
            router.push(`/billing/payment/update/${clientid}`);
          } else {
            getAllNecessaryData();
          }
        })
        .catch((error) => {
          console.error("Error fetching outstanding bill:", error);
          toast.error("Something went wrong while fetching outstanding bill.", { autoClose: 3000 });
        });
    }
  };

  // Fetch necessary data if client ID is available
  useEffect(() => {
    if (clientid) {
      customFetch(`billing/caninitialbill?patientid=${clientid}`)
        .then((response) => {
          const { canInitiateBill } = response;
          if (!canInitiateBill) {
            toast.warn("Billing cannot be initiated for the client today. Kindly update previous billing.", { autoClose: 5000 });
          } else {
            getAppSettings();
          }
        })
        .catch((error) => {
          console.error("Error checking initial billing:", error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientid]);

  // Update total bill on cart change
  useEffect(() => {
    if (cart.length > 0) {
      recalculateTotalBill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  // Render the component
  return (
    <FrontDeskLayout>
      <ToastContainer theme="colored" position="top-center" className="text-sm fw-bold" autoClose={3000} />

      <Row className="gx-3 mx-2 ui">
        <Col md={3}>
          <section className="py-3">
            <CardRack
              className="shadow mb-3"
              header={<h6 className="fw-bold">Total Cost</h6>}
              body={<h3 className="text-center">{currencyFormatter.format(billingdata.cost)}</h3>}
            />

            <CardRack
              className="shadow mb-3"
              header={<h6 className="fw-bold">Total Taxes</h6>}
              body={<h3 className="text-center">{currencyFormatter.format(billingdata.taxValue || 0)}</h3>}
            />

            {/* Discount */}
            <CardRack
              className="shadow mb-3"
              header={<h6 className="fw-bold">Discount</h6>}
              body={<h3 className="text-center">{currencyFormatter.format(billingdata.discount)}</h3>}
            />

            {/* Amount Payable */}
            <CardRack
              className="shadow mb-3"
              header={<h6 className="fw-bold">Amount Payable</h6>}
              body={<h3 className="text-center">{currencyFormatter.format(billingdata.payable)}</h3>}
            />

            {/* Outstanding */}
            <CardRack
              className="shadow"
              header={<h6 className="fw-bold">Outstanding</h6>}
              body={<h3 className="text-center text-danger">{currencyFormatter.format(billingdata.outstanding)}</h3>}
            />
          </section>
        </Col>

        <Col md={5}>
          {/* Selected Tests List */}
          <section className="mt-4">
            {/* <h6 className="fw-bold mb-3">Selected Tests</h6>
            <ul className="list-group">
              {cart.map((item) => (
                <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {item.name}
                  <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item)}>
                    <Clear />
                  </button>
                </li>
              ))}
            </ul> */}

            {cart.length > 0 && (
              <section className="mt-3">
                <TESTCART
                  testArray={cart}
                  handleRemove={removeFromCart}
                  calculate={recalculateTotalBill}
                  emptytestcart={() => {
                    setCart([]);
                    setSelected(null);
                  }}
                />
              </section>
            )}
          </section>
        </Col>
        <Col md={4}>
          <section className="py-3 d-flex ">
            <Select
              className="col-9"
              options={testpanels}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
              onChange={(newValue) => setSelected(newValue)}
              placeholder="Search test here"
            />
            <div className="mx-1">
              <button className="btn btn-primary" disabled={!selected} onClick={addtoCart}>
                <Add /> Add
              </button>
            </div>
          </section>
          <section className="py-3">
            <div className="mb-3">
              <label className="form-label">Select Patient Type</label>
              <select
                className="form-select"
                value={billingdata.type}
                onChange={(e) => setBillingdata({ ...billingdata, type: e.target.value })}>
                <option value="">Select</option>
                <option value="self">Self</option>
                <option value="organization">Organization</option>
                <option value="clinician">Clinician</option>
              </select>
            </div>

            {/* Select Urgency */}
            <div className="mb-3">
              <label className="form-label">Select Urgency</label>
              <select
                className="form-select"
                value={billingdata.status}
                onChange={(e) => setBillingdata({ ...billingdata, status: e.target.value })}>
                <option value="">Select</option>
                <option value="urgent">Urgent/Critical</option>
                <option value="routine">Routine</option>
                <option value="normal">Normal</option>
                <option value="moderate">Moderate</option>
              </select>
            </div>

            {/* Organization Name */}
            {billingdata.type === "organization" && (
              <div className="mb-3">
                <label className="form-label">Organization Name</label>
                <Select
                  options={organizations}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  onChange={(newValue) => setBillingdata({ ...billingdata, organization: newValue?.id })}
                  placeholder="Search organization"
                />
              </div>
            )}

            {/* Select Clinician */}
            {billingdata.type === "clinician" && (
              <div className="mb-3">
                <label className="form-label">Select Clinician</label>
                <Select
                  options={clinicians}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  onChange={(newValue) => setBillingdata({ ...billingdata, clinician: newValue?.id })}
                  placeholder="Search clinician"
                />
              </div>
            )}

            {/* Payment Mode */}
            <div className="mb-3">
              <label className="form-label">Payment Mode</label>
              <select className="form-select" onChange={(e) => setBillingdata({ ...billingdata, paymentmode: e.target.value })}>
                <option value="">Select</option>
                {paymentmodes.map((item) => (
                  <option key={item.KeyID} value={item.KeyID}>
                    {item.PaymentMode}
                  </option>
                ))}
              </select>
            </div>

            {/* Concession */}
            <div className="mb-3">
              <label className="form-label">Concession</label>
              <input
                type="number"
                className="form-control"
                value={billingdata.discount}
                disabled={!["manager", "admin"].includes(role)}
                onChange={(e) => setBillingdata({ ...billingdata, discount: e.target.value })}
                onBlur={recalculateTotalBill}
              />
            </div>

            {/* Advance Payment */}
            <div className="mb-3">
              <label className="form-label text-primary">Advance Payment</label>
              <input
                type="number"
                className="form-control"
                value={billingdata.paid}
                onChange={(e) => setBillingdata({ ...billingdata, paid: e.target.value })}
                onBlur={recalculateTotalBill}
              />
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-success me-2"
                disabled={
                  parseFloat(billingdata.paid) === 0 ||
                  parseFloat(billingdata.paid) < 0 ||
                  parseFloat(billingdata.paid) > billingdata.payable
                }
                onClick={handleSubmit}>
                <MoneyRounded className="me-1" />
                Bill Client
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setBillingdata(defaultdata);
                  setCart([]);
                }}>
                <Clear className="me-1" />
                Cancel Billing
              </button>
            </div>
          </section>
        </Col>
      </Row>
    </FrontDeskLayout>
  );
}
