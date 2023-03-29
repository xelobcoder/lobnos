import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import {
  Autocomplete,
  FormLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  TextField,
  MenuItem,
  Box,
  Container,
  FormControl,
  Select,
  InputLabel,
  Typography,
} from "@mui/material";
import TESTCART from "../../components/registration/testCart";
import CancelScheduleSendIcon from "@mui/icons-material/CancelScheduleSend";
import SendIcon from "@mui/icons-material/Send";
import AddBoxIcon from "@mui/icons-material/AddBox";

export default function Billing({
  allpanels,
  organization,
  clinicians,
  branch,
}) {
  const router = useRouter().query.patientid;
  const navigate = useRouter();
  const [testoptions, setTestoptions] = useState(allpanels);
  const [message, setMessage] = useState("");
  const [data, setData] = useState({
    organizations: null,
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

  const [outstanding, setOutstanding] = useState(data.cost - data.paid);

  const [selected, setSelected] = useState(null);
  const [testArray, setTestArray] = useState([]);

  const getOrgOptions = organization.map((item, index) => {
    return item.NAME;
  });

  const getCliOptions = clinicians.map((item, index) => {
    return item.NAME;
  });

  const getSamOptions = branch.map((item, index) => {
    return item.NAME;
  });

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
      setData({ ...data, test: [...data.test, selected.NAME] });
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

  const handleSubmit = (e) => {
    //    send data to server using fecth
    e.preventDefault();
    let pushData = async function () {
      let endpoint = await fetch(`${process.env.BASEURL}/billing`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });
      let response = await endpoint.json();
      return response;
    };
    pushData()
      .then((response) => {
        if (response.message == "success") {
          setMessage(" test added to performing test table");
          // empty cart
          emptytestcart();
          // empty data
          setData({
            organizations: null,
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
          // empty selected
          setSelected(null);

          setTimeout(() => {
            navigate.push("/activation");
          }, 2000);
        }
      })
      .catch((error) => {
        throw error;
      });
  };

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
            <div style={{ marginTop: "20px", width: "80%" }}>
              <Autocomplete
                value={data.organizations}
                size="small"
                options={getOrgOptions.map((option) => option)}
                getOptionLabel={(option) => option}
                onChange={(e, newValue) => {
                  setData({ ...data, organizations: newValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select a organization"
                    variant="outlined"
                  />
                )}
              />
            </div>
            {/* same autocomplete for clinicians */}
            <div style={{ marginTop: "20px", width: "80%" }}>
              <Autocomplete
                value={data.clinicians}
                size="small"
                options={getCliOptions.map((option) => option)}
                getOptionLabel={(option) => option}
                onChange={(e, newValue) => {
                  setData({ ...data, clinicians: newValue });
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
            <div style={{ width: "80%", marginTop: "20px" }}>
              <FormControl size="small" sx={{ width: "100%" }}>
                <InputLabel>payment mode</InputLabel>
                <Select
                  value={data.paymentmode}
                  onChange={(e) => {
                    console.log(data);
                    setData({ ...data, paymentmode: e.target.value });
                  }}
                >
                  <MenuItem value="">select payment mode</MenuItem>
                  <MenuItem value="Mobile Money">Mobile Money</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Cheque">Cheque</MenuItem>
                  <MenuItem value="invoice">invoice</MenuItem>
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="Debit Card">Debit Card</MenuItem>
                  <MenuItem value="Visa">Visa</MenuItem>
                  <MenuItem value="MasterCard">MasterCard</MenuItem>
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
                value={data.samplingCenter}
                size="small"
                options={getSamOptions.map((option) => option)}
                getOptionLabel={(option) => option}
                onChange={(e, newValue) => {
                  setData({ ...data, samplingCenter: newValue });
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

export async function getServerSideProps(ctx) {
  // get all test panels
  let endpoint = `${process.env.BASEURL}/testpanel/list`;
  let response = await fetch(endpoint);
  let data = await response.json();
  // get all organizations
  let organizationApi = `${process.env.BASEURL}/organization`;
  let organizationResponse = await fetch(organizationApi);
  let organizationData = await organizationResponse.json();
  // get all clinicians
  let cliniciansApi = `${process.env.BASEURL}/clinicians`;
  let cliniciansResponse = await fetch(cliniciansApi);
  let cliniciansData = await cliniciansResponse.json();
  // get all branch
  let branchApi = `${process.env.BASEURL}/center`;
  let branchResponse = await fetch(branchApi);
  let branchData = await branchResponse.json();

  return {
    props: {
      allpanels: data,
      organization: organizationData,
      clinicians: cliniciansData,
      branch: branchData,
    },
  };
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
