import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { customFetch } from '../components/Auth/customFetch';

const PrintOutComponent = () => {
     const [loading, setLoading] = useState(false);
     const [response, setResponse] = useState(null);
     const [error, setError] = useState(null);

     const searchParams = useSearchParams();
     const testid = searchParams.get('testid');
     const billingid = searchParams.get('csvid');
     const ascensionid = searchParams.get('ascensionId');
     const test = searchParams.get('testname');
     const patientid = searchParams.get('ptid');

     useEffect(() => {
          const fetchResultData = async () => {
               if (ascensionid && testid && billingid && patientid && test) {
                    setLoading(true);
                    setError(null);
                    const url_destination_endpoint = `result/printout/ascension/getResult?csvid=${billingid}&ptid=${patientid}&target=70,50&ascensionId=${ascensionid}&testname=${test}&testid=${testid}`;
                    try {
                         const resultdata = await customFetch(url_destination_endpoint);
                         if (resultdata) {
                              await sendData(resultdata);
                         }
                    } catch (error) {
                         setError('Error fetching result data.');
                         console.error('Error:', error);
                    } finally {
                         setLoading(false);
                    }
               }
          };

          fetchResultData();
     }, [ascensionid, testid, billingid, patientid, test]);

     const sendData = async (resultdata) => {
          const data = {
               ...resultdata,
               is_password_encrypted: false,
               is_pdf: true,
               is_ultrasound: false,
               password: '',
               logourl: 'https://th.bing.com/th/id/OIP.pzQ2E2KxjUjzhh9YMn7ZrAHaD3?rs=1&pid=ImgDetMain',
          };

          setLoading(true);
          setError(null);

          try {
               const res = await fetch(`${process.env.PLS_PDF_GENERATOR}result/printout`, {
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify(data),
               });

               console.log(res)

               if (res.ok) {
                    const blob = await res.blob();
                    const fileURL = URL.createObjectURL(blob);
                    setResponse(fileURL);
               } else {
                    const err = await res.json();
                    setError(err.detail || 'Error generating the report.');
               }
          } catch (err) {
               setError(err.message);
          } finally {
               setLoading(false);
          }
     };

     if (loading) return <div>Loading...</div>;
     if (error) return <div style={{ color: 'red' }}>{error}</div>;

     return (
          <div className="container-fluid">
               {response ? (
                    <iframe
                         src={response}
                         width="100%"
                         allowFullScreen={true}
                         loading="lazy"
                         height={window.innerHeight+100}
                         title="Generated Report"
                    ></iframe>
               ) : (
                    <div>No report to display.</div>
               )}
          </div>
     );
};

export default PrintOutComponent;
