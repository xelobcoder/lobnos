import { useCallback, useEffect, useState } from "react";
import InventoryLayout from "../../../../components/inventory/InventoryLayout";
import CardRacks from '../../../../components/accessories/CardRacks';
import { currencyFormatter, customFetch, updatePagination } from "../../../../components/Auth/customFetch";
import Loader from "../../../../components/accessories/Loader";
import TableDisplay from "../../../../components/accessories/TableDisplay";
import Pagination from "../../../../components/accessories/pagination";
export default function InventoryWastages() {
   const [data, setData] = useState({});
   const [quarterlyData, setQuarterlyData] = useState([]);
   const [isloading, setLoading] = useState(true);
   const [active, setActive] = useState(null);
   const [loadpage, setloadpage] = useState(false);
   const [query, setQuery] = useState({ count: 10, page: 1 });
   const [loadingd, setLoadingD] = useState(false);


   const getWastageSummary = useCallback(async () => {
      try {
         setLoading(true);
         const getResponse = await customFetch(`inventory/wastages/summary`);
         const { status, result } = getResponse;
         status === "success" && setData(result);
         setLoading(false);
      } catch (err) {
         setData({});
         setLoading(false);
      }
   }, []);


   useEffect(() => {
      getWastageSummary();
   }, [getWastageSummary])



   const loadQuarterlyData = useCallback(() => {
      const { count, page } = query;
      setLoadingD(true);
      customFetch(`inventory/wastages/data/quarters?quarters=${active}&&count=${count}&&page=${page}`)
         .then((data) => {
            data?.status === "success" && setQuarterlyData(data?.result);
            setLoadingD(false);
         })
         .catch((err) => {
            setLoadingD(false);
            setQuarterlyData([]);
         });
   }, [active, query])


   useEffect(() => {
      if (active) {
         loadQuarterlyData();
      }
   }, [active, loadQuarterlyData]);

   const columns = [
      { Header: 'name', accessor: 'name' },
      { Header: 'brand', accessor: 'brand' },
      { Header: 'batchnumber', accessor: 'batchnumber' },
      { Header: 'receivedOn', accessor: 'receiveddate', Cell: ({ row }) => <div>{new Date(row.original.receiveddate).toLocaleDateString()}</div> },
      { Header: 'expirydate', accessor: 'expirydate', Cell: ({ row }) => <div>{new Date(row.original.expirydate).toLocaleDateString()}</div> },
      {
         Header: 'Consume on', accessor: 'debitdate',
         Cell: ({ row }) => <div>{new Date(row.original.debitdate).toLocaleDateString()}</div>
      },
      { Header: 'pricing method', accessor: 'pricing' },
      { Header: 'price', accessor: 'price' },
      { Header: 'expired qty', accessor: 'debitqty' },
      { Header: 'Amount', accessor: 'debitAmount' }
   ]




   const updateQuery = (pageValue) => {
      updatePagination(pageValue, setQuery, query);
   }

   return (
      <InventoryLayout>
         <div className="d-flex justify-content-between">
            <h5 className="mx-2">Genarel Store Loss (Wastages) Summary</h5>
            <button className="btn btn-light">view chart</button>
         </div>
         <div className="grid-30-30-30">
            <CardRacks
               header={<h6>1st Quarter</h6>}
               onClick={(ev) => { setActive(1) }}
               activestate={active === 1}
               body={isloading ? <Loader /> : <h3 className="mx-3">{
                  currencyFormatter.format(data?.firstQ)
               }</h3>}
            />
            <CardRacks
               activestate={active === 2}
               onClick={(ev) => { setActive(2) }}
               header={<h6>2nd Quarter</h6>}
               body={isloading ? <Loader /> : <h3 className="mx-3">{
                  currencyFormatter.format(data?.secondQ)
               }</h3>}
            />
            <CardRacks
               onClick={(ev) => { setActive(3) }}
               activestate={active === 3}
               header={<h6>3rd Quarter</h6>}
               body={isloading ? <Loader /> : <h3 className="mx-3">{
                  currencyFormatter.format(data?.thirdQ)
               }</h3>}
            />
         </div>
         <section>
            {loadingd && <Loader />}
            {active &&
               <div>
                  <TableDisplay showpage={false} column={columns} data={quarterlyData} />
                  <div className="d-flex justify-content-center mt-3">
                     <Pagination current={quarterlyData.length} updateFunction={updateQuery} load={setloadpage} />
                  </div>
               </div>}
         </section>
      </InventoryLayout>
   )
}