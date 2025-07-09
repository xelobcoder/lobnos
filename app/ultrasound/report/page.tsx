'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { customFetch } from '../../../components/Auth/customFetch';

interface UltrasoundData {
     csvid?: string;
     ptid?: string;
     ascensionId?: string;
     testname?: string;
     testid?: string;
     target?: string;
     isScan?: boolean;
     // Add more fields based on API response
     patientInfo?: any;
     reportData?: any;
     images?: any[];
}

export default function UltrasoundReport() {
     const searchParams = useSearchParams();
     const [data, setData] = useState<UltrasoundData | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [urlParams, setUrlParams] = useState<Record<string, string>>({});

     // Extract URL parameters
     useEffect(() => {
          const params: Record<string, string> = {};
          if (searchParams) {
               searchParams.forEach((value, key) => {
                    params[key] = value;
               });
          }
          setUrlParams(params);
     }, [searchParams]);

     // Fetch data from API
     useEffect(() => {
          const fetchData = async () => {
               try {
                    setLoading(true);
                    
                    // Get parameters from URL
                    const csvid = searchParams?.get('csvid');
                    const ptid = searchParams?.get('ptid');
                    const ascensionId = searchParams?.get('ascensionId');
                    const testname = searchParams?.get('testname');
                    const testid = searchParams?.get('testid');
                    const target = searchParams?.get('target');
                    const isScan = searchParams?.get('isScan') === 'true';


                    // Construct API URL from present params
                    const params = [
                        csvid ? `csvid=${encodeURIComponent(csvid)}` : null,
                        ptid ? `ptid=${encodeURIComponent(ptid)}` : null,
                        ascensionId ? `ascensionId=${encodeURIComponent(ascensionId)}` : null,
                        testname ? `testname=${encodeURIComponent(testname)}` : null,
                        testid ? `testid=${encodeURIComponent(testid)}` : null,
                        target ? `target=${encodeURIComponent(target)}` : null,
                        `isScan=${isScan}`
                    ].filter(Boolean).join('&');
                    const apiUrl = `result/printout/ascension/getResult${params ? `?${params}` : ''}`;
                    console.log('API URL:', apiUrl);

                    const result = await customFetch(apiUrl.toString());

                    
                    setData({
                         csvid,
                         ptid,
                         ascensionId,
                         testname,
                         testid,
                         target,
                         isScan,
                         ...result
                    });


                    console.log('Fetched data:', result);
               } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch data');
               } finally {
                    setLoading(false);
               }
          };

          fetchData();
     }, [searchParams]);

     if (loading) {
          return (
               <div className="container mx-auto p-6">
                    <div className="flex items-center justify-center min-h-[400px]">
                         <div className="text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                              <h2 className="text-xl font-semibold text-gray-700">Loading Ultrasound Report...</h2>
                              <p className="text-gray-500 mt-2">Please wait while we fetch your data</p>
                         </div>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="container mx-auto p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                         <div className="flex items-center">
                              <div className="flex-shrink-0">
                                   <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                   </svg>
                              </div>
                              <div className="ml-3">
                                   <h3 className="text-sm font-medium text-red-800">Error Loading Report</h3>
                                   <p className="text-sm text-red-700 mt-1">{error}</p>
                              </div>
                         </div>
                    </div>
               </div>
          );
     }



     // Helper: get main findings from records
     function getMainFinding(records: any[]) {
          if (!records || !records.length) return '';
          return records[0].value;
     }

     // Helper: Format date
     function formatDate(dateString?: string) {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', {
               year: 'numeric',
               month: 'short',
               day: '2-digit',
          });
     }

     // Helper: Decode HTML entities (for findings/comments)
     function decodeHtml(html: string = '') {
          if (typeof window === 'undefined') return html;
          const txt = document.createElement('textarea');
          txt.innerHTML = html;
          return txt.value;
     }

     // Extract patient and report info
     const patient = data?.patientInfo || {};
     const report = data?.reportData || {};
     const images = data?.images || [];

     return (
          <div className="bg-white min-h-screen py-8 px-2 print:p-0">
               <div className="max-w-3xl mx-auto border border-gray-300 rounded-lg shadow-lg p-8 print:shadow-none print:border-0 print:rounded-none bg-white relative">
                    {/* Header: Branding */}
                    <div className="flex items-center justify-between mb-8 border-b pb-4">
                         <div className="flex items-center space-x-4">
                              <img src="/frontpage/lab.jfif" alt="Company Logo" className="h-16 w-16 rounded-full border border-green-600" />
                              <div>
                                   <h1 className="text-2xl font-bold text-green-700 tracking-wide">Lobnos Diagnostics</h1>
                                   <p className="text-sm text-gray-600">Comprehensive Ultrasound & Laboratory Services</p>
                              </div>
                         </div>
                         <div className="text-right hidden print:block">
                              <span className="text-xs text-gray-400">Printed: {formatDate(new Date().toISOString())}</span>
                         </div>
                    </div>

                    {/* Patient & Test Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                         <div>
                              <div className="mb-1"><span className="font-semibold text-gray-700">Patient Name:</span> <span className="text-gray-800">{patient.name || patient.fullName || '-'}</span></div>
                              <div className="mb-1"><span className="font-semibold text-gray-700">Patient ID:</span> <span className="text-gray-800">{patient.ptid || data?.ptid || '-'}</span></div>
                              <div className="mb-1"><span className="font-semibold text-gray-700">Gender:</span> <span className="text-gray-800">{patient.gender || '-'}</span></div>
                              <div className="mb-1"><span className="font-semibold text-gray-700">Age:</span> <span className="text-gray-800">{patient.age || '-'}</span></div>
                              <div className="mb-1"><span className="font-semibold text-gray-700">Date of Birth:</span> <span className="text-gray-800">{patient.dob ? formatDate(patient.dob) : '-'}</span></div>
                         </div>
                         <div>
                              <div className="mb-1"><span className="font-semibold text-gray-700">Test Name:</span> <span className="text-gray-800">{data?.testname || report.testName || '-'}</span></div>
                              <div className="mb-1"><span className="font-semibold text-gray-700">Test ID:</span> <span className="text-gray-800">{data?.testid || '-'}</span></div>
                              <div className="mb-1"><span className="font-semibold text-gray-700">Date:</span> <span className="text-gray-800">{report.date ? formatDate(report.date) : '-'}</span></div>
                              <div className="mb-1"><span className="font-semibold text-gray-700">Referring Doctor:</span> <span className="text-gray-800">{report.refDoctor || '-'}</span></div>
                              <div className="mb-1"><span className="font-semibold text-gray-700">Accession #:</span> <span className="text-gray-800">{data?.ascensionId || '-'}</span></div>
                         </div>
                    </div>

                    {/* Report Body */}
                    <div className="mb-6">
                         <h2 className="text-lg font-semibold text-green-700 mb-2">Ultrasound Findings</h2>
                         <div className="prose prose-sm max-w-none text-gray-800 bg-gray-50 rounded p-4 border border-gray-100">
                              {report.findings ? (
                                   <div dangerouslySetInnerHTML={{ __html: decodeHtml(report.findings) }} />
                              ) : (
                                   <span className="text-gray-500">No findings available.</span>
                              )}
                         </div>
                    </div>

                    {/* Impression/Comments */}
                    <div className="mb-6">
                         <h2 className="text-lg font-semibold text-green-700 mb-2">Impression / Comments</h2>
                         <div className="prose prose-sm max-w-none text-gray-800 bg-gray-50 rounded p-4 border border-gray-100">
                              {report.impression || report.comments ? (
                                   <div dangerouslySetInnerHTML={{ __html: decodeHtml(report.impression || report.comments) }} />
                              ) : (
                                   <span className="text-gray-500">No impression or comments provided.</span>
                              )}
                         </div>
                    </div>

                    {/* Images if present */}
                    {images.length > 0 && (
                         <div className="mb-6">
                              <h2 className="text-lg font-semibold text-green-700 mb-2">Ultrasound Images</h2>
                              <div className="flex flex-wrap gap-4">
                                   {images.map((img, idx) => (
                                        <img
                                             key={idx}
                                             src={img.url || img}
                                             alt={`Ultrasound Image ${idx + 1}`}
                                             className="h-40 w-auto rounded border border-gray-200 shadow-sm"
                                        />
                                   ))}
                              </div>
                         </div>
                    )}

                    {/* Footer: Signature & Print */}
                    <div className="flex items-center justify-between mt-8 pt-4 border-t">
                         <div>
                              <div className="text-sm text-gray-600">Report generated by <span className="font-semibold text-green-700">Lobnos Diagnostics</span></div>
                              <div className="text-xs text-gray-400">For clinical use only. Not valid for legal purposes.</div>
                         </div>
                         <div className="text-right">
                              <button
                                   className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded shadow print:hidden transition"
                                   onClick={() => window.print()}
                              >
                                   Print Report
                              </button>
                              <div className="mt-2 text-xs text-gray-400 hidden print:block">Printed: {formatDate(new Date().toISOString())}</div>
                         </div>
                    </div>
               </div>
          </div>
     );
}