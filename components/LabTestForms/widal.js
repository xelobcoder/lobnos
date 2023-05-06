import { Card, CardContent, CardHeader, Typography, Button } from '@mui/material';
import { useState,useEffect } from 'react';
import CommentSection from './commentSection';
import { handleComments, validateFormData,CheckResultEntered } from '../Auth/customFetch';
import Indicator from '../accessories/Reports/indicator';




function Widal({ clientdata }) {
  const [resultEntered, setResultEntered] = useState(false)
  const [widal, setWidal] = useState({
    TYPHIO: '',
    TYPHIH: '',
    PARATYPHIBH: '',
    PARATYPHIAH: '',
    COMMENTS: ''
  });



  useEffect(() => {
    async function check() {
      const response = await CheckResultEntered(clientdata.test, clientdata.billingid);
      const { result, message, statusCode, records } = response;
      if (result == true) {
        setResultEntered(true);
        if (records.length != 0) {
         setWidal(records[0])
        }
      }
    }
    check()
  }, [])

  console.log(widal)


  const handleSave = async (e) => {
    e.preventDefault();
    const formdata = {
      ...widal,
      testname: clientdata.test,
      testid: clientdata.testid,
      patientid: clientdata.patientid,
      billingid: clientdata.billingid
    }

    console.log(widal)

    function respond(response) {
      const { status, message, statusCode } = response;
      
      if (status == 'success') {
        setResultEntered(true)
      }
      alert(message)
    }
    await validateFormData(formdata, false, ['TYPHIO','TYPHIH'], 'test/result/enter', respond)
  }

  return (
    <>
      <div className='p-3' >
        <h5>Widal Test</h5>
        <div className='form-row'>
          <div className='form-group'>
            <Indicator resultEntered={resultEntered} />
            <label>typhi o</label>
            <select value={widal.TYPHIO} className='custom-input'
              onChange={(e) => setWidal({ ...widal, TYPHIO: e.target.value })}>
              <option value=''>select</option>
              <option value='1/20'>1/20</option>
              <option value='1/80'>1/80</option>
              <option value='1/160'>1/160</option>
            </select>
          </div>
          {/* typhi H */}
          <div className='form-group '>
            <label>typhi H</label>
            <select className='custom-input' value={widal.TYPHIH}
              onChange={(w) => { setWidal({ ...widal, TYPHIH: w.target.value }) }}>
              <option value=''>select</option>
              <option value='1/20'>1/20</option>
              <option value='1/80'>1/80</option>
              <option value='1/160'>1/160</option>
            </select>
          </div>
          {/* paratyphi BH */}
          <div className='form-group '>
            <label>paratyphi BH</label>
            <select className='custom-input' value={widal.PARATYPHIBH}
              onChange={(e) => setWidal({ ...widal, PARATYPHIBH: e.target.value })}>
              <option value =''>select</option>
              <option value='1/20'>1/20</option>
              <option value='1/80'>1/80</option>
              <option value='1/160'>1/160</option>
            </select>
          </div>
          {/* paratyphi AH */}
          <div className='form-group '>
            <label>paratyphi AH</label>
            <select className='custom-input' value={widal.PARATYPHIAH}
              onChange={(e) => setWidal({ ...widal, PARATYPHIAH: e.target.value })}>
              <option value=''>select</option>
              <option value='1/20'>1/20</option>
              <option value='1/80'>1/80</option>
              <option value='1/160'>1/160</option>
            </select>
          </div>
          <CommentSection getcomment={handleComments} target={'COMMENTS'} datasource={widal} datafunction={setWidal} value={widal.COMMENTS} />
          <Button type='button' onClick={(e) => handleSave(e)}
            variant='contained' color='primary' sx={{ mt: 2 }}>save information</Button>
        </div>
      </div>
    </>
  )
}


export default Widal;