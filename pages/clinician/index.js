import React, { useEffect, useState } from "react";
import { customFetch, customPost, handleChange, validateFormData } from "../../components/Auth/customFetch";
import TableDisplay from '../../components/accessories/TableDisplay';
import { IconButton, Typography } from "@mui/material";
import { BarChart, DeleteForeverOutlined, Edit, MedicalInformation, Money, Visibility } from "@mui/icons-material";
import BasicInformationClinician from '../../components/Clinicians/BasicInformationClinician';
import PaymentModuleClinician from "../../components/Clinicians/PaymentModule";

export default function Clinicians() {
  // this set the clinician id for updating payment infor
  const [selectedClinician, setSelectedClinician] = useState(null);

  const defaultData = {
    name: "",
    phone: "",
    email: "",
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
  const [OrganizationList, setOrganization] = useState([]);

  const [data, setData] = useState(defaultData);

  useEffect(() => {
    // using promises all to fetch all the data at once
    const promises = [
      customFetch('clinicians'),
      customFetch('organization')
    ]
    // get all the response from the promises
    Promise.all(promises).then((response) => {
      const [clinicians, organizations] = response;
      setClinician(clinicians)
      setOrganization(organizations)
    }
    ).catch((error) => console.log(error))

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
      Header: 'location',
      accessor: 'LOCATION'
    },
    {
      Header: 'Commission',
      accessor: 'COMMISSION',
      Cell: ({ row }) => {
        const { original } = row;
        return <div>
          <Typography variant="body2">{original.COMMISSION}%</Typography>
        </div>
      }
    },
    {
      Header: 'Phone',
      accessor: 'PHONE'
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
        return ( <div>
           <IconButton  onClick={() => getClientForEdit(original)}>
            <Edit/>
          </IconButton>
          <IconButton size="small">
            <Visibility sx={{ color: 'green' }} />
          </IconButton>
          <IconButton size="small">
            <DeleteForeverOutlined sx={{ color: 'red' }} onClick={() => handleDelete(original)} />
          </IconButton>
        </div>)
      }
    }
  ]

  const handleChange = (event, target) => {
    const { value } = event.target;
    setData({ ...data, [target]: value })
  }

  const handleDelete = async (original) => {
    // confirm if client want to delete clinician, if yes delete ,if no  cancel and  ignore everything
    let confirmation = confirm('Do want to delete clinician ?')

    if (confirmation) {
      const { ID } = original;
      if (original && ID) {
        try {
          let deletepush = await customPost('clinicians', 'DELETE', { id: ID });
          const { statusCode, status, message } = deletepush;
          if (statusCode == 200 && status == 'success') {
            alert(message);
            // get current list of clinicians
            const getClinicians = await customFetch('clinicians');
            // map data to clinician
            setClinician(getClinicians || [])
          } else {
            alert(message)
          }
        } catch (err) {
          console.log(err)
        }
      }

    }
    return
  }

  const handleSubmit = async () => {

    const responseCallback = (response) => {
      const { statusCode, message } = response;


      if (statusCode === 200 || statusCode === 201) {
        setData(defaultData)
        alert(message);
        customFetch('clinicians').then((response) => {
          setClinician(response)
        }).catch((error) => console.log(error))
      }

      if (statusCode === 401 || statusCode === 400) {
        alert(message)
      }
    }

    await validateFormData(data, false, ['name', 'phone', 'email', 'location', 'address', 'occupation', 'module', 'commission'], 'clinicians', responseCallback)
  }


  const getClientForEdit = (originaldata) => {
    // converting the data to lowercase
    const {
      ACCOUNTNAME,
      ACCOUNTNUMBER,
      ADDRESS,
      BANKBRANCH,
      BANKNAME,
      COMMISSION,
      CONTACT,
      CREATED_ON,
      EMAIL,
      ID,
      LOCATION,
      MODULE,
      MOMO,
      NAME,
      OCCUPATION,
      ORGANIZATION,
      PHONE,
      UPDATE_ON } = originaldata;


    const data = {
      id: ID,
      name: NAME,
      phone: PHONE,
      email: EMAIL,
      organization: ORGANIZATION,
      location: LOCATION,
      address: ADDRESS,
      occupation: OCCUPATION,
      module: MODULE,
      commission: COMMISSION,
      momo: MOMO,
      bankName: BANKNAME,
      accountName: ACCOUNTNAME,
      branch: BANKBRANCH,
      account: ACCOUNTNUMBER
    }
    setData(data)
  }

  const setDefault = () => { setData(defaultData) }


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
        <div className="card p-2" style={{ borderRadius: "10px" }}>
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
            <Typography variant="h5"  onClick={setDefault}>
              <button className="btn btn-dark">
                Add clinician
              </button>
            </Typography>
            <BasicInformationClinician
              data={data}
              organization={OrganizationList}
              stateUpdate={setData}
              handleChange={handleChange}
            />
            <PaymentModuleClinician
              data={data}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
            />
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
