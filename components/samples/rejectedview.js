import { useRouter } from 'next/router';
import { Button } from '@mui/material';
import { Container } from '@mui/material';
import React from 'react';
function REJECTEDVIEW({ reverse, filteredData }) {
  // filter rejected data

  const [list, setList] = React.useState(filteredData);
  const [value, setValue] = React.useState('');
  const [messageview, setMessageview] = React.useState({ view: false, data: {}, });


  const ListGroup = ({ data, handleview }) => {
    return list.map((item, index) => {
      return (
        <div key={index} className='list-group-item list-group-item-action' style={{ borderRadius: 0, cursor: 'pointer' }}>
          <div className=' w-100' id='rejected-view-list'>
            <p className='mb-1'>{item.FULLNAME}</p>
            <p className='mb-1'>{item.PATIENTID}</p>
            <p>
              <Button variant='text' color='info' onClick={(e) => handleView(item)} >view</Button>
            </p>
          </div>
        </div>
      )
    })
  }

  const notFound = () => {
    return (
      <>
        <div className='list-group-item list-group-item-action' style={{ borderRadius: 0, cursor: 'pointer' }}>
          <div className=' w-100' id='rejected-view-list'>
            <p className='mb-1'>No Data Found</p>
          </div>
        </div>
      </>
    )
  }

  const MessageCard = ({ data }) => {
    return (
      <>
        <div className='card'>
          <div className='card-header'>
            <h5 className='card-title'>Rejected</h5>
            <p>{data.FULLNAME.toUpperCase()}</p>
          </div>
          <div className='card-body'>
            <p className='card-text text-danger'>
              {data.MESSAGE}
            </p>
          </div>
        </div>
      </>
    )
  }

  // handle search

  const handleSearch = (e) => {
    let value = e.target.value.toLowerCase();
    setValue(value);
    let filtered = list.filter((item) => {
      return( new String(item.FULLNAME).toLowerCase().startsWith(value) ||
        new String(item.PATIENTID).toLowerCase().includes(value) ||
        new String(item.FULLNAME).toLowerCase().includes(value) ||
        new String(item.PATIENTID).toLowerCase().startsWith(value));
    })

    if (filtered.length == 0 && value.length > 0) {
      setList([]);
    } else if (filtered.length == 0 && value.length == 0) {
      setList(filteredData);
    } else if (filtered.length > 0 && value.length > 0) {
      setList(filtered);
    }
    else {
      setList(filteredData);
    }
  }

  const handleView = (data) => { setMessageview({ view: true, data: data }); console.log(messageview.data) }


  return (
    <>
    <Container>
      <Button variant='text' color='info' onClick={(e) => reverse()}>Back</Button>
    </Container>
      <Container>
        <div className='row mt-2'>
          <div className='col-4'>
            <input value={value} className='form-control mb-3' onChange={(e) => handleSearch(e)} />
            <div className='list-group' style={{ height: '40vh', oveflowY: 'auto' }}>
              {filteredData.length > 0 ? <ListGroup data={filteredData} /> : notFound()}
            </div>
          </div>
          <div className='col-7'>
            {
              messageview.view ? <MessageCard data={messageview.data} /> : null
            }
          </div>
        </div>
      </Container>
    </>
  )
}


export default REJECTEDVIEW;