"use client"
import React, { useEffect, useState } from 'react'
import { customFetch } from '../Auth/customFetch';
import Chart from 'react-apexcharts'

export default function Yearly({ target, headers, patientid = null, run = false }) {
  const [data, setData] = useState([]);
  // determines how the label is displayed
  const labelid = function (target) {
    if (target == "yearly") {
      return "yearly-sales";
    } else if (target == "monthly") {
      return "monthly-sales";
    } else if (target == "weekly") {
      return "weekly-sales";
    } else if (target == "daily") {
      return "daily-sales";
    }
  };


  const dataTarget = function (target) {
    if (target == "yearly") {
      return "Year";
    } else if (target == "monthly") {
      return "Month";
    } else if (target == "weekly") {
      return "Week";
    } else if (target == "daily") {
      return "Day";
    }
  };

  const options = {
    chart: {
      id: labelid(target),
      type: 'candlestick',
      toolbar: {
        show: false
      }
    },
    xaxis: {
      categories: data.map(item => item[`${dataTarget(target)}`]),
      title: {
        text: `${dataTarget(target)}`
      }
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1]
    },
    stroke: {
      width: [0, 6]
    },
    colors: ['#F44336', '#00E396'],
    title: {
      text: 'Financial information chart'
    },
    yaxis: [{
      title: {

      }
    },
    {
      opposite: false,
      title: {
        text: 'Amount',
      }
    }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      enabled: true,
    }
  }
  const series = [
    {
      name: 'Sales',
      type: 'column',
      data: data.map(item => item.salesAmount)
    }, {
      name: 'case count',
      type: 'line',
      data: data.map((item) => item.totalCases)
    }
  ]


  const fetchYearly = async () => {
    let endpoint = patientid == null ? `sales/summary/general?target=${target}` : `sales/summary/general?target=${target}&&patientid=${patientid}`
    const response = await customFetch(endpoint);
    const { status, statusCode, result } = response;
    if (status == "success" && statusCode == 200) {
      setData(result);
    }
  }

  useEffect(() => {
    fetchYearly();
  }, [])


  useEffect(() => {
    fetchYearly();
  }, [run])

  console.log(run,data,target)
  return (
    <>
      <div className="card">
        <div className="card-header" style={{ backgroundColor: "white" }}>
          <h6 className="card-title btn btn-success">
            {headers}
          </h6>
        </div>
        <div className="card-body p-0">
          <Chart options={options} series={series} type="line" height={350} />
        </div>
      </div>
    </>
  );
}
