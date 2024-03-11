import React from 'react'

export default function PregnancyTestUI({ result, testname }) {
  console.log(result)
  return (
    <section>
      <div className="grid grid-50 text-capitalize">
        <h6>testname</h6>
        <h6>value</h6>
      </div>
      <div className="grid grid-50 text-capitalize">
        <p>
          {">> "}pregnancy test({result?.["method"]})
        </p>
        <p>
          {result?.["value"]} {result?.["rhesus"]}
        </p>
      </div>
    </section>
  )
}
