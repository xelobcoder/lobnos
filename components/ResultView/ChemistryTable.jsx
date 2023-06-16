import { Typography } from '@mui/material'
import React from 'react'

export default function ChemistryTable({ data = [], testname }) {
  return (
    <div className="result-table-section">
      {data.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Typography
              vaiant="h4"
              sx={{
                textAlign: "center",
                backgroundColor: "whitesmoke",
                padding: '5px',
                marginBottom: '10px',
                color: "black",
                textTransform: "uppercase",
              }}
            >
              {testname.split("_").join(' ') || ''}
            </Typography>
          </div>
          <table id="custom-table" className="chemistry_print">
            <thead>
              <tr>
                <th className="text-capitalize">parameter</th>
                <th className="text-capitalize">result</th>
                <th className="text-capitalize">unit</th>
                <th className="text-capitalize">reference range</th>
                <th className="text-capitalize">flag</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item?.parameter}</td>
                    <td>{item?.value}</td>
                    <td className="text-lowercase">{item.unit}</td>
                    <td>
                      {item?.upper} - {item?.lower}
                    </td>
                    <td>
                      {item.value > item.upper
                        ? "high"
                        : item.value < item.lower
                          ? "low"
                          : "normal"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div>
            <h4>Comments</h4>
            {data[0]["comments"]}
          </div>
        </>
      )}
    </div>
  );
}
