import { useState, useCallback } from 'react'
import { Input, List } from '@mui/material'
import CheckBox, { Button } from '@mui/material'
import Message from './message'

function TEST_DETAILS({ data }) {
  const [textmessage, setTextmessage] = useState('')
  const [content, setContent] = useState('')
  const [ticked, setTicked] = useState(true)

  const dessociate = (test) => {
    return test.split(',')
  }

  const Listing = ({ data }) => {
    return dessociate(data).map((item, index) => {
      return (
        <>
          <ul key={index} className="list-group" id='test-list'>
            <li className="list-group-item -tr" style={{ borderRadius: '0px' }}>
              <div className="text-frame">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2% auto',
                    gridGap: '20px 20px',
                  }}
                >
                  <div className="1">{index + 1}</div>
                  <div className='two'>{item}</div>
                </div>
              </div>
            </li>
          </ul>
        </>
      )
    })
  }

  const handleMessage = useCallback((e) => {
    setContent(e.target.value)
  })

  return (
    <>
      <div className="test-detail-panel" key={data.ID}>
        <div
          className="list-group"
          style={{ marginLeft: '4%', marginRight: '4%', borderRadius: '0' }}
        >
          <div
            className="list-group-item alert alert-warning"
            style={{
              display: 'grid',
              gridTemplateColumns: '50% auto',
              border: ' 1px solid lightgray',
              borderBottomRightRadius: '0',
              borderBottomLeftRadius: 0,
            }}
          >
            <div className="group">
              <div className="header">fullname</div>
              <div className="other">{data.FULLNAME}</div>
            </div>
            <div className="group">
              <div className="header">refering clinician</div>
              <div className="other">{data.CLINICIAN}</div>
            </div>
            <div className="group">
              <div className="header">Age</div>
              <div className="other">
                {data.AGE + ' '} {data.AGETYPE}
              </div>
            </div>
            <div className="group">
              <div className="header">urgency</div>
              <div className="other">{data.URGENCY}</div>
            </div>
            <div className="group">
              <div className="header">gender</div>
              <div className="other">{data.GENDER}</div>
            </div>
            <div className="group">
              <div className="header">refering organization</div>
              <div className="other">{data.ORGANIZATION}</div>
            </div>
            <div className="group">
              <div className="header">outstanding Bill</div>
              <div className="other">{data.OUTSTANDING}</div>
            </div>
          </div>
          <Listing data={data.TEST} />
          <li className="list-group-item go-top">
            <div className="grid-move-last">
              <label className="text-lowercase">
                <input
                  type="checkbox"
                  className="selectalllabel"
                  onClick={(e) => setTicked(!ticked)}
                />
                tick here if all test samples was not taken and click on message
                to provide some information
              </label>
              <Button
                disabled={ticked ? true : false}
                color="error"
                onClick={(e) => setTextmessage(!textmessage)}
              >
                Add message
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  marginLeft: '-4px',
                  marginRight: '24px',
                  borderRadius: '0px',
                }}
              >
                finish
              </Button>
            </div>
          </li>
          {!textmessage ? null : (
            <Message  content={content} onMessage={handleMessage} />
          )}
        </div>
      </div>
    </>
  )
}

export default TEST_DETAILS
