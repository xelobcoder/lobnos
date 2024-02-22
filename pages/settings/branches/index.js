import { useState, useEffect } from 'react';
import { getBranches, customPost } from '../../../components/Auth/customFetch';
import TableDisplay from '../../../components/accessories/TableDisplay';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';
import AddBranchComponent from '../../../components/settingsComponents/AddBranchComponent';
import { ToastContainer, toast } from "react-toastify";
import Loader from '../../../components/accessories/Loader';
import { Form } from 'react-bootstrap'

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [isedit, setEdit] = useState({ isediting: false, data: null })
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    getBranches(setBranches, null, setLoading);
  }, [])


  const deleteData = async function (e, index) {
    let confirmation = confirm('Do you want to delete branch ?. Note this will have consequence on your data integrity hence accounting section. it is much better to deactivate')
    if (confirmation) {
      setLoading(true);
      const branch = branches.filter((item, i) => item.branchid == index);
      const branchid = branch[0].branchid;
      try {
        const response = await customPost('branches', 'DELETE', { branchid: branchid });
        const { status, message } = response;
        if (status == 'success') {
          toast.success(message, { autoClose: 500, position: 'top-center' });
          const nw = branches.filter((item, i) => item.branchid != index);
          setBranches(nw);
        } else {
          toast.error(message, { autoClose: 1000, position: 'top-center' });
        }
      } catch (err) {
        toast.error(message);
      }
      setLoading(false);
    }
  }



  const activateDeactivateBranch = async function (e, action, id) {
    const value = e === true ? 1 : 0;
    const body = { status: value === 1 ? 'activate' : 'deactivate', id };
    const response = await customPost(`branches/activation`, 'PUT', body);
    const { status, statusCode, message } = response;
    if (statusCode == 200 && status == 'success') {
      const shallowBranches = [... branches]
      const nw = shallowBranches.findIndex((item, index) => item.branchid == id);
      shallowBranches[nw]['activation'] = value;
      setBranches(shallowBranches);
      toast.success(message);
    } else {
      toast.error(message, { autoClose: 1000, position: 'top-center' })
    }
  }

  const columns = [
    {
      Header: 'Name', accessor: 'name', Cell: ({ row, value }) => {
        const date = new Date(row.original?.date).toLocaleDateString()
          || new Date().toLocaleDateString();
        return <div>
          <span>{value}</span>
          <br />
          <span>createdon: {date}</span>
        </div>
      }
    },
    { Header: 'address', accessor: 'address' },
    { Header: 'contact', accessor: 'contact' },
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
    {
      Header: 'Actions', accessor: '', Cell: function ({ row }) {
        const item = row.original;
        return (
          <div className='d-flex'>
            <Form.Check className='mx-2' checked={item.activation === 1} type='switch' style={{ fontSize: '25px' }} onChange={(e) =>
              activateDeactivateBranch(e.target.checked, item.activation, item.branchid)
            } />
            <button
              className="btn btn-primary  btn-sm"
              onClick={(e) => { setEdit({ isediting: true, data: row.original }) }}
            >
              Edit
            </button>
            <button
              className="btn btn-danger btn-sm "
              style={{ marginLeft: "5px" }}
              onClick={(e) => deleteData(e, item.branchid)}
            >
              Delete
            </button>
          </div>
        );
      }
    }
  ]


  const onSave = (data, message, status, isEdit) => {
    if (data === null && status == "error" && isEdit === false) {
      toast.error(message, { autoClose: 1000, position: "top-center" });
    } else if (data && status == "success" && isEdit === true) {
      const { branchid } = data;
      const shallowBranches = [...branches]
      const nw = shallowBranches.findIndex((item, index) => item.branchid == branchid);
      shallowBranches[nw] = data;
      setBranches(shallowBranches);
      toast.success(message, { autoClose: 500, position: "top-center" });
    }
    else if (Object.keys(data).length > 0 && isEdit === false && status == "success") {
      setLoading(true);
      const nw = [...branches, data];
      setBranches(nw);
      setLoading(false);
      toast.success(message, { autoClose: 500, position: "top-center" });
    } else {
      toast.success(message, { autoClose: 500, position: "top-center" });
    }
  }

  const resetform = () => { setEdit({ isediting: false, data: null }) }


  const renderBranches = () => {
    if (isLoading) return <Loader />
    else return (
      <div className='row p-1'>
        <TableDisplay styling={'table mt-3'} column={columns} data={branches} filtering={true} />
      </div>
    )
  }

  return (
    <MainSettingsLayoutView>
      <ToastContainer />
      <div className='mx-2'>
        <div className='card'>
          <div className='card-header bg-secondary pt-2'>
            <h6 className='text-capitalize text-white mb-0'>
              {isedit.isediting === true ? `editing ${isedit.data?.name}` : "Add branch"}
            </h6>
          </div>
          <div className='px-3 mb-2'>
            <AddBranchComponent
              resetform={resetform}
              update={onSave}
              isEdit={isedit.isediting}
              editdata={isedit.data} />
          </div>
        </div>
        {renderBranches()}
      </div>
    </MainSettingsLayoutView>
  );
}