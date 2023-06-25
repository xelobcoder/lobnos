import React, { useEffect, useState } from "react";
import { customFetch, handleChange, validateFormData } from "../components/Auth/customFetch";
import TableDisplay from '../components/accessories/TableDisplay';
import { IconButton, Typography } from "@mui/material";
import { BarChart, DeleteForeverOutlined, MedicalInformation, Money, Visibility } from "@mui/icons-material";
import BasicInformationClinician from '../components/Clinicians/BasicInformationClinician';
import PaymentModuleClinician from "../components/Clinicians/PaymentModule";

export default function Clinicians() {
  // this set the clinician id for updating payment infor
  const [selectedClinician, setSelectedClinician] = useState(null);

  const defaultData = {
    name: "",
    phone: "",
    email: "",
    website: "",
    organization: "",
    location: "",
    address: "",
    occupation: "",
    module: '',
    commission: '',
    momo: '',
    bankName: '',
    accountName: '',
    branch: '',
    account: '',
  };
  const [ClinicianList, setClinician] = useState([]);

  const [data, setData] = useState(defaultData);

  useEffect(() => {
    async function getClinicians() {
      try {
        const response = await customFetch(`clinicians`);
        setClinician(response);
      } catch (err) {
        console.log(err);
      }
    }

    getClinicians();
  }, []);

  const columns = [
    {
      Header: 'Name',
      accessor: 'NAME'
    },
    {
      Header: 'Email',
      accessor: 'EMAIL'
    },
    {
      Header: 'Contact',
      accessor: 'CONTACT'
    },
    {
      Header: 'location',
      accessor: 'LOCATION'
    },
    {
      Header: 'Occupation',
      accessor: 'OCCUPATION'
    },
    {
      Header: 'Address',
      accessor: 'ADDRESS'
    },
    {
      Header: 'Actions',
      accessor: '',
      Cell: ({ row }) => {
        const { original } = row;
        return <div>
          <IconButton size="small">
            <Visibility sx={{ color: 'green' }} />
          </IconButton>
          <IconButton size="small">
            <DeleteForeverOutlined sx={{ color: 'red' }} />
          </IconButton>
        </div>
      }
    }
  ]

  const handleChange = (event, target) => {
    const { value } = event.target;
    setData({ ...data, [target]: value })
  }

  const handleSubmit = async () => {

    const responseCallback = (response) => {
      if (response.status === 200) {
        setClinician([...ClinicianList, response.data])
        setData(defaultData)
      }
    }

    await validateFormData(data, false, ['name', 'phone', 'email', 'location', 'address', 'occupation', 'module', 'commission'], 'clinicians', responseCallback)
  }


  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "25% auto",
          gridGap: "10px",
          padding: "10px",
        }}
      >
        <div className="card p-2" style={{ borderRadius: '10px' }}>
          <div className="card-header">
            <div className="top-clinician-view">
              <div className="icon-children">
                <div className="icon">
                  <MedicalInformation />
                </div>
                <div className="text">basic information</div>
              </div>
              <div className="icon-children">
                <div className="icon">
                  <BarChart />
                </div>
                <div className="text">chart</div>
              </div>
            </div>
          </div>
          <div className="card-body">
            <Typography variant="h5" className="add-clinician-text" >Add clinician</Typography>
            <BasicInformationClinician data={data} handleChange={handleChange} />
            <PaymentModuleClinician data={data} handleSubmit={handleSubmit} handleChange={handleChange} />
          </div>
        </div>
        <div>
          <TableDisplay
            styling={"excel-table"}
            column={columns}
            data={ClinicianList}
            filtering={true}
          />
        </div>
      </div>
    </>
  );
}
