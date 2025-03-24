import ReceivedPending from '../../../../components/inventory/ReceivedPending'
import DepartmentInventoryLayout from '../../../../components/inventory/departments/DepartmentInventoryLayout'
export default function DepartmentPendingCustom() {

  return (
    <DepartmentInventoryLayout>
      <ReceivedPending caption={'Department stock request pending approval'} />
    </DepartmentInventoryLayout>
  )
}
