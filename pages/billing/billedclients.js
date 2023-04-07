import React from 'react'
import SECOND_NO_DATA from '../../components/accessories/secondNodata';
import { AgGridReact } from 'ag-grid-react';
import { useRouter } from 'next/router';
import { Button } from '@mui/material';
import Header from '../../components/header';
import SidebarFrontPage from '../../components/frontpagesidebar';
import { DeleteForever, EditAttributes, EditOffOutlined, Update } from '@mui/icons-material';
import { customFetch } from '../../components/Auth/customFetch';


export default function Billedclients() {
  const [billedclients, setBilledclients] = React.useState([])

  React.useMemo(async () => {
    try {
      const { result } = await customFetch('billedclients');
      setBilledclients(result)
    }
    catch (error) {
      console.log(error)
    }
  }, [])



  const outstandingCellRenderer = (params) => {
    return (
      <>
        {
          parseInt(params.value) > 0 || parseInt(params.value) < 0 ?
            <span className='text-danger'>
              {params.value}
            </span> :
            <span className='text-success'>
              {params.value}
            </span>
        }
      </>
    )
  }

  // this function use router to navigate to the edit page for the selected row billing

  const router = useRouter();
  const updateFunction = (params) => {
    router.push(`/billing/updatebilling?billingid=${params.data.BILLINGID}`)
  }

  // create action cell renderer

  const actionCellRenderer = (params) => {
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '30% 30% 30%', marginTop: '6px', gridGap: '10px' }}>
          <DeleteForever color='error' fontSize='medium' />
          <EditOffOutlined color='info' />
          <Update variant='success' onClick={() => { updateFunction(params) }} />
        </div>
      </>
    )
  }

  // create with the fields above 
  const columnDef = [
    {
      field: 'BILLINGID',
      checkboxSelection: true,
    },
    {
      field: 'PATIENTID'
    },
    {
      field: 'BILLED_ON',
    },
    {
      field: 'PAID_AMOUNT',
    },
    {
      field: 'PAYABLE'
    },

    {
      field: 'DISCOUNT'
    },
    {
      field: 'UPDATED'
    },
    {
      field: 'ORGANIZATION'
    },
    {
      field: 'CLINICIAN'
    },
    {
      field: 'PAYMENT_MODE'
    },
    {
      field: 'TYPE'
    },
    {
      field: 'OUTSTANDING',
      cellRenderer: outstandingCellRenderer
    },
    {
      field: 'ACTION',
      cellRenderer: actionCellRenderer,
      width: 300
    }
  ]



  const headerHeight = 50;
  const defaultColumn = React.useMemo(() => {
    return {
      resizable: true,
      sortable: true,
      filter: true,
      headerClass: 'headerClass',
      cellClass: 'cellClass',
    }
  }, [])





  const cellClicked = (e) => {
    console.log(e.data)
  }
  // render fields below

  return (
    <div>
      <div className='ag-theme-material' style={{ maxHeight: 'auto', height: '92vh' }}>
        <AgGridReact id='custom-table'
          onCellClicked={cellClicked}
          defaultColDef={defaultColumn}
          headerHeight={headerHeight}
          pagination={true}
          rowResize={true}
          paginationPageSize={50}
          rowData={billedclients} columnDefs={columnDef} />
      </div>
    </div>
  )
}


// Billedclients.getLayout = function (page) {
//   return (
//     <>
//       <Header />
//       <div className="wrapper">
//         <div className="side">
//           <SidebarFrontPage />
//         </div>
//         <div className="main" id='page-main-view'>{page}</div>
//       </div>
//     </>
//   );
// };

