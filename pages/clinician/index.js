import { useCallback, useEffect, useState } from "react";
import { customPost, getDataAndUpdateState, updatePagination } from "../../components/Auth/customFetch";
import TableDisplay from '../../components/accessories/TableDisplay';
import {IconButton, Typography } from "@mui/material";
import { DeleteForeverOutlined, Edit,Visibility } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import FrontDeskLayout from "../../components/Layout/FrontDeskLayout";
import BasicInformationClinician from "../../components/Clinicians/BasicInformationClinician";
import Pagination from '../../components/accessories/pagination';
import Loader from "../../components/accessories/Loader";

export default function Clinicians() {
  const [ClinicianList, setClinician] = useState([]);
  const [editing, setEditing] = useState({ editing: false, editid: null });
  const [pagination, setPagination] = useState({ page: 1, count: 10, show: false });
  const [method, setMethod] = useState('POST');
  const [loading, setLoading] = useState(false);
  const [load, setLoad] = useState(false);
  const router = useRouter();

  const getClinicianData = useCallback(async () => {
    try {
      setLoading(true);
      await getDataAndUpdateState(setClinician, `clinicians?count=${pagination.count}&&page=${pagination.page}`)
      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert(err || 'error connecting to server');
    }
  }, [pagination.count, pagination.page])


  useEffect(() => {
    getClinicianData();
  }, [getClinicianData]);

  const ForClientEdit = (originaldata) => {
    const { id } = originaldata;
    if (!id) return;
    setEditing({ editing: true, editid: parseInt(id) });
    setMethod('PUT');
    window.scrollTo(0, 0);
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
          <IconButton size="small" onClick={(ev) => {router.push(`/clinician/clinicianview?clinicianid=${original.id}`)}}>
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
    let confirmation = confirm('Do want to delete clinician ?');
    if (!confirmation) return;
    const { id } = original;
    if (!id) return;

    try {
      let deletepush = await customPost('clinicians', 'DELETE', { id });
      const { statusCode, status, message } = deletepush;
      if (statusCode == 200 && status == 'success') {
        toast.success(message, { position: 'top-right', autoClose: 1000 });
        setClinician((prev) => {
          return prev.filter((item, index) => item.id !== id);
        })
      } else {
        toast.error(message,{position:'top-right',autoClose: 1000})
      }
    } catch (err) {
      toast.error(err.message || 'error in connecting to server',{position:'top-right',autoClose: 1000})
    }
  }


  const reset = () => { setMethod('POST'); setEditing({ editid: null, editing: false }) };

  const updatePage = (value) => { updatePagination(value, setPagination, pagination) }


  const renderingView = () => {
    if (loading) return <Loader />
    else return (
      <div>
        <TableDisplay data={ClinicianList} showpage={false} column={columns} filtering={true} />
        <section className="d-flex justify-content-center">
          <Pagination page={pagination.page} load={setLoad} updateFunction={updatePage} />
        </section>
      </div>
    )
  }


  const updateItem = async (value) => {
    if (!value || ClinicianList.length == 0 || typeof value != 'object' || !value.id) return;
    const { id } = value;
    const itemIndex = ClinicianList.findIndex((item, index) => item.id == id);
    if (itemIndex != -1) {
      const prev = [...ClinicianList];
      prev[itemIndex] = value;
      setClinician(prev);
    }
  }

  return (
    <FrontDeskLayout>
      <ToastContainer />
      <div className="card mb-3">
        <div className="card-header bg-secondary text-white">
          {editing.editing == true ? <h5>Update clinician Information</h5> : <h5>New Clinician</h5>}
        </div>
        <div className="card-body">
          <BasicInformationClinician updateItem={updateItem} reset={reset} method={method} toast={toast} editid={editing.editid} editing={editing.editing} />
        </div>
        {renderingView()}
      </div>
    </FrontDeskLayout>
  );
}
