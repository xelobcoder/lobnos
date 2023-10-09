import { useEffect, useState} from "react";
import { customFetch} from '../../components/Auth/customFetch';
import PendingTableSample from "../../components/samples/pendingTable";
import SECOND_NO_DATA from "../../components/accessories/secondNodata";
import { Error } from "@mui/icons-material";
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import SidebarFrontPage from "../../components/frontpagesidebar";

export default function SAMPLE_ASSESSMENT() {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [completed, setCompleted] = useState(false);



  const fetchInitialData = async function () {
    const response = await customFetch('sample');
    setData(response || [])
  }

  useEffect(() => { fetchInitialData() }, [])


  useEffect(() => {
    completed ? refresh() : null;
  }, [completed])

  // handleModal message 


  const removeClient = async function (target) {
    const filteredData = data.filter((item, index) => { return item.BILLINGID != target });
    setData(filteredData);
  }

  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        <div className="container-fluid">
          <div>
            <div className="p-2">
              <div style={{ display: 'grid', gridTemplateColumns: '80% auto', gridGap: '10px' }}>
                <div className='alert alert-info p-4'>
                  <strong>Note:</strong> Please check the sample list before accepting or rejecting the sample.
                  If pending count is greater than 0 and the sample list is empty please contact the lab admin, it means the sample was not collected or received.
                  kindly update that at the phelobotomy unit to proceed further.  At all time ,verify the pending count is equal to the sample list count
                </div>
                <button className="btn btn-danger mb-3 text-capitalize">
                  <Error fontSize="large" />
                  view rejected samples
                </button>
              </div>
              <div className="list-group">
                {data.length == 0
                  ?
                  <SECOND_NO_DATA message={'NO SAMPLE COLLECTED FOR VALIDATION'} />
                  :
                  <PendingTableSample
                    data={data}
                    setShow={setShow}
                    removeClient={removeClient}
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



