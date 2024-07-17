import React, { useEffect, useState } from "react";
import { customPost, getSampleTypeList } from "../../../components/Auth/customFetch";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import TableDisplay from '../../../components/accessories/TableDisplay'
export default function Sampletypes() {
  const [sampletype, setSample] = useState("");
  const [source, setSource] = useState([]);

  const addList = async function () {
    if (sampletype) {
      const postRequest = await customPost("sampletype", "POST", { name: sampletype });
      const { statusCode, status, message } = postRequest;
      if (statusCode == 201 && status == "success") {
        alert(message);
        getSampleTypeList(setSource);
      }
    }
  };

  const deleteSpecific = async function (id) {
    const deleteItem = await customPost(`sampletype?id=${id}`, "DELETE", {});
    const { message, statusCode, status } = deleteItem;
    if (statusCode == 200 && status == "success") {
      alert(message);
      getSampleTypeList(setSource);
    }
  };

 const  columns = [
    {
      Header: "Sample Type",
      accessor: "name",
    },
    {
      Header: "Action",
      accessor: "id",
      Cell: ({ value }) => (
        <button onClick={() => deleteSpecific(value)} className="btn btn-danger btn-sm">
          Delete
        </button>
      ),
    },
  ];

  useEffect(() => {
    getSampleTypeList(setSource);
  }, []);

  return (
    <>
      <MainSettingsLayoutView>
        <div className="d-flex">
          <div className="col-8">
            <input className="custom-input" onChange={(e) => setSample(e.target.value)} value={sampletype} placeholder="Add sample type" />
          </div>
          <div className="col-3 mx-2">
            <button onClick={addList} className="btn btn-success">
              add sample
            </button>
          </div>
        </div>
        <TableDisplay column={columns} data={source} />
      </MainSettingsLayoutView>
    </>
  );
}
