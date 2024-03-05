import React from 'react'
import { useContext } from 'react'
import { PatientContext } from '../../pages/patients'
import { useEffect } from 'react';
import { customFetch, monthCollection, dayCollection } from '../Auth/customFetch';
import { AnalyticsOutlined } from '@mui/icons-material';


export default function SalesSummaryPatient({ header, data, currency }) {
  const { initials, updateInitials, chartData } = useContext(PatientContext);
  const targetPatientId = initials.query;
  const runSales = initials.runSales;


  useEffect(() => {
    if (targetPatientId && runSales) {
      const getData = async function () {
        const year = await customFetch(`sales/summary/general?branch=all&&target=yearly&&patientid=${targetPatientId}`);
        const day = await customFetch(`sales/summary/general?branch=all&&target=daily&&patientid=${targetPatientId}`)
        const month = await customFetch(`sales/summary/general?branch=all&&target=monthly&&patientid=${targetPatientId}`);
        const week = await customFetch(`sales/summary/general?branch=all&&target=weekly&&patientid=${targetPatientId}`);
        try {
          const [yearly, daily, monthly, weekly] = await Promise.all([year, day, month, week]);

          updateInitials({
            type: 'POPULATE_CHART_DATA', data: {
              yearly: yearly?.result,
              daily: daily?.result,
              monthly: monthly?.result,
              weekly: weekly?.result
            }
          })

          let field = {};

          const updateObject = function (obj, key) {
            // day of the month representted in numbers 
            const today = new Date().getDate();
            // destructure from the response object
            const { status, result, statusCode } = obj;
            if (Array.isArray(result) && result.length > 0 && status == 'success' && statusCode == 200) {
              if (key == 'day') {
                let total = result.filter((item, index) => { return today == new Date(item.date).getDate() })
                total.length > 0 ? field[key] = { sales: total[0]['salesAmount'], count: total[0]['totalCases'], day: today } : field[key] = { sales: 0, count: 0, day: today }
              }

              if (key == 'week') {
                const WeekDeterminer = function (week) {
                  const t = result.filter((item, index) => { return item['Week'] == week });
                  t.length == 0 ? field[key] = { sales: 0, count: 0, week } : field[key] = { sales: t[0]['salesAmount'], count: t[0]['totalCases'], week }
                }
                if (today >= 1 && today <= 7) {
                  WeekDeterminer('First Week')
                } else if (today >= 8 && today <= 14) {
                  WeekDeterminer('Second Week')
                } else if (today >= 15 && today <= 21) {
                  WeekDeterminer('Third Week')
                } else {
                  WeekDeterminer('Fourth Week')
                }
              }

              if (key == 'month' || key == 'yearly') {
                let total = result
                  .map((item, index) => {
                    return { sales: item.salesAmount, count: item.totalCases };
                  })
                  .reduce((a, b, i) => {
                    let current = { sales: a.sales + b.sales, count: a.count + b.count };
                    return current;
                  });
                if (month) {
                  field[key] = { ...total, month: monthCollection[new Date().getMonth()] };
                }
              }
            }
          }

          updateObject(yearly, 'yearly');
          updateObject(daily, 'day');
          updateObject(monthly, 'month');
          updateObject(weekly, 'week')
          // dispatch state 
          updateInitials({ type: 'POPULATE_SALES_SUMMARY', data: field })
        } catch (err) {
          console.log(err)
          updateInitials({ type: 'POPULATE_SALES_SUMMARY', data: [] })
        }
      }

      getData()
    }
  }, [targetPatientId, runSales])


  const renderChart = function (target) {
    if (targetPatientId && runSales) {
      updateInitials({ type: 'RENDER_CHART', target })
    }
  }


  return (
    <>
      {runSales && (
        <div>
          <h4>{header}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gridGap: '10px', marginBottom: '20px' }}>
            <div className='card br-5'>
              <div className='card-header d-flex justify-content-between pointer'>
                <span> Day ({data?.day?.day}th)</span>
                <span>
                  <AnalyticsOutlined titleAccess='Daily chart of the month'  onClick={(ev) => { renderChart('daily') }} />
                </span>
              </div>
              <div className='card-body'>
                <h1>{currency} {data?.day?.sales}</h1>
              </div>
            </div>
            {/* test cost */}
            <div className='card br-5'>
              <div className='card-header d-flex justify-content-between pointer'>
                <span>  Week ({data?.week?.week})</span>
                <span>
                  <AnalyticsOutlined titleAccess='Week of the month' onClick={(ev) => { renderChart('weekly') }} />
                </span>
              </div>
              <div className='card-body'>
                <h1>{currency} {data?.week?.sales}</h1>
              </div>
            </div>
            {/* total paid */}
            <div className='card br-5'>
              <div className='card-header d-flex justify-content-between pointer'>
                <span>Month( {data?.month?.month})</span>
                <span>
                  <AnalyticsOutlined titleAccess='month of the year' onClick={(ev) => { renderChart('monthly') }} />
                </span>
              </div>
              <div className='card-body'>
                <h1>{currency} {data?.month?.sales}</h1>
              </div>
            </div>
            {/* outstanding */}
            <div className='card br-5'>
              <div className='card-header d-flex justify-content-between pointer'>
                <span>
                  Year ({new Date().getFullYear()})
                </span>
                <span><AnalyticsOutlined titleAccess= 'chart in years' onClick={(ev) => { renderChart('yearly') }} /></span>
              </div>
              <div className='card-body'>
                <h1>{currency} {data?.yearly?.sales}</h1>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
