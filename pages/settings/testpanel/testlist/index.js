import { useEffect, useState } from "react";
import MainSettingsLayoutView from "../../../../components/settingsComponents/MainSettingsLayoutView";
import { customFetch } from "../../../../components/Auth/customFetch";
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

   const columns = [
      {
         Header: 'Name',
         accessor: 'name',
      },
      {
         Header: 'Category',
         accessor: 'category',
      },
      {
         Header: 'Price',
         accessor: 'price',
      },
      {
         Header: 'Unit',
         accessor: 'unit',
      },
      {
         Header: 'sample qty',
         accessor: 'qty_required',
      },
      {
         Header: 'Action',
         accessor: 'action',
         Cell: ({ row }) => {
            const { id } = row.original;
            return (
               <div>
                  <span onClick={(ev) => { router.push(`/settings/testpanel/testlist/${id}`) }} className="border-bottom  border-primary text-primary">edit test</span><span onClick={(ev) => { router.push(`/settings/testpanel/testlist/procedure/${id}`) }} className="border-bottom  border-primary text-primary mx-2">Add Manual</span>
               </div>)
         }
      }
   ]

   const renderingView = () => {
      if (isloading) return <Loader />
      else {
         return (
            <TableDisplay filtering={true} initpageSize={100} showpage={false} column={columns} data={data} />
         )
      }
   }
   return (
      <MainSettingsLayoutView>
         {renderingView()}
      </MainSettingsLayoutView>
   )
}