import { useEffect, useState} from "react";
import {  getDataAndUpdateState} from '../../components/Auth/customFetch';
import PendingTableSample from "../../components/samples/pendingTable";
import SECOND_NO_DATA from "../../components/accessories/secondNodata";
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import LabSideBarComponents from "../../components/operations/labSideBarComponents";

export default function SAMPLE_ASSESSMENT() {
  const [data, setData] = useState([]);

  const fetchInitialData = async function () { getDataAndUpdateState(setData, 'sample') }

  useEffect(() => { fetchInitialData() }, [])

  const removeClientFromList=(id)=>{
   setTimeout(() => {
    setData((prev)=>{
      return prev.filter((item)=>item.billingid !== id)
    })
   }, 3000);
  }
  

  return (
    <>
      <SettingsLayout sidebar={<LabSideBarComponents />}>
        <div className="container-fluid">
          <div>
            <div className="p-2">
              <div>
                <div className='alert alert-info p-2 alert-dismissible '>
                  <strong>Note:</strong> Please check the sample before validating. click on assess button to view the sample.
                </div>
              </div>
              <div className="list-group">
                {data.length == 0
                  ?
                  <SECOND_NO_DATA message={'NO SAMPLE COLLECTED FOR VALIDATION'} />
                  :
                  <PendingTableSample
                    data={data} removeClient={removeClientFromList}
                  />
                }
              </div>
            </div>
          </div>
        </div>
      </SettingsLayout>
    </>
  );
}



