import { useEffect, useState } from "react";
import MainSettingsLayoutView from "../../../../components/settingsComponents/MainSettingsLayoutView";
import { customFetch, customPost } from "../../../../components/Auth/customFetch";
import { useRouter } from "next/navigation";
import Loader from "../../../../components/accessories/Loader";
import TableDisplay from "../../../../components/accessories/TableDisplay";

export default function TestListDisplay() {
   const [data, setData] = useState([]);
   const router = useRouter();
   const [isloading, setLoading] = useState(true);

   useEffect(() => {
      customFetch('testpanel/list/bulk')
         .then((response) => {
            setData(response?.data);
            setLoading(false);
         })
         .catch((err) => {
            setLoading(false);
            setData([]);
         })
   }, [])




   const deleteCustomTest = async (item) => {
      const { id } = item;
      if (!id) return;
      const confirmation = confirm(`Are you sure you want to delete this test?. This would delete all information associated with test`);
      if (confirmation) {
         const response = await customPost(`testpanel/list?testid=${id}`, 'DELETE', {});
         if (response.status == "success") {
            setLoading(true);
            setData((prev) => {
               const filteredResult = prev.filter((a, i) => a.id != id);
               return filteredResult;
            })
            setLoading(false);
         }
      };
   }

   const columns = [
      {
         Header: 'Name',
         accessor: 'name',
         Cell: ({ row, value }) => { return <span>{value} {row.original.shorttext ? `(${row.original.shorttext})` : ""} </span> }
      },
      {
         Header: 'Price',
         accessor: 'price',
      },
      {
         Header: 'sample qty',
         accessor: 'qty_required',
         Cell: ({ row, value }) => {
            return <div> {value} {row.original.unit}</div>
         }
      },
      {
         Header: 'Action',
         accessor: 'action',
         Cell: ({ row }) => {
            const { id } = row.original;
            return (
               <div>
                  <span onClick={(ev) => { router.push(`/settings/testpanel/testlist/${id}`) }} className="border-bottom  border-primary text-primary">edit test</span>
                  <span onClick={(ev) => { router.push(`/settings/testpanel/testlist/${id}/literature?litid=${id}&&testname=${row.original.name}`) }} className="mx-2 border-bottom  border-primary text-primary">Add Literature</span>
                  <span onClick={(ev) => { router.push(`/settings/testpanel/testlist/procedure/${id}`) }} className="border-bottom  border-primary text-primary mx-2">Add Manual</span>
                  {row.original.iscustom == 1 &&
                     <span className='border-danger border-bottom text-danger' onClick={(ev) => { deleteCustomTest(row.original) }}>Drop Test</span>
                  }
               </div>)
         }
      }
   ]

   const renderingView = () => {
      if (isloading) return <Loader />
      else {
         return (
            <section>
               <div className="d-flex justify-content-end mx-2">
                  <button onClick={(ev) => { router.push("/settings/testpanel/testlist/fieldcreator") }} className="btn btn-secondary btn-sm mx-2">
                     test field creator
                  </button>
                  <button onClick={(ev) => { router.push("/settings/testpanel/testlist/createcustomtest") }} className="btn btn-dark btn-sm text-capitalize">new test</button>
               </div>
               <div style={{ marginTop: '-30px' }}>
                  <TableDisplay filtering={true} initpageSize={100} showpage={false} column={columns} data={data} />
               </div>
            </section>
         )
      }
   }
   return (
      <MainSettingsLayoutView>
         {renderingView()}
      </MainSettingsLayoutView>
   )
}