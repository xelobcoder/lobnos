import React, { useState } from "react";
import { Form } from "react-bootstrap";
import DeviceInterfaceMappingModal from "./DeviceInterfaceMappingModal";

const BasicInfoForm = ({
  data,
  handleChangeWithState,
  handleSampleTypeChange,
  FieldDisabledDueNone,
  category,
  sampleType,
  setTestData,
  sampleContainers,
}) => {
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  const [deviceMappingValue, setDeviceMappingValue] = useState(
    data.deviceInterfaceMapping
      ? typeof data.deviceInterfaceMapping === "string"
        ? data.deviceInterfaceMapping
        : JSON.stringify(data.deviceInterfaceMapping)
      : "",
  );

  const handleDeviceMappingSave = (jsonString) => {
    // If jsonString is present, use it, else use deviceMappingValue
    const valueToSave =
      jsonString !== undefined ? jsonString : deviceMappingValue;
    handleChangeWithState(
      { target: { value: valueToSave } },
      "deviceInterfaceMapping",
      setTestData,
      data,
    );
    setShowDeviceModal(false);
  };

  return (
    <>
      <h5>Basic </h5>
      <hr />
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Test Name</label>
        <input
          type="text"
          className="custom-input"
          value={data.name || ""}
          onChange={(ev) =>
            handleChangeWithState(ev, "name", setTestData, data)
          }
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Category</label>
        <select
          required
          className="custom-select"
          value={data.category}
          onChange={(ev) =>
            handleChangeWithState(ev, "category", setTestData, data)
          }
        >
          <option value="">Select a category</option>
          {category.map((a, i) => (
            <option key={i} value={a.id}>
              {a.department}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Sample Type</label>
        <select
          required
          className="custom-select"
          value={data.sample}
          onChange={handleSampleTypeChange}
        >
          <option value="">Select a sample type</option>
          {sampleType.map((b, index) => (
            <option value={b.id} key={index}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Sample Container</label>
        <select
          disabled={FieldDisabledDueNone}
          onChange={(ev) =>
            handleChangeWithState(ev, "sample_container", setTestData, data)
          }
          className="custom-select"
          value={data.sample_container}
        >
          <option value="">Select a container</option>
          {sampleContainers.map((container) => (
            <option key={container.id} value={container.id}>
              {container.name} ({container.volume_capacity}ml)
            </option>
          ))}
        </select>
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Unit</label>
        <input
          onChange={(ev) =>
            handleChangeWithState(ev, "unit", setTestData, data)
          }
          type="text"
          disabled={FieldDisabledDueNone}
          className="custom-input"
          value={data.unit}
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Sample Quantity</label>
        <input
          disabled={FieldDisabledDueNone}
          onChange={(ev) =>
            handleChangeWithState(ev, "qty_required", setTestData, data)
          }
          type="number"
          className="custom-input"
          value={data.qty_required}
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Short Text</label>
        <input
          type="text"
          value={data.shorttext}
          onChange={(ev) =>
            handleChangeWithState(ev, "shorttext", setTestData, data)
          }
          className="custom-input"
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Cost of Test</label>
        <input
          type="number"
          onChange={(ev) =>
            handleChangeWithState(ev, "testcost", setTestData, data)
          }
          className="custom-input"
          value={data.testcost}
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Test Price</label>
        <input
          type="number"
          onChange={(ev) =>
            handleChangeWithState(ev, "testprice", setTestData, data)
          }
          className="custom-input"
          value={data.testprice}
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Report Title</label>
        <input
          type="text"
          className="custom-input"
          value={data.reportitle || ""}
          onChange={(ev) =>
            handleChangeWithState(ev, "reportitle", setTestData, data)
          }
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Method</label>
        <input
          type="text"
          className="custom-input"
          value={data.method || ""}
          onChange={(ev) =>
            handleChangeWithState(ev, "method", setTestData, data)
          }
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Instrumentation</label>
        <input
          type="text"
          className="custom-input"
          value={data.instrumentation || ""}
          onChange={(ev) =>
            handleChangeWithState(ev, "instrumentation", setTestData, data)
          }
        />
      </div>
      <div className="form-row grid-reg mt-2">
        <label className="pls-label">Device Interface Mapping</label>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => {
            setDeviceMappingValue(data.deviceInterfaceMapping || "");
            setShowDeviceModal(true);
          }}
        >
          {data.deviceInterfaceMapping ? "Edit Mapping" : "Add Mapping"}
        </button>
        {data.deviceInterfaceMapping && (
          <div
            className="mt-1 text-muted"
            style={{ fontSize: 13, wordBreak: "break-all" }}
          >
            {data.deviceInterfaceMapping}
          </div>
        )}
        <DeviceInterfaceMappingModal
          show={showDeviceModal}
          value={deviceMappingValue}
          onChange={setDeviceMappingValue}
          onClose={() => setShowDeviceModal(false)}
          testid={data.testid}
          onSave={handleDeviceMappingSave}
        />
      </div>
      <hr />
      <h5>Description</h5>
      <div className="form-row mt-2">
        <Form.Control
          as="textarea"
          rows={5}
          onChange={(ev) =>
            handleChangeWithState(ev, "description", setTestData, data)
          }
          value={data.description}
          placeholder="Type test description here"
        />
      </div>
    </>
  );
};

export default BasicInfoForm;
