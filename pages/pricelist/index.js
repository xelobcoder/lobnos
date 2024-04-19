import { useEffect, useState } from "react"
import { customFetch } from "../../components/Auth/customFetch";
import Loader from '../../components/accessories/Loader';
import TableDisplay from "../../components/accessories/TableDisplay";
import FrontDeskLayout from "../../components/Layout/FrontDeskLayout";

export default function PriceListCheck() {
     const [testlist, setTestList] = useState('');
     const [loading, setLoading] = useState(true);
     useEffect(() => {
          customFetch('testpanel/list')
               .then((response) => {
                    const { statusCode, status, data } = response;
                    if (Array.isArray(data)) {
                         setTestList(data)
                    }
                    setLoading(false)
               }).catch((err) => {
                    setTestList([])
                    alert('something wrong occured');
                    setLoading(false);
               })

     }, [])

     const columns = [
          { Header: 'name', accessor: 'name' },
          { Header: 'price', accessor: 'price' }
     ]

     const renderingView = () => {
          if (loading) return <Loader />
          else return <TableDisplay filtering={true} showpage={true} column={columns} data={testlist} />
     }
     return (
          <FrontDeskLayout>
               {renderingView()}
          </FrontDeskLayout>
     )
}