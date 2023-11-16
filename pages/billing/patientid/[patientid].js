import SidebarFrontPage from "../../../components/frontpagesidebar";
import { useRouter } from "next/router.js";
import {  useEffect, useState } from "react";
import TESTCART from "../../../components/registration/testCart.js";
import AddBoxIcon from "@mui/icons-material/AddBox";

import {
  BillingClass,
  billingoptions,
  defaultClinician,
  defaultOrganization,
  defaultpanel,
} from "../../../components/Auth/billing.js";
import TopComponentBillingButton from "../../../components/Billing/topComponentBillingButton";
import SettingsLayout from "../../../components/settingsComponents/SettingsLayout";
import AutoCompleteObject from "../../../components/accessories/AutoCompleteObject.jsx";

export default function Billing({}) {
  const [source, setSource] = useState("");
  const [payment, setPayment] = useState({ amount: 0, mode: "",concession:'' });
  const [billingdata, setBillingData] = useState({
    allpanels: [],
    organizations: [],
    clinicians: [],
    refered: true,
    paymentmode: [],
    taxes: [],
  });

  const [panelinputValue, setPanelInputValue] = useState("");
  const [selectedPanel, setSelectedPanel] = useState(defaultpanel);

  const [organizationinputValue, setOrganizationInputValue] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState(defaultOrganization);

  const [clinicianinputValue, setClinicianInputValue] = useState("");
  const [selectedClinician, setSelectedClinician] = useState(defaultClinician);


  const [cart, setCart] = useState([]);
  const clientid = useRouter().query.patientid;

  
  const billingClass = new BillingClass(
    clientid,
    billingdata,
    setBillingData,
    cart,
    setCart
  );

  useEffect(() => {
    billingClass.prefillData();
  }, []);

  const handleSelectedOrganization = (selected) => {
    setSelectedOrganization(selected);
    setOrganizationInputValue(selected[organizationOptions.target]);
  };

  const handleSelectedClinician = (selected) => {
    setSelectedClinician(selected);
    setClinicianInputValue(selected[clinicianOptions.target]);
  };

  const removeAllTax = () => { setBillingData({ ...billingdata, taxes: [] }) };
  // const router = useRouter();

  const [data, setData] = useState({
    organizations: null,
    organizationLabel: { NAME: "", ID: "" },
    clinicianLabel: { NAME: "", ID: "" },
    clinicians: null,
    paymentmode: "",
    cost: 0,
    test: [],
    paid: 0,
    discount: 0,
    urgency: "none",
    patientid: clientid,
    samplingCenter: "",
  });


  const [selected, setSelected] = useState(null);
  const [testArray, setTestArray] = useState([]);

  // const handleSubmit = async (e) => {
  //   const filteroutID = function (value, datasource) {
  //     const data = datasource.filter((item, index) => { return item.NAME == value });
  //     return data.length > 0 ? data[0]['ID'] : 0
  //   }

  //   const defaultData = {
  //     organizations: null,
  //     clinicians: null,
  //     paymentmode: "",
  //     cost: 0,
  //     test: [],
  //     paid: 0,
  //     discount: 0,
  //     urgency: "none",
  //     patientid: router,
  //     samplingCenter: ""
  //   }
  //   //    send data to server using fecth
  //   e.preventDefault();

  //   let refinedData = { ...data, paid: parseInt(data.paid) }
  //   try {
  //     //  if(NaN(refinedData.paid) == false)

  //     if (isNaN(refinedData.paid) == false) {
  //       const pushResponse = await customPost('billing', 'POST', refinedData);

  //       const { statusCode, status, code, message } = pushResponse;

  //       if ([0, -1, null, 'AppSett'].includes(code)) {
  //         alert(message)
  //       } else {
  //         if (statusCode == 200 && status == "success" && code == 1) {
  //           // displayt message to user
  //           alert('client billed successfully')
  //           // empty test array or cart and set default data
  //           setData(defaultData);
  //           setTestArray([]);
  //           // router to activatio page
  //           router.push('/activation')
  //         } else {
  //           alert(message)
  //         }
  //       }
  //     } else {
  //       alert('Enter a valid payment amount')
  //     }
  //   } catch (err) {
  //     console.log(err)
  //   }

  // }

  const handleSelectedPanel = (selected) => {
    setSelectedPanel(selected);
    setSelected(true);
    setPanelInputValue(selected[panelsOptions.target]);
  };

  const panelsOptions = {
    data: billingdata.allpanels,
    target: "name",
    filter: "contains",
    tabindex: 1,
    placeholder: "Search for a panel",
    handleSelected: handleSelectedPanel,
    selected: selectedPanel,
    inputValue: panelinputValue,
    setInputValue: setPanelInputValue,
  };

  const organizationOptions = {
    data: billingdata.organizations,
    target: "name",
    filter: "contains",
    tabindex: 2,
    placeholder: "Search for an organization",
    handleSelected: handleSelectedOrganization,
    selected: selectedOrganization,
    inputValue: organizationinputValue,
    setInputValue: setOrganizationInputValue,
  };

  const clinicianOptions = {
    data: billingdata.clinicians,
    target: "name",
    filter: "contains",
    tabindex: 4,
    placeholder: "Search for a clinician",
    handleSelected: handleSelectedClinician,
    selected: selectedClinician,
    inputValue: clinicianinputValue,
    setInputValue: setClinicianInputValue,
  };

  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        <div className="mx-2 d-flex justify-content-between align-content-center">
          <div className="mx-2 my-2  d-flex justify-content-between align-content-center">
            <AutoCompleteObject options={panelsOptions} />
            <div>
              <button
              className="mx-2 btn btn-primary"
                disabled={selected == null ? true : false}
                onClick={(ev) => {
                  billingClass.addToCart(selectedPanel);
                }}
                style={{ borderRadius: 0 }}
              >
                <AddBoxIcon />
              </button>
            </div>
          </div>
          <TopComponentBillingButton emptyTax={removeAllTax} cart={cart.length} />
        </div>
        <div className="mx-4 my-2">
        <TESTCART
              testArray={cart}
              handleRemove={billingClass.removeFromCart}
              emptytestcart={billingClass.emptyCart}
              // outstanding={totalBill}
            />
        {cart.length > 0 
        &&
         (
          <div className="grid-2">
          <div id="other-information" className="bg-white p-3 my-2 br-5">
          <h5 className="lims-text-color text-capitalize">other information </h5>
           <div className="col-3">
               <label>select patient type</label>
               <select
                 value={source}
                 className="form-control"
                 onChange={(e) => setSource(e.target.value)}
               >
                 <option>select</option>
                 <option value="self">Self</option>
                 <option value="organization">Organization</option>
                 <option value="clinician">clinician</option>
               </select>
             </div>

             {/* organization name */}
             <div className="col-3">
               <label>organization name</label>
               <AutoCompleteObject options={organizationOptions} />
             </div>
             <div className="col-3">
               <label>select clinician</label>
               <AutoCompleteObject options={clinicianOptions} />
             </div>
           {
            billingdata.taxes.length > 0 && (
              <div>
              <label>Taxes Applied</label>
              <ul className="list-group border br-5">
                <li className="grid-50   p-2 border-bottom text-capitalize text-primary">
                  <span>tax</span>
                  <span>value</span>
                </li>
                {billingdata.taxes.map((item, index) => {
                  return <li key={index} className="grid-50 text-sm p-2 border-bottom p-1">
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                  </li>
                }
                )}
                 <li className="grid-50 p-2 text-dark border-bottom border-top text-capitalize">
                  <span>Total tax:</span>
                  <span>{billingClass.totalTaxValue(billingdata.taxes)}</span>
                </li>
              </ul>
             </div>
            )
           }
          </div>
          <div id="payment-information" className="bg-white p-3 br-5 my-2">
          <h5 className="lims-text-color text-capitalize">payment information </h5>
          <div className="col-3">
               <label>advance payment</label>
               <input
                 type="number"
                 className="form-control"
                 value={payment.amount}
                 onChange={(e) =>
                   setPayment({ ...payment, amount: e.target.value })
                 }
               />
             </div>
             <div>
                 <label>payment mode</label>
                 <select
                   value={payment.mode}
                   className="form-control"
                   onChange={(e) =>
                     setPayment({ ...payment, mode: e.target.value })
                   }
                 >
                   <option>select</option>
                   {billingoptions.map((item, index) => {
                     return (
                       <option key={index} value={item}>
                         {item}
                       </option>
                     );
                   }
                   )}
                 </select>
            </div>
            <div>
             <label> concession</label>
               <input type="number" className="form-control" value={payment.concession} onChange={(e) => setPayment({ ...payment, concession: e.target.value })} />
            </div>
            <div className="card br-5 mt-1">
              <h5 className="card-header">payable Amount</h5>
              <h1 className="text-extra-large text-center">{billingClass.payableAmount(cart,payment.concession,billingdata.taxes)}</h1>
             </div>
             <div className="mt-2 d-flex justify-content-end">
              <button className="btn btn-success">bill client </button>
              <button className="btn  btn-danger mx-2">cancel billing</button>
              </div>
          </div>
       </div>
         )}
        </div>
      </SettingsLayout>
    </>
  );
}
