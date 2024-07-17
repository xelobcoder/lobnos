import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { customData } from '../../../../components/Auth/customFetch';
import DepartmentStockLevel from '../../../../components/inventory/departmentStockLevel';
import AuthContext from '../../../../components/Auth/useAuthentification'
import DepartmentInventoryLayout from '../../../../components/inventory/departments/DepartmentInventoryLayout';
export default function DepartmentalStockLevelCustom() {
  const departmentId = useRouter().query.id;
  const { auth } = useContext(AuthContext);
  const [stocks, setStocks] = useState([])

  useEffect(() => {
    if (departmentId) {
      try { customData(`departments/stocks?id=${departmentId}`, setStocks) } catch (err) {
        setStocks([])
      }
    }
  }, [departmentId]);

  const deleteStock = async (e, id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this stock?");
    if (confirmDelete) {
      try {
        const deleteStockAsync = await customPost(`departments/stocks?id=${id}`, "DELETE", {});
        const { status, message } = deleteStockAsync;
        if (status === "success") {
          const updatedStocks = stocks.filter((stock) => stock.stockid !== id);
          alert(message)
          setStocks(updatedStocks);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <DepartmentInventoryLayout>
      <DepartmentStockLevel auth={auth} datasource={stocks || []} deleteStock={deleteStock} />
    </DepartmentInventoryLayout>
  )
}
