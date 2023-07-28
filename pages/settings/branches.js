import React, { useState, useEffect } from 'react';
import Header from '../../components/header';
import { TextField, Box, Button, Container } from '@mui/material';
import SidebarFrontPage from '../../components/frontpagesidebar';
import { BranchesApi } from '../../endpoint';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import SettingsLayout from '../../components/settingsComponents/SettingsLayout';


export default function Branches() {
  const [data, setData] = useState('');
  const [branches, setBranches] = useState([]);
  // display edit or add on button determining if the user is editing or adding
  const [edit, setEdit] = useState(false);
  const [editId, setEditId] = useState('');

  // get all branches

  const getData = async function () {
    let response = await customFetch('branches')
    const { result, status } = response;
    if (status == 'success') {
      setBranches(result)
    }
  }


  // handle click function
  const onClick = function (e) {

    const updateData = async function (e, branchid) {
      const response = await customPost('branches', 'PUT', { branch: data, branchid: branchid });
      const { status, message } = response;
      if (status == 'success') {
        alert(message);
        getData();
        setData('');
        setEdit(false);
      }
    }

    if (data != undefined && data.length > 0 && edit == false) {
      const sendData = async function () {
        const response = await customPost('branches', 'POST', { branch: data });
        const { status, message } = response;
        if (status == 'success') {
          alert(message);
          getData();
          setData('');
        }
      }
      sendData();
    }

    if (data != undefined && data.length > 0 && edit == true) {
      updateData(e, editId);
    }


  }


  useEffect(() => {
    getData();
  }, [])


  //  click effe3ct for editing the data 

  const editData = function (e, index) {
    let dataset = branches.filter((item, i) => i == index);
    setData(dataset[0].NAME);
    setEdit(true);
    setEditId(dataset[0].BRANCHID);
  }



  // delete data 

  const deleteData = function (e, index) {
    // get branchid 
    const branch = branches.filter((item, i) => i == index);
    const branchid = branch[0].BRANCHID;
    // send delete request
    const sendData = async function () {
      const response = await customPost('branches', 'DELETE', { branchid: branchid });
      const { status, message } = response;
      if (status == 'success') {
        alert(message);
        getData();
      }
    }
    sendData();
  }





  const BRANCHESDATA = function (branches) {
    return branches.map((item, index) => {
      return (
        <div
          key={index}
          className="m-0 p-1"
          style={{
            display: "grid",
            gridTemplateColumns: "20% 40% 20% 20%",
            borderBottom: "1px solid lightgray",
          }}
        >
          <div>
            {new String(item.BRANCHID).length == 1
              ? "BRANC" + "00" + item.BRANCHID
              : new String(item.BRANCHID).length == 2
                ? "BRANC" + "0" + item.BRANCHID
                : "BRANC" + item.BRANCHID}
          </div>
          <div>{item.NAME.toUpperCase()}</div>
          <div>{item.DATE.slice(0, 10)}</div>
          <div>
            <button className='btn btn-primary text-white'>
              <EditIcon
                onClick={(e) => editData(e, index)}
                editset={index}

              />
            </button>
            <button className='btn btn-danger text-white' style={{ marginLeft: "5px" }} >
              <DeleteForeverIcon
                onClick={(e) => deleteData(e, index)}
              />
            </button>
          </div>
        </div>
      );
    })
  }



  return (
    <SettingsLayout>
      <div style={{ width: "99%" }}>
          <h3 className='text-lead'>Branches</h3>
          <div className="card br-5">
            <div className="card-header">
              <div className="row branches-split p-1">
                <div>
                  <TextField
                    size="small"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    label="branch name"
                    sx={{ width: "100%" }}
                  />
                </div>
                <div className="col">
                  <Button variant="contained" onClick={(e) => onClick(e)}>
                    {edit ? "edit branch" : "add branch"}
                  </Button>
                  <button
                    className="btn btn-danger"
                    style={{ marginLeft: "10px" }}
                    onClick={(e) => {
                      setEdit(false);
                      setData("");
                    }}
                  >
                    reset
                  </button>
                </div>
              </div>
            </div>
            <div
              className="card-header p-2 bg-secondary text-white"
              style={{
                display: "grid",
                gridTemplateColumns: "20% 40% 20% 20%",
                textTransform: "uppercase",
              }}
            >
              <div>branchid</div>
              <div>branch name</div>
              <div>Added on</div>
              <div>action</div>
            </div>
            {branches.length == 0 ? null : BRANCHESDATA(branches)}
          </div>
        </div>
    </SettingsLayout>
  );
}


Branches.getLayout = function PageLayout(page) {
  return (
    <>
      <Header />
      {page}
    </>
  )
}