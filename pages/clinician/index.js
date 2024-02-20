import React, { useEffect, useState } from "react";
import { customFetch, customPost, getDataAndUpdateState} from "../../components/Auth/customFetch";
import TableDisplay from '../../components/accessories/TableDisplay';
import {IconButton, Typography } from "@mui/material";
import { DeleteForeverOutlined, Edit,Visibility } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import FrontDeskLayout from "../../components/Layout/FrontDeskLayout";


export default function Clinicians() {
  const [ClinicianList, setClinician] = useState([]);
  const router = useRouter();

  useEffect(() => {
    try {
      getDataAndUpdateState(setClinician, 'clinicians')
    } catch (err) {
      alert(err || 'error connecting to server');
    }
  }, []);

  const ForClientEdit = (originaldata) => {
    // converting the data to lowercase
    const { id } = originaldata;
    if (!id) return;
    router.push(`/clinician/update?clinicianid=${id}`)
  }
  const columns = [
    {
      Header: 'Name',
      accessor: 'name'
    },
    {
      Header: 'Email',
      accessor: 'email'
    },
    {
      Header: 'location',
      accessor: 'location'
    },
    {
      Header: 'Commission rate',
      accessor: 'commission',
      Cell: ({ row }) => {
        const { original } = row;
        return <div>
          <Typography variant="body2">{original?.commission}%</Typography>
        </div>
      }
    },
    {
      Header: 'Phone',
      accessor: 'phone'
    },
    {
      Header: 'Occupation',
      accessor: 'occupation'
    },
    {
      Header: 'Address',
      accessor: 'address'
    },
    {
      Header: 'Actions',
      accessor: '',
      Cell: ({ row }) => {
        const { original } = row;
        return (<div>
          <IconButton onClick={() => ForClientEdit(original)}>
            <Edit />
          </IconButton>
          <IconButton size="small" onClick={(ev) => {router.push('/clinician/clinicianview')}}>
            <Visibility sx={{ color: 'green' }} />
          </IconButton>
          <IconButton size="small">
            <DeleteForeverOutlined sx={{ color: 'red' }} onClick={() => handleDelete(original)} />
          </IconButton>
        </div>)
      }
    }
  ]


  const handleDelete = async (original) => {
    // confirm if client want to delete clinician, if yes delete ,if no  cancel and  ignore everything
    let confirmation = confirm('Do want to delete clinician ?')
    if (!confirmation) return;

    const { id } = original;
    if (!id) return;

    try {
      let deletepush = await customPost('clinicians', 'DELETE', { id });
      const { statusCode, status, message } = deletepush;
      if (statusCode == 200 && status == 'success') {
        toast.success(message,{position:'top-right',autoClose: 1000})
        // get current list of clinicians
        const getClinicians = await customFetch('clinicians');
        // map data to clinician
        setClinician(getClinicians || [])
      } else {
        toast.error(message,{position:'top-right',autoClose: 1000})
      }
    } catch (err) {
      toast.error(err.message || 'error in connecting to server',{position:'top-right',autoClose: 1000})
    }
  }


  return (
    <FrontDeskLayout>
      <ToastContainer />
      <div className="d-flex justify-content-end">
        <button type='button' onClick={ (ev) =>  {router.push('/clinician/new')}} className="btn btn-sm btn-primary fw-bold mx-2 my-1"> add clinician</button>
      </div>
      <div style={{marginTop:'-40px'}}>
      <TableDisplay data={ClinicianList} column={columns} filtering={true}/>
     </div>
    </FrontDeskLayout>
  );
}
