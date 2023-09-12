import React, { useEffect, useState } from "react";
import { customFetch, customPost, getDataAndUpdateState, handleChange, validateFormData } from "../../components/Auth/customFetch";
import TableDisplay from '../../components/accessories/TableDisplay';
import { Avatar, IconButton, Typography } from "@mui/material";
import { Add, AddBox, AddOutlined, DeleteForeverOutlined, Edit, MedicalInformation, Visibility } from "@mui/icons-material";
import { useRouter } from "next/router";
import SideBarMapView from "../../components/Clinicians/SideBarMapView";
import SidebarLayoutMap from "../../components/Clinicians/SidebarLayoutMap";

export default function Clinicians() {
  const [ClinicianList, setClinician] = useState([]);
  const router = useRouter();

  useEffect(() => {
    try {
      getDataAndUpdateState(setClinician, 'clinicians')
    } catch (err) {
      console.log(err)
    }
  }, []);

  const ForClientEdit = (originaldata) => {
    // converting the data to lowercase
    const { ID } = originaldata;
    router.push(`/clinician/update/${ID}`)
  }
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
        return (<div>
          <IconButton onClick={() => ForClientEdit(original)}>
            <Edit />
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





  const linkers = [
    { title: "clinicians", link: "/clinician", icon: <MedicalInformation /> },
    { title: "new clinician", link: "/clinician/new", icon: <AddBox /> },
  ];

  return (
    <>
      <SidebarLayoutMap sidebar={<SideBarMapView linkers={linkers} />}>
        <TableDisplay data={ClinicianList} column={columns} filtering={true}
        />
      </SidebarLayoutMap>
    </>
  );
}
