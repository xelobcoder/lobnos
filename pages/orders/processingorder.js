import { Suspense, useCallback, useEffect, useState } from "react";
import SidebarFrontPage from "../../components/frontpagesidebar";
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import ISLOADING from "../../components/isLoading";
import {  getSpecificOrder } from "../../components/Auth/customFetch";
import { useSearchParams } from "next/navigation";

export default function ProcessingOrder() {
  const [data, setData] = useState({});
  const id = useSearchParams().get('orderid');
  const [loading, setLoading] = useState(true);
  const order = useCallback(async function (id) { getSpecificOrder(id,setData,setLoading)} , []);
  
  useEffect(() => {
    if (id) order(id);
   }, [order,id]);


  return (
    <SettingsLayout sidebar={<SidebarFrontPage />}>
      {loading && <ISLOADING />}
      {!loading && (
        <>
          <div className="grid-50">
          <section className="mx-2">
          <h4 >Requested clinical test</h4>
            <div className="list-group">
            {
                (Object.keys(data).length > 0 && 'data' in data) && data?.data.map((item, index) => {
                    return (
                      <div key={index} className="d-flex list-group-item justify-content-between">
                        <span className="mb-1">{item.name}</span>
                        <span className="mb-1">{item.price}</span>
                      </div>
                  )
                   })
                 }
            </div>
          </section>
          <section>
            
          </section>
         </div>
        </>
      )}
    </SettingsLayout>
  )
}