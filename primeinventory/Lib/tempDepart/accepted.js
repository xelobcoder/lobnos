import ReceivedPending from '../../../../components/inventory/ReceivedPending'
import DepartmentInventoryLayout from '../../../../components/inventory/departments/DepartmentInventoryLayout'
export default function DepartmentAcceptedCustomLevel() {
 
  return (
    <DepartmentInventoryLayout>
      <ReceivedPending type='approved' caption={'Approved Department stock request'} />
    </DepartmentInventoryLayout>
  )
}
