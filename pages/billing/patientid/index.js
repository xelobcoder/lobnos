import { useSearchParams } from "next/navigation";
import { useContext, useCallback, useEffect, useState } from "react";
import TESTCART from "../../../components/registration/testCart.js";
import TopComponentBillingButton from "../../../components/Billing/topComponentBillingButton.jsx";
import { customFetch, validateFormData } from "../../../components/Auth/customFetch.js";
import { ToastContainer, toast } from "react-toastify";
import AuthContext from "../../../components/Auth/useAuthentification.js";
import { Autocomplete } from '@mui/joy';
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
  const [billingdata, setBillingdata] = useState(defaultdata);
  const [totalBill, setTotalBill] = useState(0);
  const [payment, setPayment] = useState({ amount: 0, mode: "", concession: '' });
  const [paymentmodes, setPaymentModes] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [refered, setRefered] = useState(false);
  const [taxes, setTaxes] = useState([]);
  const [clinicians, setClincians] = useState([]);
  const [branch, setBranch] = useState(null);
  const [selected, setSelected] = useState(null);
  const [testpanels, setTestPanels] = useState([]);


  useEffect(() => {
    const getAllNecessaryData = async function () {
      try {
        let panels = await customFetch('testpanel/list/bulk');
        let organization = await customFetch('organization');
        let clinician = await customFetch('clinicians');
        let paymentModes = await customFetch('paymentmodes');
        let taxes = await customFetch('application/tax');
        const myprops = await Promise.all([panels, organization, clinician, paymentModes, taxes]);
        setTestPanels(myprops[0]?.data);
        setOrganizations(myprops[1]?.result);
        setClincians(myprops[2]?.result);
        setPaymentModes(myprops[3]?.data);
        setTaxes(myprops[4]?.result);
      } catch (err) {
        toast.error('something wrong occured', { autoClose: 3000 });
      }
    }
    getAllNecessaryData();
  }, [])



  const [cart, setCart] = useState([]);
  const clientid = useSearchParams().get("patientid");
  const toggleTax = () => {
    setBillingdata({ ...billingdata, taxIncluded: !billingdata.taxIncluded });
  };

  const recalculateTotalBill = useCallback(() => {
    const { discount, paid, taxIncluded } = billingdata;
    const totalTest = cart.length > 0 ? cart.reduce((a, b) => { return a + b.price }, 0) : 0;
    const taxValue = taxes.length > 0 ? taxes.reduce((a, b) => { return a + b.value }, 0) : 0;
    let total = 0;
    if (taxIncluded) {
      total = taxValue + totalTest;
    } else total = totalTest;

    const payable = total - discount;
    const outstanding = payable - paid;
    setBillingdata((prev) => {
      const nw = { ...prev, payable: payable, outstanding, taxValue, testcost: totalTest, cost: total };
      return nw;
    });
  }, [billingdata, cart, taxes]
  );


  useEffect(() => {
    const branch = localStorage.getItem('deviceDefaultBranch');
    if (branch) {
      setBranch(branch?.split('-')[1]);
    } else {
      alert('please select a branch. you will be redirected to the branch selection page');
      setTimeout(() => {
        window.location.href = '/settings';
      }, 1000);
    }
  }, []);



  const addtoCart = async () => {
    if (!selected) return;
    const testid = selected?.id;
    if (cart.length === 0) cart.push(selected);
    else {
      setCart((prev) => {
        const isInCart = prev.some((item, index) => parseInt(item?.id) == parseInt(testid));
        if (!isInCart) { return [...prev, selected] } else return prev;
      })
    }
    recalculateTotalBill()
    setSelected('');
  }

  const emptyCart = () => { setCart([]); setSelected('') };

  const removeFromCart = (ev, value) => {
    if (!value) return;
    setCart((prev) => {
      return prev.filter((item, index) => item?.id !== value?.id);
    })
  }
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    console.log(billingdata)
    const test = cart.map((item) => item.id);
    const samplingCenter = parseInt(branch);
    const data = { ...billingdata, employeeid, samplingCenter, test,patientid: parseInt(clientid) };
    // const data = {
    //   test,
    //   organization,
    //   clinician,
    //   paymentmode,
    //   paid: parseFloat(amount),
    //   discount: parseFloat(concession) || 0,
    //   cost: billingClass.calculateCost(cart) + billingClass.totalTaxValue(billingdata.taxes),
    //   status: clientStatus,
    //   payable: totalBill,
    //   testcost: billingClass.calculateCost(cart),
    //   type: source,
    //   taxIncluded: includeTax,
    //   taxValue: billingClass.totalTaxValue(billingdata.taxes),
    //   patientid: parseInt(clientid),
    //   outstanding: totalBill - parseFloat(amount),
    //   samplingCenter: parseInt(branch),
    //   employeeid
    // };

    const callbackResponse = async function (data) {
      const { status, statusCode, message, billingid } = data;
      if (status == 'success' && (statusCode == 201 || statusCode == 200)) {
        toast.success(message + '. Redirecting to receipt page', { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
      } else {
        toast.error(message, { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
      }
    }

    if (data.patientid && employeeid) {
      await validateFormData(data, false,
        ['test', 'cost', 'type', 'patientid', 'samplingCenter', 'concession', 'paid', 'paymentmode', 'status'],
        'billing', callbackResponse);
    }
  }

  return (
    <FrontDeskLayout>
      <ToastContainer />
      <div id='panel-selection' className="mx-3 my-2">
        <section className="d-flex justify-content-between">
          <div className="d-flex col-6 mx-2 ">
            <Autocomplete
              options={testpanels}
              getOptionLabel={(option) => option.name}
              style={{ width: '100%' }}
              placeholder='search test'
              onChange={(value, newValue) => { setSelected(newValue) }}
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
          <div>
            <TopComponentBillingButton
              includeTax={billingdata.taxIncluded}
              recalculate={recalculateTotalBill}
              toggleTax={toggleTax} cart={cart.length} />
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
                  <Autocomplete
                    placeholder='search organization here'
                    onChange={(value, newValue) => { setBillingdata({ ...billingdata, organization: newValue?.id }) }}
                    options={organizations}
                    getOptionLabel={(options) => options.name}
                  />
                </div>)}
              {billingdata.type === 'clinician' &&
                (<div>
                  <label>select clinician</label>
                  <Autocomplete
                    placeholder='search clinician'
                    getOptionLabel={(options) => options.name}
                    onChange={(value, newValue) => { setBillingdata({ ...billingdata, clinician: newValue?.id }) }}
                    options={clinicians} />
                </div>)}
            </section>
            <section>
              <div className=" p-3 br-5 my-2">
                <h5 className="lims-text-color text-capitalize">payment information </h5>
                <div>
                  <label>payment mode</label>
                  <select value={payment.mode} className="custom-input" onChange={(e) =>
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
              emptytestcart={emptyCart}
            />
            {(taxes.length > 0 && billingdata.taxIncluded) && (
              <div className="bg-white p-2 br-5">
                <label>Taxes Applied</label>
                <ul className="list-group border br-5">
                  <li className="grid-50   p-2 border-bottom text-capitalize text-primary">
                    <span>tax</span>
                    <span>value</span>
                  </li>
                  {taxes.map((item, index) => {
                    return <li key={index} className="grid-50 fw-bolder text-sm p-2 border-bottom p-1">
                      <span>{item.name}</span>
                      <span>{item.value}</span>
                    </li>
                  }
                  )}
                  <li className="grid-50 p-2 text-dark  border-bottom border-top text-capitalize">
                    <span>Total tax:</span>
                    <span>{billingdata.taxValue}</span>
                  </li>
                </ul>
              </div>
            )
            }
          </div>
        </div>
      )}
    </FrontDeskLayout>
  );
}
