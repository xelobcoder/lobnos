import  { useEffect,useState } from 'react'
import EmailSidebarJSX from '../../../components/settingsComponents/EmailSidebar'
import { ErrorOutlineRounded, Send, Summarize } from '@mui/icons-material'
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView'
import { toast, ToastContainer } from 'react-toastify';
import ISLOADING from '../../../components/isLoading';
import { getEmailSummary } from '../../../components/EmailServices/util';
import EmailLogsBarChart from '../../../components/EmailServices/Components/EmailChart';
import { getDataAndUpdateState } from '../../../components/Auth/customFetch';
import EmailLogList from '../../../components/EmailServices/Components/EmailLogList';
import CardRacks from '../../../components/accessories/CardRacks';

export default function Analytics() {
  const defaultData = { total: "-", failed: "-", success: "-" };
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(defaultData);//[total,failed,sent]
  const [logs,setLogs] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [active, setActive] = useState(null);

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
              <CardRacks icon={<Summarize/>} header={'total'} activestate={active == 1} body={<h2 className='d-flex align-items-center mt-2'>{data?.total}</h2>} />
                <CardRacks activestate={active == 2} header={'Failed'} body={<h2 className='text-danger mt-2'>{ data?.failed}</h2>} icon={ <ErrorOutlineRounded /> } />
                <CardRacks header={'Sent'} activestate={active == 3} icon={<Send/>} body={ <h2 className='text-success mt-2'>{ data?.success}</h2>} />
              </div>
              <div className='mx-2'>
              <CardRacks activestate={false} header={'chart'} body={   <EmailLogsBarChart data={analyticsData} />} />
             </div>
              <h4 className='mx-2'>Recent Email logs</h4>
              <EmailLogList data={logs} />
            </>
          )}
      </MainSettingsLayoutView>
    </>
  )
}
