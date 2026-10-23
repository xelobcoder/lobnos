import React from "react";
import { Form } from "react-bootstrap";

const ConfigurationsForm = ({ data, handleSwitch, canManageQc }) => {
  return (
    <>
      <h5>Configurations</h5>
      <hr />
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Has Manual</label>
        <Form.Switch
          onChange={(ev) => handleSwitch(ev, "hasManual")}
          checked={data.hasManual === 1}
          type="switch"
          style={{ fontSize: "25px" }}
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Show Trend</label>
        <Form.Switch
          onChange={(ev) => handleSwitch(ev, "showtrend")}
          checked={data.showtrend === 1}
          type="switch"
          style={{ fontSize: "25px" }}
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Has Varied Gender</label>
        <Form.Switch
          checked={data.hasGenderVariation === 1}
          onChange={(ev) => handleSwitch(ev, "hasGenderVariation")}
          type="switch"
          style={{ fontSize: "25px" }}
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Has Children Limit</label>
        <Form.Switch
          checked={data.hasChildrenLimit === 1}
          onChange={(ev) => handleSwitch(ev, "hasChildrenLimit")}
          type="switch"
          style={{ fontSize: "25px" }}
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Outsourced Test</label>
        <Form.Switch
          checked={data.isoutsourced === 1}
          onChange={(ev) => handleSwitch(ev, "isoutsourced")}
          type="switch"
          style={{ fontSize: "25px" }}
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Use Drugs <br /><small className="text-sm text-danger">(For culture and sensitivity test)</small></label>
        <Form.Switch
          checked={data.hasDrugs === 1}
          onChange={(ev) => handleSwitch(ev, "hasDrugs")}
          type="switch"
          style={{ fontSize: "25px" }}
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Use Literature</label>
        <Form.Switch
          checked={data.useLiterature === 1}
          onChange={(ev) => handleSwitch(ev, "useLiterature")}
          type="switch"
          style={{ fontSize: "25px" }}
        />
      </div>
      {canManageQc && (
        <div className="form-row grid-reg mt-2">
          <label className="pls-label">Require QC before result entry</label>
          <Form.Switch
            onChange={(ev) => handleSwitch(ev, "requires_qc")}
            checked={data.requires_qc === 1 || data.requires_qc === true}
            type="switch"
            style={{ fontSize: "25px" }}
          />
        </div>
      )}
      {data.hasManual === 1 && (
        <div className="form-row grid-reg mt-2">
          <label className="pls-label">Procedure Code</label>
          <input
            type="text"
            onChange={(ev) => handleChangeWithState(ev, "procedureCode", setTestData, data)}
            className="custom-input"
            value={data.procedureCode ?? ""}
          />
        </div>
      )}
    </>
  );
};

export default ConfigurationsForm;
