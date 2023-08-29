import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Autocomplete, FormLabel, Radio, RadioGroup, FormControlLabel, Button, TextField, MenuItem, FormControl, Select, InputLabel } from "@mui/material";
import TESTCART from "../../components/registration/testCart.js";
import CancelScheduleSendIcon from "@mui/icons-material/CancelScheduleSend";
import SendIcon from "@mui/icons-material/Send";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { customFetch, customPost } from "../../components/Auth/customFetch";

export default function Billing({ }) {
  const [allpanels, setAllpanels] = useState([]);
  const [organization, setOrganization] = useState([]);
  const [clinicians, setClinicians] = useState([]);
  const [branch, setBranch] = useState([]);
  const [refered, setRefered] = useState(true);
  const [paymentmode, setPaymentMode] = useState([])

  useEffect(() => {
    const check = async function () {
      let data = await customFetch('testpanel/list');
      const organization = await customFetch('organization');
      const clinician = await customFetch('clinicians');
      const branch = await customFetch('center');
      const paymentModes = await customFetch('paymentmodes');

      setAllpanels(data?.data || []);
      setOrganization(organization || []);
      setClinicians(clinician || []);
      setBranch(branch || []);
      setPaymentMode(paymentModes?.data || [])
    }
    try {
      check();
    } catch (err) {
      // Display a message to the user.
      alert(err.message);
    }
  }, [])


  const getStringValue = function (id, array, objectKey, returner) {
    const filteredValue = array.filter((item, index) => { return item[objectKey] == id });
    return filteredValue[0]
  }



  const router = useRouter().query.patientid;
  const navigate = useRouter();
  const [data, setData] = useState({
    organizations: null,
    organizationLabel: { NAME: '', ID: '' },
    clinicianLabel: { NAME: '', ID: '' },
    samplingCenterLabel: { NAME: '', BRANCHID: '' },
    clinicians: null,
    paymentmode: "",
    cost: 0,
    test: [],
    paid: 0,
    discount: 0,
    urgency: "none",
    patientid: router,
    samplingCenter: "",
  });



  const [selected, setSelected] = useState(null);
  const [testArray, setTestArray] = useState([]);


  const emptytestcart = (e) => {
    setTestArray([]);
  };

  const handleAutocomplete = (e) => {
    // check cart to ensure no duplicate data is found
    let cart = testArray.filter((item) => item.ID === selected.ID);
    // if cart is empty, add data to cart
    // adding data function
    const addData = () => {
      setTestArray([...testArray, selected]);
      setData({ ...data, test: [...data.test, selected.ID] });
    };
    cart.length === 0 ? addData() : alert("test already in cart");
  };

  useEffect(() => {
    // calculate test cost and update data
    let cost = testArray.reduce((acc, curr) => {
      return acc + curr.PRICE;
    }, 0);
    // update data
    setData({ ...data, cost: cost });
  }, [testArray]);

  const handleRemove = (e, single) => {
    // filter out the selected test from the cart
    let cart = testArray.filter((item) => item.ID != single.ID);
    // return all tests except the selected test
    // set test array to the new cart
    setTestArray(cart);
    // remove test from data test array
    let test = data.test.filter((item) => item != single.NAME);
    setData({ ...data, test: test });
  };

  const handleSubmit = async (e) => {
    const filteroutID = function (value, datasource) {
      const data = datasource.filter((item, index) => { return item.NAME == value });
      return data.length > 0 ? data[0]['ID'] : 0
    }


    const defaultData = {
      organizations: null,
      clinicians: null,
      paymentmode: "",
      cost: 0,
      test: [],
      paid: 0,
      discount: 0,
      urgency: "none",
      patientid: router,
      samplingCenter: ""
    }
    //    send data to server using fecth
    e.preventDefault();

    let refinedData = { ...data, paid: parseInt(data.paid) }
    try {
      //  if(NaN(refinedData.paid) == false)

      if (isNaN(refinedData.paid) == false) {
        const pushResponse = await customPost('billing', 'POST', refinedData);

        const { statusCode, status } = pushResponse;

        if (statusCode == 200 && status == "success") {
          // displayt message to user
          alert('client billed successfully')
          // empty test array or cart and set default data 
          setData(defaultData);
          setTestArray([]);
          // navigate to activatio page
          navigate.push('/activation')
        } else {
          alert('something failed!!!!. Ensure all data filled in correctly')
        }
      } else {
        alert('Enter a valid payment amount')
      }
    } catch (err) {
      console.log(err)
    }

  }


  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "50% auto",
          gridGap: "20px 20px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              width: "40vw",
              height: "40px",
              marginTop: "40px",
              marginLeft: "20px",
            }}
          >
            <Autocomplete
              sx={{ width: "80%" }}
              options={allpanels}
              getOptionLabel={(option) => option.NAME}
              value={selected}
              size="small"
              onChange={(e, newValue) => {
                setSelected(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select a panel"
                  variant="outlined"
                />
              )}
            />

            <Button
              disabled={selected == null ? true : false}
              startIcon={<AddBoxIcon />}
              onClick={(e) => {
                handleAutocomplete(e);
              }}
              color="primary"
              variant="contained"
              sx={{ borderRadius: 0, marginLeft: "10px" }}
            >
              add
            </Button>
          </div>
          <div style={{ width: "40vw", marginLeft: "20px", marginTop: "20px" }}>
            <Autocomplete
              style={{ width: "80%" }}
              options={['walkin client', 'refered']}
              getOptionLabel={(option) => option}
              value={refered ? 'refered' : 'walkin client'}
              size="small"
              onChange={(e, newValue) => {
                if (newValue == 'refered') {
                  setRefered(true);
                } else {
                  setRefered(false);
                  setData({...data, organizations: 0, clinicians: 0})
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="client type"
                  variant="outlined"
                />
              )}
            />
          </div>
          <div style={{ width: "40vw", marginLeft: "20px", marginTop: "20px" }}>
            {refered  && (
              <div style={{ marginTop: "20px", width: "80%" }}>
                <Autocomplete
                  value={data.organizationLabel}
                  size="small"
                  options={organization}
                  getOptionLabel={(option) => option.NAME}
                  onChange={(e, newValue) => {
                    const { ID, NAME } = newValue;
                    setData({ ...data, organizations: ID, organizationLabel: getStringValue(ID, organization, 'ID', 'NAME') });
                  }}
                  renderInput={(params, index) => (
                    <TextField
                      key={index}
                      {...params}
                      label="Select a organization"
                      variant="outlined"
                    />
                  )}
                />
              </div>
            )}
            {refered  && (
              <div style={{ marginTop: "20px", width: "80%" }}>
                <Autocomplete
                  value={data.clinicianLabel}
                  size="small"
                  options={clinicians}
                  getOptionLabel={(option) => option.NAME}
                  onChange={(e, newValue) => {
                    const { ID, NAME } = newValue;
                    setData({ ...data, clinicians: ID, clinicianLabel: getStringValue(ID, clinicians, 'ID', 'NAME') });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select a clinician"
                      variant="outlined"
                    />
                  )}
                />
              </div>
            )}
            <div style={{ width: "80%", marginTop: "20px" }}>
              <FormControl size="small" sx={{ width: "100%" }}>
                <InputLabel>payment mode</InputLabel>
                <Select
                  value={data.paymentmode}
                  onChange={(e) => {
                    setData({ ...data, paymentmode: e.target.value });
                  }}
                >
                  {
                    paymentmode.length > 0 && paymentmode.map((item, index) => {
                      return (<MenuItem key={index} value={item.KeyID}>{item.PaymentMode}</MenuItem>)
                    })
                  }
                </Select>
              </FormControl>
            </div>
            <div>
              <FormControl>
                <FormLabel id="demo-radio-buttons-group-label">
                  urgency
                </FormLabel>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue="none"
                  name="radio-buttons-group"
                  onChange={(e) =>
                    setData({ ...data, urgency: e.target.value })
                  }
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start !important",
                    flexDirection: "row !important",
                  }}
                >
                  <FormControlLabel
                    value="none"
                    control={<Radio />}
                    label="none"
                  />
                  <FormControlLabel
                    value="moderate"
                    control={<Radio />}
                    label="moderate"
                  />
                  <FormControlLabel
                    value="emmergency"
                    control={<Radio />}
                    label="emmergency report"
                  />
                </RadioGroup>
              </FormControl>
            </div>
            <div style={{ width: "80%", marginTop: "20px" }}>
              <Autocomplete
                value={data.samplingCenterLabel}
                size="small"
                options={branch}
                getOptionLabel={(option) => option.NAME}
                onChange={(e, newValue) => {
                  const { NAME, BRANCHID } = newValue;
                  setData({ ...data, samplingCenter: BRANCHID, samplingCenterLabel: getStringValue(BRANCHID, branch, 'BRANCHID', 'NAME') });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select a sampling center"
                    variant="outlined"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div style={{ width: "40vw" }}>
          <TESTCART
            testArray={testArray}
            handleRemove={handleRemove}
            emptytestcart={emptytestcart}
            outstanding={data.cost}
          />

          <div style={{ display: "flex", justifyContet: "flex-start" }}>
            <TextField
              onChange={(e) => setData({ ...data, paid: e.target.value })}
              value={data.paid}
              disabled={
                testArray.length == 0 || data.paymentmode == "invoice"
                  ? true
                  : false
              }
              sx={{ mt: 5, mr: 3 }}
              label="amount paid"
              size="small"
              type="number"
            ></TextField>
            <TextField
              value={data.discount}
              onChange={(e) => setData({ ...data, discount: e.target.value })}
              disabled={
                testArray.length == 0 || data.paymentmode == "invoice"
                  ? true
                  : false
              }
              sx={{ mt: 5 }}
              label="discount"
              type="number"
              size="small"
            />
            <Button
              type="button"
              color="success"
              onClick={(e) => {
                handleSubmit(e);
              }}
              variant="contained"
              sx={{ mt: 5, ml: 2, borderRadius: 0 }}
              endIcon={
                testArray.length == 0 ? (
                  <CancelScheduleSendIcon />
                ) : (
                  <SendIcon />
                )
              }
              disabled={
                testArray.length == 0 || !data.paymentmode ? true : false
              }
            >
              proceed
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}


Billing.getLayout = function (page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <SidebarFrontPage />
        </div>
        <div className="main" id='page-main-view'>{page}</div>
      </div>
    </>
  );
};
