import { useState, useEffect } from "react";
import Select from 'react-select';
import { getDataAndUpdateState } from "../Auth/customFetch";
import RenderInput from "./CustomInput";
import { ghanaDistricts } from "./fields/Util";
import { submitFormData } from "../Auth/registerclient";

export default function Addressing({ defaultData, fields, patientid, toast }) {
  const [data, setData] = useState({
    ...defaultData,
    region: '',
    districtCode: '',
    districtName: ''
  });

  const [isloading, setLoading] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);

  const clearForm = () => {
    setData({
      ...defaultData,
      region: '',
      districtCode: '',
      districtName: ''
    });
    setDistrictOptions([]);
    setRegionOptions([]);
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
    if (data.region && ghanaDistricts[data.region]) {
      const districtOpts = Object.entries(ghanaDistricts[data.region]).map(([code, { name }]) => ({
        value: code,
        label: name
      }));
      setDistrictOptions(districtOpts);
    } else {
      setDistrictOptions([]);
    }
  }, [data.region]);

  // Custom styles for react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '30px',
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
      fontSize: '14px !important'
    }),
    input: (provided) => ({
      ...provided,
      margin: '0',
      fontSize: '14px !important'
    }),
    placeholder: (provided) => ({
      ...provided,
      margin: '0',
      fontSize: '14px !important'
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '30px',
    }),
  };

  // Find the selected district option
  const selectedDistrict = districtOptions.find(option => option.value === data.districtCode);

  return (
    <>
      <section className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
        {isloading && <div>Loading data.........................</div>}
        <div>
          <div className="form-row">
            <RenderInput
              visible={fields.region.visible}
              value={fields.region}
              displaylabel={true}
              label="Region"
              field={
                <Select
                  isDisabled={isloading}
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
            <RenderInput
              visible={fields.district.visible}
              value={fields.district}
              displaylabel={true}
              label="District"
              field={
                <Select
                  isDisabled={isloading || !data.region}
                  options={districtOptions}
                  value={selectedDistrict}
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
            <RenderInput
              visible={fields.area.visible}
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
            <RenderInput
              visible={fields.gpsLocation.visible}
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
            <RenderInput
              visible={fields.address.visible}
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
          disabled={!patientid}
          onClick={() => {
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
