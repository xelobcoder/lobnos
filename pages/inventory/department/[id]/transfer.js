import DepartmentInventoryLayout from '../../../../components/inventory/departments/DepartmentInventoryLayout'

export default function TransferStockToDepartment() {
  return (
    <DepartmentInventoryLayout>
      <h4>Stocks awaiting department validation</h4>
      {renderer()}
    </DepartmentInventoryLayout>
  )
}
