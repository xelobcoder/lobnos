"use client"
import { useEffect, useState } from "react"
import { customFetch } from "../../../components/Auth/customFetch";
import Loader from '../../../components/accessories/Loader';
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { RiAddBoxFill, RiDownloadLine } from "@remixicon/react";
import { useRouter } from 'next/navigation'
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import { roleAllowed } from "../../../components/Auth/roles";
import { priceListReport } from '../../../lib/priceListReport';


export default function PriceListCheck() {
     const [testlist, setTestList] = useState([]);
     const [loading, setLoading] = useState(true);
     const [downloading, setDownloading] = useState(false);
     const [downloadError, setDownloadError] = useState('');
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const userRole = applicationsettings?.user?.role?.toLowerCase();
     const canDownload = roleAllowed(userRole, ['admin', 'manager']);
     const checkoutLink = `/billing/patientid/checkout/multi?ispricingcheckout=1`

     useEffect(() => {
          customFetch('testpanel/list/bulk/billing')
               .then((response) => {
                    const { statusCode, status, data } = response;
                    if (Array.isArray(data) && data.length > 0) {
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
          { Header: 'Test ID', accessor: "testid" },
          { Header: 'Name', accessor: 'name' },
          { Header: 'Price', accessor: 'discountedValue' }
     ]

     const handleDownloadPriceList = async () => {
          if (!canDownload || downloading || !testlist.length) return;
          setDownloading(true);
          setDownloadError('');
          try {
               const { exportReportPdf } = await import('../../../components/reports/reportPdf');
               await exportReportPdf(priceListReport(testlist));
          } catch {
               setDownloadError('Unable to generate the price list PDF. Please try again.');
          } finally {
               setDownloading(false);
          }
     };

     if (loading) return <Loader />
     return (
          <div>
               <div className="d-flex justify-content-end gap-2 mb-2">
                    {canDownload && (
                         <button
                              onClick={handleDownloadPriceList}
                              disabled={downloading || testlist.length === 0}
                              className="btn btn-outline-secondary"
                         >
                              <RiDownloadLine size={16} className="me-1" />
                              {downloading ? 'Preparing PDF…' : 'Download Price List (PDF)'}
                         </button>
                    )}
                    <button onClick={(ev) => { router.push(checkoutLink) }} className="btn btn-primary">
                         <RiAddBoxFill />   checkout pricing
                    </button>
               </div>
               {downloadError && <div className="alert alert-danger" role="alert">{downloadError}</div>}
               <PrimeTable
                    filtering={true}
                    handleSeverSideProcessing={null}
                    serverSideFiltering={false}
                    column={columns}
                    data={testlist}
               />
          </div>
     )
}