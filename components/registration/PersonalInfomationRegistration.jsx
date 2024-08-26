import { Form } from "react-bootstrap";
import { handleMobile, handleEmail, handleAgeCalculations, handleSubmitRegistration } from "../Auth/registerclient";
import RenderInput from "./CustomInput";
import { useState, useEffect } from "react";
import { getDataAndUpdateState } from "../Auth/customFetch";
import { designation } from "./fields/Util";

export default function PersonalInformationRegistration(
  { defaultData, fields, toast, patientid, redirect = true }) {
  const [data, setData] = useState(defaultData);
  const [isloading, setLoading] = useState(false);

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
      {isloading && <div>Loading data ............................</div>}
      <form autoComplete="off" className="grid-50" noValidate autoCorrect="false" >
        <div className="_registration_form_split">
          <div>
            <RenderInput
              visible={fields.designation.visible}
            label={'Designation'}
              tabIndex={1}
              value={fields['designation']}
              field={
                <select value={data.designation} className="custom-select col-3" onChange={(e) => {
                  setData({ ...data, designation: e.target.value });
                }}>
                  {designation.map((item,index) => <option key={index}>{item}</option>)}
                </select>
              }
            />
          </div>
          <div>
            <RenderInput
              visible={fields.firstname.visible}
              tabIndex={1}
              label={"first name"}
              value={fields["firstname"]}
              field={
                <input
                  disabled={isloading}
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
            <RenderInput
              value={fields["lastname"]}
              visible={fields.lastname.visible}
              label={"last name"}
              field={
                <input
                  disabled={isloading}
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
            <RenderInput
              label="middle name"
              visible={fields.middlename.visible}
              value={fields["middlename"]}
              field={
                <input
                  disabled={isloading}
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
              <RenderInput
                visible={fields.days.visible && fields.months.visible && fields.years.visible}
                value={fields["days"]}
                label={'Date Of Birth'}
                field={
                  <div className="d-flex">
                    <input
                      disabled={isloading}
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
                      disabled={isloading}
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
                      disabled={isloading}
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
            <RenderInput
              value={fields["age"]}
              visible={fields.age.visible && fields.ageType.visible}
              label={"age"}
              field={
                <div className="d-flex ">
                  <input
                    disabled={isloading}
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
              <RenderInput
                visible={fields.gender.visible}
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
            <RenderInput
              value={fields["mobile"]}
              visible={fields.mobile.visible}
              label={"mobile number"}
              field={
                <div className="d-flex">
                  <input
                    disabled={isloading}
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
                    disabled={isloading}
                    type="tel"
                    inputMode="tel"
                    maxLength={10}
                    minLength={10}
                    value={data.whatAppcontact || data.whatappcontact}
                    name="whatAppcontact"
                    className="custom-input"
                    placeholder="whatApp contact"
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
            <RenderInput
              value={fields["email"]}
              visible={fields.email.visible}
              label="email"
              field={
                <input
                  disabled={isloading}
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
            <RenderInput
              visible={fields.occupation.visible}
              value={fields["occupation"]}
              label="occupation"
              field={
                <input
                  disabled={isloading}
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
            <RenderInput
              visible={fields.patientOrganization.visible}
              value={fields["patientOrganization"]}
              label={"organization"}
              field={
                <input
                  disabled={isloading}
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
            <RenderInput
              visible={fields.maritalstatus.visible}
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
