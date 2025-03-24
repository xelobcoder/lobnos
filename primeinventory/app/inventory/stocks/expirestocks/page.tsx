import GeneralExpiredStocksTable from '../../../../components/inventoryTables/GeneralExpiredStocksTable';



export default function InventoryMainExpiredStocks() {
   

    return (
        <div>
            <h4>General Expired Stocks List</h4>
            <GeneralExpiredStocksTable fetchUrl="stock/expirestocks"  />
        </div>
    );
}
