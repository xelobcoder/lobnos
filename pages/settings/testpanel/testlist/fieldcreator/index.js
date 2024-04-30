import { useEffect, useState } from "react";
import MainSettingsLayoutView from "../../../../../components/settingsComponents/MainSettingsLayoutView";
import { customFetch } from "../../../../../components/Auth/customFetch";
import Loader from "../../../../../components/accessories/Loader";
import CreateTestFields from "../../../../../components/settingsComponents/FieldsCreation/createfieldsComponent";

export default function MultipleTestFieldCreator() {
     const [testlist, setTestList] = useState('');
     const [temp, setTemp] = useState([]);
     const [testname, setTestname] = useState("");
     const [loading, setLoading] = useState(true);
     const [active, setActive] = useState(null);

     useEffect(() => {
          customFetch('testpanel/list/bulk')
               .then((response) => {
                    const { statusCode, status, data } = response;
                    if (Array.isArray(data)) {
                         setTestList(data);
                         setTemp(data);
                    }
                    setLoading(false)
               }).catch((err) => {
                    setTestList([])
                    alert('something wrong occured');
                    setLoading(false);
               })

     }, [])

     const filtertest = (ev) => {
          setTestname(ev.target.value);
          if (testname.length > 1) {
               const filtered = testlist.filter((item, index) => item.name.toString().toLowerCase().startsWith(testname.toLowerCase()));
               if (filtered.length > 0) {
                    setTestList(filtered)
               } else {
                    setTestList([...temp]);
               }
          } else {
               setTestList([...temp])
          }
     }

     const testListrenderingView = () => {
          if (loading) return <Loader />
          else {
               if (testlist.length == 0) return <h5>No test Available</h5>
               else {
                    return (
                         <ul className="list-group mt-2 pointer">
                              {testlist.map((item, index) => <li className={`list-group-item ${active == item?.id ? 'bg-primary text-white' : ''}`} onClick={(ev) => { 
                                   setActive(item?.id)
                               }} key={index}>{item.name}</li>)}
                         </ul>
                    )
               }
          }
     }
     return (
          <MainSettingsLayoutView>
               <div style={{ display: 'grid', gridTemplateColumns: '20% auto', }}>
                    <aside className="bg-secondary p-2" style={{ height: '100vh', overflow: 'auto' }}>
                         <input onChange={(ev) => { filtertest(ev) }} type="text" className="custom-input" value={testname} />
                         {testListrenderingView()}
                    </aside>
                    <main>
                         <CreateTestFields testid={active} minimize={false} />
                    </main>
               </div>
          </MainSettingsLayoutView>
     )
}