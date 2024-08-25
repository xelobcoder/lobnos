import { Form } from "react-bootstrap"
import { handleMobile, handleEmail, handleAgeCalculations, handleSubmitRegistration } from "../Auth/registerclient"
import IsRenderInput from "./CustomInput"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation";
import { getDataAndUpdateState } from "../Auth/customFetch";

export default function PersonalInformationRegistration(
  { defaultData, fields, toast, redirect = true }) {
  const [data, setData] = useState(defaultData);
  const [isloading, setLoading] = useState(true);
  const patientid = useSearchParams().get('patientid');

  const clearForm = () => {
    setData(defaultData);
  };

  useEffect(() => {
    if (patientid) {
      getDataAndUpdateState(setData, `register/personalinformation?patientid=${patientid}`, false, setLoading)
    } else {
      clearForm();
    }
  }, [patientid])


  return (
    <section>
      <form autoComplete="off" className="grid-50" noValidate autoCorrect="false" >
        <div className="_registration_form_split">
          <div>
            <IsRenderInput
              tabIndex={1}
              label={"first name"}
              value={fields["firstname"]}
              field={
                <input
                  onChange={(e) => {
                    setData({ ...data, firstname: e.target.value });
                  }}
                  placeholder="First Name"
                  className="custom-input "
                  value={data.firstname}
                  type="text"
                  size="small"
                  required
                />
              }
            />
            <IsRenderInput
              value={fields["lastname"]}
              label={"last name"}
              field={
                <input
                  className="custom-input "
                  type="text"
                  label="lastname"
                  placeholder="Last Name"
                  required
                  value={data.lastname}
                  onChange={(e) => {
                    setData({ ...data, lastname: e.target.value });
                  }}
                />
              }
            />
            <IsRenderInput
              label="middle name"
              value={fields["middlename"]}
              field={
                <input
                  className="custom-input "
                  placeholder="Middle Name"
                  type="text"
                  value={data.middlename}
                  onChange={(e) => {
                    setData({ ...data, middlename: e.target.value });
                  }}
                />
              }
            />
          </div>
          <div >
            <div >
              <IsRenderInput
                value={fields["days"]}
                label={'Date Of Birth'}
                field={
                  <div className="d-flex">
                    <input
                      className="custom-input"
                      min={1}
                      max={31}
                      maxLength={2}
                      type="number"
                      value={data.days}
                      placeholder="Days"
                      onChange={(e) => {
                        setData({ ...data, days: e.target.value });
                      }}
                      label="Day"
                    />  <input
                      className="custom-input mx-2"
                      label="Months"
                      min={1}
                      max={12}
                      type="number"
                      placeholder="Months"
                      name="months"
                      value={data.months}
                      onChange={(e) => {
                        setData({ ...data, months: e.target.value });
                      }}
                    />   <input
                      className="custom-input"
                      label="Years"
                      min={1900}
                      max={new Date().getFullYear()}
                      type="number"
                      name="years"
                      onBlur={(ev) => {
                        handleAgeCalculations(data, setData, toast);
                      }}
                      value={data.years}
                      onChange={(e) => {
                        setData({ ...data, years: e.target.value });
                      }}
                      placeholder="Years"
                    />
                  </div>
                }
              />
            </div>
          </div>
          <div >
            <IsRenderInput
              value={fields["age"]}
              label={"age"}
              field={
                <div className="d-flex ">
                  <input
                    value={data.age}
                    onChange={(e) => setData({ ...data, age: e.target.value })}
                    type="number"
                    min={0}
                    max={150}
                    className="custom-input "
                    placeholder="Age"
                  />
                  <select className="custom-select" onChange={(e) => setData({ ...data, ageType: e.target.value })} value={data.ageType}>
                    <option>select an option</option>
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              }
            />
            <div className="form-row">
              <IsRenderInput
                value={fields["gender"]}
                label={"gender"}

                field={
                  <div className="d-flex mt-2 ">
                    <Form.Check
                      type="radio"
                      label="Female"
                      name="gender"
                      style={{ marginRight: "20px", fontSize: "20px" }}
                      value="female"
                      checked={data.gender === "female"}
                      onChange={(e) => {
                        setData({
                          ...data,
                          gender: e.target.value,
                        });
                      }}
                    />
                    <Form.Check
                      type="radio"
                      label="Male"
                      name="gender"
                      style={{ fontSize: '20px' }}
                      value="male"
                      checked={data.gender === "male"}
                      onChange={(e) => {
                        setData({
                          ...data,
                          gender: e.target.value,
                        });
                      }}
                    />
                  </div>
                }
              />
            </div>
          </div>

        </div>
        <div className="_registration_form_split">
          <div className="form-row">
            <IsRenderInput
              value={fields["mobile"]}
              label={"mobile number"}
              field={
                <div className="d-flex">
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={10}
                    minLength={10}
                    value={data.mobile}
                    name="mobilenumber"
                    placeholder="mobile contact"
                    className="custom-input"
                    onBlur={(ev) => {
                      handleMobile(ev, toast);
                    }}
                    label="Mobile Number"
                    onChange={(e) => {
                      setData({
                        ...data,
                        mobile: e.target.value,
                      });
                    }}
                  />
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={10}
                    minLength={10}
                    value={data.whatAppcontact}
                    name="whatAppcontact"
                    className="custom-input"
                    placeholder="whatapp contact"
                    onBlur={(ev) => {
                      handleMobile(ev, toast);
                    }}
                    label="whatApp contact"
                    onChange={(e) => {
                      setData({
                        ...data,
                        whatAppcontact: e.target.value,
                      });
                    }}
                  />
                </div>
              }
            />
          </div>
          <div className="form-row">
            <IsRenderInput
              value={fields["email"]}
              label="email"
              field={
                <input
                  size="small"
                  type="email"
                  value={data.email}
                  className="custom-input "
                  name="email"
                  onBlur={(ev) => {
                    handleEmail(ev, setData, data, toast);
                  }}
                  onChange={(e) => {
                    setData({ ...data, email: e.target.value });
                  }}
                  label="Email"
                />
              }
            />
          </div>
          <div className="form-row">
            <IsRenderInput
              value={fields["occupation"]}
              label="occupation"
              field={
                <input
                  type="text"
                  placeholder="Occupation"
                  name="occupation"
                  className="custom-input "
                  value={data.occupation}
                  onChange={(e) => {
                    setData({
                      ...data,
                      occupation: e.target.value,
                    });
                  }}
                />
              }
            />
          </div>
          <div className="form-row">
            <IsRenderInput
              value={fields["patientOrganization"]}
              label={"organization"}
              field={
                <input
                  type="text"
                  placeholder="Patient Organization"
                  name="patientOrganization"
                  className="custom-input h-40"
                  value={data.patientOrganization}
                  onChange={(e) => {
                    setData({
                      ...data,
                      patientOrganization: e.target.value,
                    });
                  }}
                />
              }
            />
          </div>

          <div className="form-row">
            <IsRenderInput
              label={"marital status"}
              value={fields["maritalstatus"]}
              field={
                <div className="d-flex">
                  <Form.Check
                    type="radio"
                    label="Single"
                    name="maritalstatus"
                    style={{ marginRight: "20px", fontSize: '20px' }}
                    value="single"
                    checked={data.maritalstatus === "single"}
                    onChange={(e) => {
                      setData({
                        ...data,
                        maritalstatus: e.target.value,
                      });
                    }}
                  />
                  <Form.Check
                    type="radio"
                    label="Married"
                    name="maritalstatus"
                    style={{ fontSize: '20px' }}
                    value="married"
                    checked={data.maritalstatus === "married"}
                    onChange={(e) => {
                      setData({
                        ...data,
                        maritalstatus: e.target.value,
                      });
                    }}
                  />
                </div>
              }
            />
          </div>
        </div>
        <div>
          <button
            type="button"
            className="btn mt-3 btn-success btn-sm text-capitalize"
            onClick={(e) => {
              const method = patientid ? 'PUT' : 'POST';
              handleSubmitRegistration(e, data, method, toast, clearForm, redirect = patientid ? false : true);
            }}>
            Save current progess
          </button>
        </div>
      </form>
    </section>
  );
}
