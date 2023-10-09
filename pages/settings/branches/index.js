import React, { useState, useEffect } from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { getBranches, customPost } from '../../../components/Auth/customFetch';
import SettingsLayout from '../../../components/settingsComponents/SettingsLayout';
import TableDisplay from '../../../components/accessories/TableDisplay';
import { useRouter } from 'next/router';


export default function Branches() {
  const [branches, setBranches] = useState([]);
  const router = useRouter();

  // get all branches


  useEffect(() => {
    getBranches(setBranches);
  }, [])


  const deleteData = function (e, index) {
    // get branchid 
    let confirmation = confirm('Do you want to delete branch ?. Note this will have consequence on your data integrity hence accounting section. it is much better to deactivate')

    if (confirmation) {
      const branch = branches.filter((item, i) => item.branchid == index);
      const branchid = branch[0].branchid;
      // send delete request
      const sendData = async function () {
        const response = await customPost('branches', 'DELETE', { branchid: branchid });
        const { status, message } = response;
        if (status == 'success') {
          alert(message);
          getBranches(setBranches);
        }
      }
      sendData();
    }
  }



  const activateDeactivateBranch = async function (e, action, id) {
    const body = { status: action == 0 ? 'activate' : 'deactivate', id };
    const response = await customPost(`branches/activation`, 'PUT', body);
    const { status, statusCode, message } = response;
    alert(message)
    if (statusCode == 200 && status == 'success') {
      getBranches(setBranches);
    }
  }

  const columns = [
    { Header: '#', accessor: 'branchid' },
    { Header: 'Name', accessor: 'name' },
    {
      Header: 'Date Added', accessor: 'date', Cell: (rows) => {
        const date = rows.row.original?.date.slice(0, 10);
        return <span>{date}</span>
      }
    },
    {
      Header: 'Status', accessor: 'activation', Cell: function ({ row }) {
        const item = row.original;
        return (
          <span
            className={`text-capitalize ${item.activation == 0 ? "text-danger" : "text-primary"
              }`}> {item.activation === 0 ? "deactivated" : "activated"}</span>
        )
      }
    },
    ,
    {
      Header: 'activate/deactivate', accessor: '', Cell: function ({ row }) {
        const item = row.original;
        return (
          <span>
            <button
              style={{ marginRight: "10px" }}
              className={`text-capitalize ${item.activation == 0 ? "btn btn-sm btn-success" : "btn btn-sm btn-danger"
                }`}
              onClick={(e) =>
                activateDeactivateBranch(e, item.activation, item.branchid)
              }
            >
              {item.activation === 0 ? "activate" : "deactivate"}
            </button>
          </span>
        )
      }
    },
    {
      Header: 'Actions', accessor: '', Cell: function ({ row }) {
        const item = row.original;
        return (
          <span>
            <button
              className="btn btn-primary text-white p-0"
              onClick={(e) => { router.push(`/settings/branches/${item.branchid}`) }}
            >
              <EditIcon editset={item.branchid} />
            </button>
            <button
              className="btn btn-danger text-white p-0"
              style={{ marginLeft: "5px" }}
              onClick={(e) => deleteData(e, item.branchid)}
            >
              <DeleteForeverIcon />
            </button>
          </span>
        );
      }
    }
  ]



  return (
    <SettingsLayout>
      <div className='container'>
        <h4> Branches List</h4>
        <div className='row p-1'>
          <TableDisplay column={columns} data={branches} filtering={true} />
        </div>
      </div>
    </SettingsLayout>
  );
}