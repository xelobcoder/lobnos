import React ,{useState} from 'react'
import DepartmentStockLevel from '../../components/inventory/departmentStockLevel';

export default function DepartmentStocksLevel_page({ datasource }) {
  const [stocks, setStocks] = useState(datasource)
  console.log(datasource)
  return (
    <div>
      <DepartmentStockLevel datasource={stocks} />
    </div>
  )
}







// get server side props
export async function getServerSideProps(context) {
  const response = await fetch(`http://localhost:5000/api/v1/departments/stocks?id=${68}`);
  const data = await response.json();

  return {
    props: {
      datasource: data.result
    }
  }
}



