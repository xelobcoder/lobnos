import  { useEffect,useState } from 'react'
import EmailSidebarJSX from '../../../components/settingsComponents/EmailSidebar'
import { ErrorOutlineRounded, Send } from '@mui/icons-material'
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView'
import { toast, ToastContainer } from 'react-toastify';
import ISLOADING from '../../../components/isLoading';
import { getEmailSummary } from '../../../components/EmailServices/util';
import EmailLogsBarChart from '../../../components/EmailServices/Components/EmailChart';
import { getDataAndUpdateState } from '../../../components/Auth/customFetch';
import EmailLogList from '../../../components/EmailServices/Components/EmailLogList';

export default function Analytics() {
  const defaultData = { total: "-", failed: "-", success: "-" };
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(defaultData);//[total,failed,sent]
  const [logs,setLogs] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);

  useEffect(() => {
    getEmailSummary(setData, setLoading, toast);
    getDataAndUpdateState(setAnalyticsData, "email/summary/daily");
    getDataAndUpdateState(setLogs, "email/logs");
  }, []);

  return (
    <>
      <MainSettingsLayoutView sidebar={<EmailSidebarJSX />}>
        <ToastContainer/>
        {loading ? <ISLOADING /> : 
          (
            <>
              <div className="mx-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridGap:'20px' }}>
            <div className='card br-5  pointer'>
              <div className='card-header bg-dark text-white d-flex justify-content-between pointer'>
                <span> <Send /> Total</span>
              </div>
              <div className='card-body'>
                  <h2>{ data?.total}</h2>
              </div>
            </div>
            <div className='card br-5  pointer'>
              <div className='card-header  bg-dark text-white d-flex justify-content-between pointer'>
                <span> <ErrorOutlineRounded /> Failed </span>
              </div>
              <div className='card-body'>
                  <h2 className='text-danger'>{ data?.failed}</h2>
              </div>
            </div>
            <div className='card br-5  pointer'>
              <div className='card-header  bg-dark text-white d-flex justify-content-between'>
                <span> <Send />  sent</span>
              </div>
              <div className='card-body'>
                  <h2 className='text-success'>{ data?.success}</h2>
              </div>
            </div>
            </div>
            <h4 className='mx-2'>Recent Email logs</h4>
            <EmailLogList data={logs} />
            <h4 className='mx-2'>Chart</h4>
              <EmailLogsBarChart data={analyticsData} />
            </>
          )}
      </MainSettingsLayoutView>
    </>
  )
}
