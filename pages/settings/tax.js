import { useCallback, useEffect, useState } from 'react'
import MainSettingsLayoutView from '../../components/settingsComponents/MainSettingsLayoutView'
import Application_Tax_Inclusion from '../../components/settingsComponents/newTaxModal'
import { getDataAndUpdateState } from '../../components/Auth/customFetch';
import TableDisplay from "../../components/accessories/TableDisplay";
import { Form } from 'react-bootstrap'
import Loader from '../../components/accessories/Loader';

export default function Application_Taxes_List() {
  const [isloading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState({ isEdit: false, editdata: null })
  const [data, setData] = useState([]);

  const getdata = useCallback(() => {
    getDataAndUpdateState(setData, 'application/tax', null, setIsLoading);
  }, [])



  useEffect(() => { getdata() }, [getdata])

  const handleActivation = (id, value) => {
    if (!id || !value) return
    const nw = [...data];
    const index = nw.findIndex((item, index) => item?.id === parseInt(id));
    if (index < 0) return;
    nw[index]['apply'] = value === true ? "Yes" : 'No';
    setData(nw);
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
          <div className='d-flex'>
            <button className='btn btn-primary btn-sm' onClick={(ev) => { setEditing({ isEdit: true, editdata: item }) }}>
              edit
            </button>
            <button className='btn btn-danger btn-sm mx-2'>
              delete
            </button>
          </div>
        )
      }
    }
  ]

  const render = () => {
    if (isloading) return <Loader />
    else {
      return <TableDisplay column={columns} data={data} />
    }
  }
  return (
    <MainSettingsLayoutView>
      <div className='mx-2'>
        <Application_Tax_Inclusion isEdit={editing.isEdit} editdata={editing.editdata} />
        {render()}
      </div>
    </MainSettingsLayoutView>
  )
}
