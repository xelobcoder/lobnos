import React from 'react'

export default function BloodGrouping({ result, testname }) {
  return (
    <section>
      <div className="grid grid-50 text-capitalize">
        <h6>testname</h6>
        <h6>value</h6>
      </div>
      <div className="grid grid-50">
        <p>Blood Grouping</p>
        <p>
          {result?.["bgroup"]} {result?.["rhesus"]}
        </p>
      </div>
    </section>
  )
}
