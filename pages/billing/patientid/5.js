import { useSearchParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import TESTCART from "../../../components/registration/testCart.js";
import TopComponentBillingButton from "../../../components/Billing/topComponentBillingButton.jsx";
import { customFetch, validateFormData } from "../../../components/Auth/customFetch.js";
import { ToastContainer, toast } from "react-toastify";
import AuthContext from "../../../components/Auth/useAuthentification.js";
import Select from 'react-select'; 
import FrontDeskLayout from "../../../components/Layout/FrontDeskLayout.jsx";

const defaultdata = {
  test: '',
  organization: "",
  clinician: '',
  paymentmode: '',
  paid: 0,
  discount: 0,
  cost: '',
  status: 'normal',
  payable: '',
  testcost: '',
  type: '',
  taxIncluded: true,
  taxValue: '',
  patientid: '',
  outstanding: '',
  samplingCenter: '',
  employeeid: ''
}

export default function Billing({ }) {
  const { auth } = useContext(AuthContext);
  const employeeid = auth?.employeeid;
  const branchid = auth?.branchid;
  const role = auth?.role;
  const router = useRouter();
  const [billingdata, setBillingdata] = useState(defaultdata);
  const [payment, setPayment] = useState({ amount: 0, mode: "", concession: '' });
  const [paymentmodes, setPaymentModes] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [clinicians, setClincians] = useState([]);
  const [selected, setSelected] = useState(null);
  const [testpanels, setTestPanels] = useState([]);
  const [cart, setCart] = useState([]);
  const clientid = useSearchParams().get("patientid");
  const [appsettings, setAppsettings] = useState({});

  const getAllNecessaryData = async function () {
    try {
      const panels = await customFetch('testpanel/list/bulk');
      const organization = await customFetch('organization');
      const clinician = await customFetch('clinicians');
      const paymentModes = await customFetch('paymentmodes');
      const myprops = await Promise.all([panels, organization, clinician, paymentModes]);
      setTestPanels(myprops[0]?.data);
      setOrganizations(myprops[1]?.result);
      setClincians(myprops[2]?.result);
      setPaymentModes(myprops[3]?.data);
    } catch (err) {
      toast.error('something wrong occured', { autoClose: 3000 });
    }
  }

  const getOustandingBill = async () => {
    if (clientid) {
      customFetch(`billing/client/bulk/outstanding?patientid=${clientid}`)
        .then((data) => {
          const outstandingDebt = data?.result[0]?.outstanding;
          if (outstandingDebt > 0) {
            router.push(`/billing/payment/update/${clientid}`)
          } else {
            getAllNecessaryData();
          }
        }).catch((err) => {
          console.log(err)
          toast.error('something wrong occured', { autoClose: 500 })
        })
    }
  }

  function getAppSet() {
    customFetch(`applicationsettings/billing`)
      .then((data) => {
        setAppsettings(data);
        const { PaidBillsBeforeTransaction } = data;
        if (PaidBillsBeforeTransaction === 1) {
          getOustandingBill();
        } else {
          getAllNecessaryData();
        }
      }).catch((err) => {
        console.log(err)
      })
  }

  useEffect(() => {
    if (clientid) {
      customFetch(`billing/caninitialbill?patientid=${clientid}`)
        .then((data) => {
          const { canInitiateBill } = data;
          if (canInitiateBill === false) {
            toast.warn(`Billing cannot be initiated for client today.Kindly update previous billing`, { autoClose: 5000 });
          } else {
            getAppSet();
          }
        }).catch((err) => {
          console.log(err)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientid])

  const recalculateTotalBill = function () {
    const { discount, paid } = billingdata;
    const { includeTax, taxValue } = appsettings;
    const totalTest = cart.length > 0 ? cart.reduce((a, b) => { return a + b.price }, 0) : 0;
    let total = 0;
    if (includeTax == 1) {
      total = ((taxValue / 100) * totalTest) + totalTest;
    } else total = totalTest;
    const payable = total - discount;
    const outstanding = payable - paid;
    setBillingdata((prev) => {
      const nw = { ...prev, payable: payable, outstanding, taxValue, testcost: totalTest, cost: total, taxIncluded: includeTax == 1 ? true : false };
      return nw;
    });
  }

  const addtoCart = async () => {
    if (!selected) return;
    const testid = selected?.id;
    if (cart.length === 0) {
      setCart([...cart, selected])
    }
    else {
      setCart((prev) => {
        const isInCart = prev.some((item, index) => parseInt(item?.id) == parseInt(testid));
        if (!isInCart) { return [...prev, selected] } else return prev;
      })
    }
  }

  useEffect(() => {
    if (cart.length >= 0) {
      recalculateTotalBill()
    }
  }, [cart.length])

  const emptyCart = () => { setCart([]); setSelected('') };
  const removeFromCart = (ev, value) => {
    if (!value) return;
    setCart((prev) => { return prev.filter((item, index) => item?.id !== value?.id); })
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const test = cart.map((item) => item.id);
    const samplingCenter = parseInt(branchid);
    const { cost, paid, discount, payable, paymentmode, organization, clinician } = billingdata;
    const data = {
      ...billingdata,
      paid: parseFloat(paid),
      cost: parseFloat(cost),
      discount: parseFloat(discount),
      payable: parseFloat(payable),
      paymentmode: parseInt(paymentmode),
      clinician: clinician || 0,
      organization: organization || 0,
      employeeid, samplingCenter, test, patientid: parseInt(clientid)
    };

    const callbackResponse = async function (data) {
      const { status, statusCode, message, billingid } = data;
      if (status == 'success' && (statusCode == 201 || statusCode == 200)) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    }

    const { PaidBillsBeforeTransaction } = appsettings;
    if (PaidBillsBeforeTransaction == 1 && (data.payable != data.paid)) {
      return toast.error('Full payment must be made outright please.To change this behaviour,please kindly updates the settings');
    }
    if (data.patientid && employeeid) {
      await validateFormData(data, false,
        ['test', 'cost', 'type', 'patientid', 'samplingCenter', 'concession', 'paid', 'paymentmode', 'status'],
        'billing', callbackResponse);
    }
  }

  return (
    <FrontDeskLayout>
      <ToastContainer theme="colored" position="top-center" className="text-sm fw-bold" autoClose={3000} />
      <div>
        <div id='panel-selection' className="mx-3 my-2">
          <section className="d-flex justify-content-between">
            <div className="d-flex col-6 mx-2" >
              <Select
                className="custom-autocomplete"
                options={testpanels}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                styles={{ container: (base) => ({ ...base, width: '100%' }) }}
                placeholder='search test'
                onChange={(newValue) => { setSelected(newValue) }}
              />
              <div>
                <button
                  className="my-0 mx-2 btn btn-primary rounded"
                  disabled={selected == null ? true : false}
                  onClick={(ev) => {
                    addtoCart();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                  </svg>
                </button>
              </div>
            </div>

          </section>
        </div>
        {cart.length > 0 && (
          <div className="grid grid-50-responsive mx-3">
            <div>
              <section className="p-2" >
                <div>
                  <label>select patient type</label>
                  <select
                    value={billingdata.type}
                    className="custom-input"
                    onChange={(e) => setBillingdata({ ...billingdata, type: e.target.value })}
                  >
                    <option>select</option>
                    <option value="self">Self</option>
                    <option value="organization">Organization</option>
                    <option value="clinician">clinician</option>
                  </select>
                </div>
                {/* select patient urgency type */}
                <div>
                  <label>select urgency</label>
                  <select className="custom-select" value={billingdata.status}
                    onChange={(e) => setBillingdata({ ...billingdata, status: e.target.value })}>
                    <option>select</option>
                    <option value='urgent'>urgent/critical</option>
                    <option value='routine'>routine</option>
                    <option value='normal'>normal</option>
                    <option value='moderate'>moderate</option>
                  </select>
                </div>

                {/* organization name */}
                {billingdata.type === 'organization' && (
                  <div>
                    <label>organization name</label>
                    <Select
                      className="custom-autocomplete"
                      placeholder='search organization here'
                      onChange={(newValue) => { setBillingdata({ ...billingdata, organization: newValue?.id }) }}
                      options={organizations}
                      getOptionLabel={(options) => options.name}
                      getOptionValue={(option) => option.id}
                    />
                  </div>)}
                {billingdata.type === 'clinician' &&
                  (<div>
                    <label>select clinician</label>
                    <Select
                      className="custom-autocomplete"
                      placeholder='search clinician'
                      getOptionLabel={(options) => options.name}
                      getOptionValue={(option) => option.id}
                      onChange={(newValue) => { setBillingdata({ ...billingdata, clinician: newValue?.id }) }}
                      options={clinicians} />
                  </div>)}
              </section>
              <section>
                <div className=" p-3 br-5 my-2">
                  <h5 className="lims-text-color text-capitalize">payment information </h5>
                  <div>
                    <label>payment mode</label>
                    <select className="custom-input" onChange={(e) =>
                      setBillingdata({ ...billingdata, paymentmode: e.target.value })}
                    >
                      <option>select</option>
                      {paymentmodes.map((item, index) => {
                        return (
                          <option key={index} value={item.KeyID}>
                            {item.PaymentMode}
                          </option>
                        );
                      }
                      )}
                    </select>
                  </div>
                  <div>
                    <label> concession</label>
                    <input type="number"
                      value={billingdata.discount}
                      disabled={['manager', 'admin'].includes(role) ? false : true}
                      className="custom-input"
                      onChange={(e) => {
                        setBillingdata({ ...billingdata, discount: e.target.value })
                      }
                      }
                      onBlur={(ev) => { recalculateTotalBill() }}
                    />
                  </div>
                  <div>
                    <label className="text-primary">advance payment</label>
                    <input
                      type="number"
                      className="custom-input"
                      value={billingdata.paid}
                      onChange={(e) =>
                        setBillingdata({ ...billingdata, paid: e.target.value })
                      }
                      onBlur={(ev) => { recalculateTotalBill() }}
                    />
                  </div>
                  <div className="card br-5 mt-1">
                    <h5 className="card-header">Payable Amount</h5>
                    <h5 className="text-extra-large text-center border-bottom border-secondary">{billingdata.payable}</h5>
                    <h6 className="text-uppercase text-danger mx-3">outstanding: {billingdata.outstanding}</h6>
                  </div>
                  <div className="mt-2 d-flex justify-content-end">
                    <button
                      disabled={parseFloat(billingdata.paid) === 0 || parseFloat(billingdata.paid) < 0 ||
                        (parseFloat(billingdata.paid) > billingdata.payable) ? true : false}
                      className="btn btn-success btn-sm" onClick={(ev) => { handleSubmit(ev) }}>bill client </button>
                    <button className="btn  btn-danger btn-sm mx-2">cancel billing</button>
                  </div>
                </div>
              </section>
            </div>
            <div>
              <TESTCART
                testArray={cart}
                handleRemove={removeFromCart}
                calculate={recalculateTotalBill}
                emptytestcart={emptyCart}
              />
            </div>
          </div>
        )}
        {cart.length > 0 && <div>
          <TopComponentBillingButton />
        </div>}
      </div>
    </FrontDeskLayout>
  );
}
