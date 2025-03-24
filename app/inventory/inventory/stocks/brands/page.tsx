import StockBrandList from "../../../../components/inventoryTables/StocksBrandList";


export default async function StockBrandIndexPage({ searchParams }: {
    searchParams: {
        stockname: number,
        stockid: number
    }
}) {
    const { stockid, stockname } = await searchParams
    return (
        <StockBrandList id={stockid} stockname={stockname} />
    )
}