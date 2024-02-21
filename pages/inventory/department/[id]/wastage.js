import { useRouter } from "next/router";
import DepartmentInventoryLayout from "../../../../components/inventory/departments/DepartmentInventoryLayout"
import InventoryWastages from "../../../../components/inventory/wastages/generalWastageComponent";
export default function DepartmentWastageAnalytics() {
   const departmentId = useRouter().query.id;
   return (
      <DepartmentInventoryLayout>
         <InventoryWastages departmentid={departmentId} />
      </DepartmentInventoryLayout>
   )
}