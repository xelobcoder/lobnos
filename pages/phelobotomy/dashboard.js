import { Button } from '@mui/material';
import Header from '../../components/header'
import React, { useEffect, useState } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import { OneKSharp } from '@mui/icons-material';
export default function Phelobotomy() {
  const [data, setData] = useState([])
  const [status, setStatus] = useState(false)
  const [timer, setTimer] = useState(60000)
  const [splitScreen, setSplitScreen] = useState(false);
  const [collection, setCollection] = useState({
    billingid: null,
    patientid: null,
    fullname: 'TIIFU hamza'
  })

  // state for all samples collected
  const [allCollected, setAllCollected] = useState(false);

  const [testpanel, setTestpanel] = useState([]);
  // this state create an object for each test and button to indicate received;

  const [testcollection, setTestCollection] = useState([])

  // sample message if all samples are not collected
  const [isnotMessage, setIsNotMessage] = useState('');

  // get data from database
  useEffect(() => {
    let getdata = async () => {
      let data = await fetch(`${process.env.BASEURL}/phelobotomy`)
      let datajson = await data.json()
      // we need to sort the data by urgency
      let sorteddata = datajson.sort((a, b) => {
        if (a.URGENCY == 'emmergency') {
          return -1
        } else if (a.URGENCY == 'moderate') {
          return 0
        } else {
          return 1
        }
      })
      setData(sorteddata)

      // when done , fetch testpanel 
      const getTest = async () => {
        let getting = await fetch(`${process.env.BASEURL}/testpanel/list`)
        let response = await getting.json();
        setTestpanel(response)
      }

      getTest();
    }
    getdata()

    setInterval(() => {
      getdata()
    }, timer)
  }, [timer])





  // handle collectin of sample button

  const handleCollectSample = async (id, patientid) => {
    // where id is the billing id, weload a modal to collect the sample information
    // split screen for sample details panel to be revealed 
    setSplitScreen(true);
    // update collection state
    setCollection({ billingid: id, patientid, fullname: 'tiifu hamza' });
    // filter data using the billing id
    const filteredBill = data.filter((item, index) => item.BILLINGID == id);

    // empty test collection
    setTestCollection([]);

    // set all samples collected state false 

    setAllCollected(false);

    // get test from filteredBill and populate testcollection state
    const test = filteredBill[0]['TEST'].split(',');
    // return a map 
    const created_panels = test.map((item, indexx) => {
      return {
        test: item,
        billid: id,
        collected: false
      }
    })

    // poupulate test collection
    setTestCollection(created_panels)
  }



  // this function changes state of test clicked when the sample have been taken

  const handleIndividualSample = async (index) => {
    const filtertest = testcollection.filter((item, i) => i === index);
    const unfilteredtest = testcollection.filter( (item,i) => i != index);
    filtertest[0]['collected'] = true;
    // change the state
    setTestCollection([filtertest[0],...unfilteredtest])
  }





  // this functions changes the collectin state of ehe client to true
  useEffect(() => {
    const handleAllCollected = async (e) => {
      let collextion = testcollection.map((item, index) => {
        return {
          test: item.test,
          collected: allCollected,
          billid: item.billid
        }
      })

      setTestCollection(collextion)
    }

    handleAllCollected()
  }, [allCollected])

  return (
    <>
      <div className={splitScreen === true ? 'splitScreen' : null}>
        <div className='phelobotomy-wrapper'>
          <div className='m-2 col-4 d-flex'>
            {/* sleect box for the sorting the data */}
            <select className='custom-input' placeholder='sort by'>
              <option> sort by</option>
              <option value="urgency">urgency</option>
              <option value="date">date</option>
            </select>
            {/* search here using client billing id or fullname */}
            <input type="text" className='custom-input' placeholder='search using bill ID or patient id' />
          </div>
          <ListGroup className='m-2' >
            {
              data.map((item, index) => {
                return (
                  <ListGroupItem key={index} className='border' id='sample-display-dsh'>
                    <div>
                      <div className="1">{item.BILLINGID}</div>
                    </div>
                    <div>
                      <div>{item.PATIENTID}</div>
                    </div>
                    <div>
                      <div>{item.FULLNAME}</div>
                    </div>
                    {/* age and age type */}
                    <div>
                      <div>{item.AGE}  {item.AGETYPE}</div>
                    </div>
                    <div>
                      <div>{item.GENDER}</div>
                    </div>
                    <div>
                      <div> Test: {item.TEST}</div>
                    </div>
                    <div>
                      <div className={
                        item.URGENCY == 'emmergency' ? 'text-danger' :
                          item.URGENCY == 'moderate' ? 'text-warning' :
                            'text-success'
                      }>
                        {item.URGENCY.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div>
                        <Button variant="contained" color="success" onClick={(e) => { handleCollectSample(item.BILLINGID, item.PATIENTID) }}>
                          collect sample
                        </Button>
                      </div>
                    </div>
                  </ListGroupItem>
                )
              })
            }
          </ListGroup>
        </div>
        <div className='side-pane'>
          <header className='collection-header bg-warning p-2 text-capitalize text-lead' >
            <span>Billid: {collection.billingid}</span>
            <br />
            <span>clientid:{collection.patientid}</span>
            <br />
            <span>fullname:{collection.fullname}</span>
          </header>
          <main>
            {/* create a table of all the test with respective sample type and the requied button to indicate collected or not  */}
            {
              testcollection.length > 0 && (
                <>
                  <table id='custom-table'>
                    <thead>
                      <tr>
                        <th>test</th>
                        <th>collected</th>
                        <th>action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        testcollection.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{item.test}</td>
                              <td>{item.collected === false ? 'N/A' : 'collected'}</td>
                              {
                                item.collected == true ?
                                  (<>
                                    <OneKSharp sx={{ marginTop: '10px' }} />
                                  </>) : (
                                    <td>
                                      <Button size='small'
                                        onClick={(e) => handleIndividualSample(index)} variant='contained' color='info'>
                                        collected
                                      </Button>
                                    </td>
                                  )
                              }
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </table>
                  <input type='checkbox' checked={allCollected} onChange={(e) => setAllCollected(!allCollected)} /> All collected
                </>
              )
            }
            {
              !allCollected && (
                <>
                  <div className='alert alert-warning'>
                    <pre>
                      all samples not taken ?
                    </pre>
                    entered reason in the text box below
                  </div>

                  <textarea className='form-control' rows={4}
                    onChange={(e) => setIsNotMessage(e.target.value)}
                    value={isnotMessage}>

                  </textarea>
                </>
              )
            }
          </main>
          <Button variant='contained' sx={{ marginTop: '20px' }} color='primary'
            onClick={(e) => alert('do you want to print barcode')}
          >
            Done
          </Button>
          <Button
            onClick={(e) => setSplitScreen(false)}
            sx={{ marginTop: '20px', marginLeft: '20px' }} variant='contained' color='error'>
            close
          </Button>
        </div>
      </div>
    </>
  )
}


Phelobotomy.getLayout = function (page) {
  return (
    <>
      <Header />
      {page}
    </>
  )
}
