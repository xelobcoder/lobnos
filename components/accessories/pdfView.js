import React from 'react';
import t from  '../../styles/t.module.css';
function PDF_VIEWER() {

  const handlePrint = async function() {
    window.print()
  }
  return (
    <>
      <table className='table mt-3 container'>
        <thead className='table-dark text-uppercase'>
          <tr>
            <th>#</th>
            <th>parameter</th>
            <th>unit</th>
            <th>flag</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>urinlobilogiwn</td>
            <td>mg/dl</td>
            <td>high</td>
          </tr>
          <tr>
            <td>1</td>
            <td>urinlobilogiwn</td>
            <td>mg/dl</td>
            <td>high</td>
          </tr>
          <tr>
            <td>1</td>
            <td>urinlobilogiwn</td>
            <td>mg/dl</td>
            <td>high</td>
          </tr>
          <tr>
            <td>1</td>
            <td>urinlobilogiwn</td>
            <td>mg/dl</td>
            <td>high</td>
          </tr>
          <tr>
            <td>1</td>
            <td>urinlobilogiwn</td>
            <td>mg/dl</td>
            <td>high</td>
          </tr>
          <tr>
            <td>1</td>
            <td>urinlobilogiwn</td>
            <td>mg/dl</td>
            <td>high</td>
          </tr>
          <tr>
            <td>1</td>
            <td>urinlobilogiwn</td>
            <td>mg/dl</td>
            <td>high</td>
          </tr>
          <tr>
            <td>1</td>
            <td>urinlobilogiwn</td>
            <td>mg/dl</td>
            <td>high</td>
          </tr>
        </tbody>
      </table>
      <div className='container'>
        <button className='btn btn-danger' onClick={handlePrint}>
          print result
        </button>
      </div>
    </>
  )
}


export default PDF_VIEWER;





