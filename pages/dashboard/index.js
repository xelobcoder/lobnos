import React, { useState ,useEffect} from 'react';
import DashBoardLayoutSales from '../../components/salesSummary/DashBoardLayout';
import { getBranches } from '../../components/Auth/customFetch';
import PerformanceChartGeneral from '../../components/salesSummary/PerformanceChartGeneral';


export default function Sales() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [show, setShow] = useState('salesAmount');
  const [type, setType] = useState('Bar')
  useEffect(() => { getBranches(setBranches) }, []);

  const year = new Date().getFullYear();


  return (
    <>
      <DashBoardLayoutSales>
        <div className='d-flex gap-3 px-2 py-2'>
          <select onChange={(ev) => { setSelectedBranch(ev.target.value) }}>
            <option> select branch</option>
            <option value={'all'}>all</option>
            {branches.map((item, index) => { return <option key={index + 1} value={item.branchid}>{item.name}</option> })}
          </select>
          <select onChange={(ev) => { setShow(ev.target.value) }} >
            <option>select what to show</option>
            <option value='salesAmount'>sales </option>
            <option value='totalCases'>cases count</option>
          </select>
          <select onChange={(ev) => { setType(ev.target.value) }}   >
            <option value='Bar'>Bar Chart</option>
            <option value='Line'>Line Chart</option>
          </select>
        </div>
        <div className='sales_summary' >
          <PerformanceChartGeneral type={type} branchid={selectedBranch} target={'yearly'} show={show} subtarget='Year' title={'Annual sales performance chart'} />
          <PerformanceChartGeneral type={type} branchid={selectedBranch} target={'monthly'} show={show} subtarget='Month' title={`${year} Monthly sales`} />
          <PerformanceChartGeneral type={type} branchid={selectedBranch} show={show} target={'weekly'} subtarget='Week' title={'Month Weekly sales'} />
          <PerformanceChartGeneral type={type} branchid={selectedBranch} show={show} target={'daily'} subtarget='Day' title={'Daily sales of the month'} />
        </div>

      </DashBoardLayoutSales>
    </>
  )
}
