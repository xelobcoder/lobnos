import React from 'react'

export default function ChemistryTable({ data }) {

  return (
    <div>
      {data.length > 0 && (
        <>
          <table id='custom-table' className='chemistry_print'>
            <thead>
              <tr>
                <th className='text-capitalize'>parameter</th>
                <th className='text-capitalize'>result</th>
                <th className='text-capitalize'>unit</th>
                <th className='text-capitalize'>reference range</th>
                <th className='text-capitalize'>flag</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item?.parameter}</td>
                    <td>{item?.value}</td>
                    <td className='text-lowercase'>{item.unit}</td>
                    <td>{item?.upper} - {item?.lower}</td>
                    <td>{item.value > item.upper ? 'high' : item.value < item.lower ? 'lower' : 'normal'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table><div>
            <h4>Comments</h4>
            {data[0]['comments']}
          </div>
        </>
      )}
    </div>
  )
}
