import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";
import React, { useEffect, useState, useMemo } from "react";
import { customFetch } from "../../components/Auth/customFetch";
import { useRouter } from "next/router";
import { handleAge, patientRegistrationDefaultData, handleSubmitRegistration } from "../../components/Auth/registerclient";
import { Button, Box } from "@mui/material";
import Addressing from "../../components/registration/Addressing";
import PersonalInfomationRegistration from "../../components/registration/PersonalInfomationRegistration";
import EmmergencyContactInformation from "../../components/registration/EmmergencyContactInformation";
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import styled from "@emotion/styled";



export default function Registration({ organization, clinician }) {
  // state for handlinf whether the other informationsuch as  addressing ,emmergency contact and others are shown
  const [detailRegistration, setDetailRegistration] = useState(false);
  const [error, setError] = useState(false)

  const [data, setData] = useState(patientRegistrationDefaultData);

  const [disable, setDisable] = useState(false);


  useEffect(() => {
    const getRegistratonSettings = async function () {
      const response = await customFetch("register/registration/settings");
      const { status, statusCode, message, bulkRegistration } = response;
      if (statusCode == 200 && status == "success") {
        setDetailRegistration(bulkRegistration);
      }
    }
    getRegistratonSettings();
  }, []);

  // calculate age based on the provided date of birth

  useEffect(() => {
    const CalculateAge = (e) => {
      // grap data from age calculator
      const personalParams = data.personalInformation;
      let agecalulation = handleAge(personalParams.years, personalParams.months, personalParams.days);
      // if age calculor contains values
      if (agecalulation) {
        const { years, months, days } = agecalulation;
        if (years == 0 && months == 0 && days == 0) {
          if (data.days > new Date().getDate()) {
            setError(
              "Please kindly recheck date values entered, Error at day value!!!"
            );
            setData({ ...data, personalInformation: { ...personalParams, age: 0, ageType: "days" } });
          } else {
            setError("Todays Delivering ?");
            setData({ ...data, personalInformation: { ...personalParams, age: days, ageType: "days" } });
          }
        }
        if (years != 0) {
          setError("");
          setData({ ...data, personalInformation: { ...personalParams, age: years, ageType: "years" } });
        }

        if (years == 0 && months != 0) {
          setError("");
          setData({
            ...data, personalInformation: {
              ...personalParams,
              age: months, ageType: "months"
            }
          });
        }

        if (years == 0 && months == 0 && days > 0) {
          setError("");
          setData({
            ...data, personalInformation: {
              ...personalParams,
              age: days, ageType: "days"
            }
          });
        }
      }
      // if invalid date is returned after analyisis,
      // update fields to suit

      if (agecalulation == "invalid Date") {
        setError("Invalid Date entered");
        setData({
          ...data,
          personalInformation: {
            ...personalParams,
            age: 0,
            days: 0,
            months: 0,
            years: 0,
            ageType: "",
          }
        });
      }
    };

    CalculateAge();
  }, [data.personalInformation.years, data.personalInformation.age, data.personalInformation.ageType]);

  //   for updating field forms using client id
  const clientID = useRouter().query.patientid;

  useMemo(() => {
    if (clientID) {
      // fetch data of client with such patientid
      const getpatient_info = async function () {
        return await customFetch(`register?patientid=${clientID}`);
      };

      getpatient_info()
        .then((item) => {
          let data = item[0];
          // split full name into first and last name
          setData({
            patientid: data.PATIENTID,
            patienttype: data.PATIENTTYPE,
            relationship: data.RELATIONSHIP,
            emmergencyName: data.EMMERGENCY_CONTACT,
            emmergencyContactNumber: data.EMMERGENCY_CONTACT_NAME,
            age: data.AGE,
            ageType: data.AGETYPE,
            patientOrganization: data.PATIENTORGANIZATION || "",
            occupation: data.OCCUPATION || "",
            mobile: data.MOBILE_NUMBER,
            email: data.EMAIL,
            days: data.DOB.split("-")[2].slice(0, 2),
            months: data.DOB.split("-")[1].slice(0, 2),
            years: data.DOB.split("-")[0],
            maritalstatus: data.MARITAL_STATUS,
            gender: data.GENDER,
            firstname: data.FIRSTNAME,
            lastname: data.LASTNAME,
            middlename: data.MIDDLENAME,
            area: data.AREA,
            region: data.REGION,
            address: data.ADDRESS
          });
          // disable the patient field, hence prevent editing the unique id
          patientIdRef.current = true;
          // toggle it
          patientIdRef.current == true ? setDisable(!disable) : null;
          // set the title of the form to reflect the client's name
          setTitle(data.FULLNAME);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [clientID]);



  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
      <div className={`mx-2 my-2 bg-white p-2`} >
            <h5 className="text-capitalize mx-3 text-primary">
              register a new client
            </h5>
            <PersonalInfomationRegistration minify={true} setData={setData} data={data} setError={setError} />
            {detailRegistration && (
              <div>
                <Addressing setData={setData} data={data} />
                <EmmergencyContactInformation setData={setData} data={data} />
              </div>)
            }
          </div>
          <button
            type="button"
            className="btn btn-primary text-capitalize mx-2"
            tabIndex={31}
            onClick={(e) => {
              const typer = clientID === undefined || clientID === null ? 'POST' : 'PUT';
              handleSubmitRegistration(e, data, typer, setData);
            }}
          >
            save new record
          </button>
      </SettingsLayout>
    </>
  );
}

