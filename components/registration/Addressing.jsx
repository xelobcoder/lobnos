import { useState, useEffect } from "react";
import Select from 'react-select';
import { getDataAndUpdateState, submitFormData } from "../Auth/customFetch";
import IsRenderInput from "./CustomInput";
import { africanCountries, ghanaDistricts } from "./fields/Util";

const countryOptions = Object.entries(africanCountries).map(([name, { code }]) => ({
  value: code,
  label: name
}));


const defaultCountryCode = africanCountries["Ghana"].code;

export default function Addressing({ defaultData, fields, patientid, toast }) {
  const [data, setData] = useState({
    ...defaultData,
    country: defaultCountryCode, 
  });
  const [isloading, setLoading] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [countryOptionsState, setCountryOptionsState] = useState(countryOptions);

  const clearForm = () => {
    setData({
      ...defaultData,
      country: defaultCountryCode, 
    });
    setDistrictOptions([]);
    setRegionOptions([]);
    setCountryOptionsState(countryOptions);
  };

  useEffect(() => {
    if (patientid) {
      getDataAndUpdateState(setData, `register/addressingformation?patientid=${patientid}`, false, setLoading);
    } else {
      clearForm();
    }
  }, [patientid]);

  useEffect(() => {
    // Convert regions to react-select options
    const regionOpts = Object.keys(ghanaDistricts).map(region => ({
      value: region,
      label: region
    }));
    setRegionOptions(regionOpts);
  }, []);

  useEffect(() => {
    if (data.country) {
      if (data.country === defaultCountryCode) {
        if (ghanaDistricts[data.region]) {
          const districtOpts = Object.entries(ghanaDistricts[data.region]).map(([code, { name }]) => ({
            value: code,
            label: name
          }));
          setDistrictOptions(districtOpts);
        } else {
          setDistrictOptions([]);
        }
      }
    }
  }, [data.region, data.country]);

  // Custom styles for react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      height: '35px',
      borderRadius: '4px',
      border: state.isFocused ? '2px solid lightblue' : provided.border,
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(173, 216, 230, 0.25)' : provided.boxShadow,
      fontSize: '14px !important',
      paddingLeft: '10px',
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '40px',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0',
    }),
    placeholder: (provided) => ({
      ...provided,
      margin: '0',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '40px',
    }),
  };

  return (
    <>
      <section className="col-6">
        {isloading && <div>Loading data.........................</div>}
        <div>
          <div className="form-row">
            <IsRenderInput
              value={fields.country}
              displaylabel={true}
              label="Country"
              field={
                <Select
                  isDisabled={isloading}
                  options={countryOptionsState}
                  value={countryOptionsState.find(option => option.value === data.country)}
                  onChange={(option) => {
                    setData({
                      ...data,
                      country: option ? option.value : '',
                      region: '', 
                      districtCode: '', 
                      districtName: '' 
                    });
                  }}
                  styles={customStyles}
                />
              }
            />
          </div>
          <div className="form-row">
            <IsRenderInput
              value={fields.region}
              displaylabel={true}
              label="Region"
              field={
                <Select
                  isDisabled={isloading || !data.country} 
                  options={regionOptions}
                  value={regionOptions.find(option => option.value === data.region)}
                  onChange={(option) => {
                    setData({
                      ...data,
                      region: option ? option.value : '',
                      districtCode: '', 
                      districtName: '' 
                    });
                  }}
                  styles={customStyles}
                />
              }
            />
          </div>
          <div className="form-row">
            <IsRenderInput
              value={fields.district}
              displaylabel={true}
              label="District"
              field={
                <Select
                  isDisabled={isloading || !data.region} 
                  options={districtOptions}
                  value={districtOptions.find(option => option.value === data.districtCode)}
                  onChange={(option) => {
                    setData({
                      ...data,
                      districtCode: option ? option.value : '', 
                      districtName: option ? option.label : '' 
                    });
                  }}
                  styles={customStyles}
                />
              }
            />
          </div>
          <div className="form-row">
            <IsRenderInput
              value={fields.area}
              displaylabel={true}
              label="Area"
              field={
                <input
                  disabled={isloading}
                  className="custom-input"
                  value={data.area}
                  onChange={(e) =>
                    setData({
                      ...data,
                      area: e.target.value,
                    })
                  }
                  placeholder="Area"
                  type="text"
                />
              }
            />
          </div>

          <div className="form-row">
            <IsRenderInput
              value={fields.gpsLocation}
              displaylabel={true}
              label="GPS Location or Landmark"
              field={
                <input
                  disabled={isloading}
                  className="custom-input"
                  value={data.gpsLocation}
                  onChange={(e) =>
                    setData({
                      ...data,
                      gpsLocation: e.target.value,
                    })
                  }
                  placeholder="GPS Location"
                  type="text"
                />
              }
            />
          </div>
          <div className="form-row">
            <IsRenderInput
              value={fields.address}
              displaylabel={true}
              label="Address"
              field={
                <textarea
                  disabled={isloading}
                  id="address"
                  className="form-control"
                  name="address"
                  rows={5}
                  value={data.address}
                  onChange={(e) => {
                    setData({ ...data, address: e.target.value });
                  }}
                ></textarea>
              }
            />
          </div>
        </div>
        <button
          onClick={(ev) => {
            submitFormData(`register/addressinginformation?patientid=${patientid}`, data, toast);
          }}
          className="btn mt-3 btn-success btn-sm text-capitalize"
        >
          Save current progress
        </button>
      </section>
    </>
  );
}
