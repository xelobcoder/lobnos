import React from 'react'

export default function ResultFilterAdvancedSearch({ handleAdvancedChange, handleAdvancedSubmit, advancedQuery }) {
  return (
    <div className='card m-0 p-0 br-5'>
      <div className='card-header bg-secondary text-white'>
        <h5> Filter result </h5>
      </div>
      <div className='card-body'>
        <div className='d-flex gap-2'>
          <div className='form-row'>
            <label>patient id</label>
            <input
              className="custom-input mb-2"
              value={advancedQuery.patientid}
              name="patientid"
              type='number'
              onChange={(e) => handleAdvancedChange(e)}
              placeholder="patientid here eg. 48493927390"
            />
          </div>
          <div className='form-row'>
            <label>fullname</label>
            <input
              className="custom-input mb-2"
              value={advancedQuery.fullname}
              name="fullname"
              onChange={(e) => handleAdvancedChange(e)}
              placeholder="fullname like Tiifu Hamza "
            />
          </div>
          <div className='form-row'>
            <label>mobile number</label>
            <input
              className="custom-input mb-2"
              value={advancedQuery.mobile}
              name="mobile"
              type='tell'
              onChange={(e) => handleAdvancedChange(e)}
              placeholder="Eg.0595964565"
            />
          </div>
          <div className='form-row'>
            <label>from</label>
            <input type="date" className="custom-input"
              value={advancedQuery.from}
              name="from"
              onChange={(e) => handleAdvancedChange(e)}
            />
          </div>
          <div className='form-row'>
            <label>To</label>
            <input type="date" className="custom-input"
              value={advancedQuery.to}
              name="to"
              onChange={(e) => handleAdvancedChange(e)}
            />
          </div>
          <div className='form-row'>
            <button className="btn btn-primary mt-2"
              onClick={(e) => handleAdvancedSubmit(e)}
            >
              search
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
