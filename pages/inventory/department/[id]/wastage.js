import SettingsLayout from "../../../../components/settingsComponents/SettingsLayout"
import DepartmentLevelSidebar from "../../../../components/inventory/DepartmentLevelSidebar"
import InventoryWastages from "../../../../components/inventory/wastages/generalWastageComponent"
export default function DepartmentWastageAnalytics() {
   return (
      <SettingsLayout sidebar={<DepartmentLevelSidebar />}>
         <InventoryWastages departmentid={8}/>
      </SettingsLayout>
   )
}