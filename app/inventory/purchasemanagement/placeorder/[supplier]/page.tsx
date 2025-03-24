import StockOrderingComponentSupplier from '../../../../components/purchasemanagement/StockOrderingSupplier';

export default async function PurchaseInventoryItemBySupplier({ params }: {
    params: { supplier: number }
}) {
    const { supplier } = await params
    return (
        <div>
            <StockOrderingComponentSupplier supplierid={supplier} />
        </div>
    )
}
