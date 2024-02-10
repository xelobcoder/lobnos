import { useCallback, useEffect, useState } from 'react'
import MainSettingsLayoutView from '../../components/settingsComponents/MainSettingsLayoutView'
import Application_Tax_Inclusion from '../../components/settingsComponents/newTaxModal'
import { getDataAndUpdateState, customPost, customFetch } from '../../components/Auth/customFetch';
import TableDisplay from "../../components/accessories/TableDisplay";
import { Form } from 'react-bootstrap'
import Loader from '../../components/accessories/Loader';
import { ToastContainer, toast } from 'react-toastify';

export default function Application_Taxes_List() {
  const [isloading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState({ isEdit: false, editdata: null })
  const [data, setData] = useState([]);
  const defaultx = { name: '', value: '' }
  const [tax, setTax] = useState(defaultx);


  const getdata = useCallback(() => {
    getDataAndUpdateState(setData, 'application/tax', null, setIsLoading);
  }, [])



  useEffect(() => { getdata() }, [getdata])


  useEffect(() => {
    if (editing.isEdit === true) {
      setTax({ ...editing.editdata });
    }
  }, [editing.isEdit, editing.editdata])

  const handleActivation = (id, value) => {
    if (!id || typeof value != 'boolean' ) return
    customPost("application/tax/activation", 'PUT', { id, status: value })
      .then((response) => {
        const { status, message } = response;
        if (status == "success") {
          toast.success(message, { autoClose: 500, position: "top-center" });
          const nw = [...data];
          const index = nw.findIndex((item, index) => item?.id === parseInt(id));
          if (index < 0) return;
          nw[index]['apply'] = value === true ? "Yes" : 'No';
          setData(nw);
        } else {
          toast.error(message, { autoClose: 1000, position: 'top-center' })
        }
      })
      .catch((err) => {
        toast.error("something went wrong", { autoClose: 1000, position: 'top-center' })
      })
  }


  const deleteItem = async (id) => {
    if (!id) return;
    const confirmation = confirm('Do you want to delete record');
    if (!confirmation) return;
    customPost(`application/tax?id=${parseInt(id)}`, 'DELETE', {})
      .then((response) => {
        const { status, message } = response;
        if (status == "success") {
          toast.success(message, { autoClose: 500, position: "top-center" });
          const unmatched = [...data].filter((item, index) => item?.id !== parseInt(id));
          if (unmatched.length === 0) return;
          setData(unmatched);
        } else {
          toast.error(message, { autoClose: 1000, position: 'top-center' })
        }
      })
      .catch((err) => {
        toast.error(message, { autoClose: 1000, position: 'top-center' })
      })
  }


  const columns = [
    { Header: 'name', accessor: "name" },
    {
      Header: 'value', accessor: "value", Cell: ({ value }) => {
        return <div>
        {value}{"%"}
      </div>
    } },
    { Header: 'Tax Applied', accessor: "apply" },
    {
      Header: "change status", accessor: '', Cell: ({ row }) => {
        const item = row.original;
        return (
          <Form.Check type='switch' style={{ fontSize: '25px' }}
            onChange={(ev) => { handleActivation(item.id, ev.target.checked) }}
            checked={item.apply === "Yes" ? true : false}
          />
        )
      }
    },
    {
      Header: "actions", accessor: "", Cell: ({ row }) => {
        const item = row.original;
        return (
          <div className='d-flex' >
            <button className='btn btn-primary btn-sm' onClick={(ev) => { setEditing({ isEdit: true, editdata: item }) }}>
              edit
            </button>
            <button className='btn btn-danger btn-sm mx-2' onClick={(ev) => { deleteItem(item?.id) }}>
              delete
            </button>
          </div>
        )
      }
    }
  ]

  const handleSubmit = async () => {
    if (tax.name && tax.value !== null && tax.value !== "") {
      try {
        const pushResponse = await customPost('application/tax', editing.isEdit == true ? "PUT" : 'POST', tax)
        const { status, message } = pushResponse;
        if (status == 'success') {
          setTax(defaultx);
          if (editing.isEdit === false) {
            setData([...data, { ...tax, apply: 'Yes' }]);
          } else {
            const { id } = tax;
            const nw = [...data];
            const index = nw.findIndex((item, index) => item?.id === parseInt(id));
            if (index < 0) return;
            nw[index] = tax;
            setData(nw);
          }
          toast.success(message, { autoClose: 500, position: 'top-center' })
        } else {
          toast.error(message, { autoClose: 1000, position: 'top-center' })
        }
      } catch (err) {
        console.log(err)
        toast.error("something wrong occured", { autoClose: 1000, position: 'top-center' })
      }
    } else toast.error('all fields required', { autoClose: 1000, position: 'top-center' })
  }

  const render = () => {
    if (isloading) return <Loader />
    else {
      return <TableDisplay rowProps={{ active: null, page: 1 }} column={columns} data={data} />
    }
  }


  const stopedit = () => { setTax(defaultx); setEditing({ editdata: null, isEdit: false }) }
  return (
    <MainSettingsLayoutView>
      <ToastContainer />
      <div className='mx-2'>
        <Application_Tax_Inclusion
          handleSubmit={handleSubmit}
          stopedit={stopedit}
          tax={tax}
          setTax={setTax}
        />
        {render()}
      </div>
    </MainSettingsLayoutView>
  )
}
