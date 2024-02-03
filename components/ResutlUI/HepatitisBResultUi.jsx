import React from 'react'
import ResultCommentSection from "../ResultView/CommentSection"

export default function HepatitisBResultUi({ testname, result }) {
  return (
    <>
      <div>
        <table className="billing-cart-table">
          <thead className="table-primary text-uppercase p-0">
            <tr>
              <th>test name</th>
              <th>result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{testname}</td>
              <td>{result?.["results"]}</td>
            </tr>
          </tbody>
        </table>
        <ResultCommentSection result={result} />
      </div>
    </>
  )
}


