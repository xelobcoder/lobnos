import React from 'react'

export default function ChemistryTable() {
  const data = [
    {
      "parameter": "albumin",
      "upper": 6050,
      "lower": 200,
      "unit": "mg/dl",
      "value": 44,
      "comments": "jegwgoweogwgiwgw"
    },
    {
      "parameter": "total protein",
      "upper": 300,
      "lower": 600,
      "unit": "mg/dl",
      "value": 4444,
      "comments": "jegwgoweogwgiwgw"
    },
    {
      "parameter": "alp",
      "upper": 600,
      "lower": 600,
      "unit": "mg/dl",
      "value": 4455,
      "comments": "jegwgoweogwgiwgw"
    },
    {
      "parameter": "ast",
      "upper": 600,
      "lower": 6000,
      "unit": "mg/dl",
      "value": 4455,
      "comments": "jegwgoweogwgiwgw"
    },
    {
      "parameter": "alt",
      "upper": 600,
      "lower": 600,
      "unit": "mg/dl",
      "value": 4455,
      "comments": "jegwgoweogwgiwgw"
    },
    {
      "parameter": "bun",
      "upper": 600,
      "lower": 600,
      "unit": "mg/dl",
      "value": 44854,
      "comments": "jegwgoweogwgiwgw"
    },
    {
      "parameter": "creatinine",
      "upper": 5000,
      "lower": 600,
      "unit": "mg/dl",
      "value": 4588,
      "comments": "jegwgoweogwgiwgw"
    },
    {
      "parameter": "ast---",
      "upper": 20,
      "lower": 10,
      "unit": "G/DL",
      "value": 8888,
      "comments": "jegwgoweogwgiwgw"
    }
  ]

  return (
    <div>
      <hr></hr>
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
          {
            data.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item?.parameter}</td>
                  <td>{item?.value}</td>
                  <td className='text-lowercase'>{item.unit}</td>
                  <td>{item?.upper} - {item?.lower}</td>
                  <td>{item.value > item.upper ? 'high' : item.value < item.lower ? 'lower': 'normal'}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
      <div>
        <h4>Comments</h4>
        {data[0]['comments']}
      </div>
    </div>
  )
}
