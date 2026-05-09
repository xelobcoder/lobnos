import React from 'react';
import { ResultSettings } from '../ResultView/result-settings';

interface Record {
     id: number;
     testid: number;
     name: string;
     field: string;
     value: string;
     hasunits: number;
     units: string;
     plan: string;
     plain: string;
     ordering: number;
     textReference: string;
     upperlimit: number | null;
     lowerlimit: number | null;
     category: string;
     options: string;
     undercategory: number;
     categoryid: number | null;
     ascensionid: number;
     billingid: number;
     patientid: number;
     originalvalue: string;
     created_on: string;
     updated_on: string;
     employeeid: number;
     entrymode: string | null;
     fieldid: number;
}

interface ResultViewHtmlGeneratorUltrasoundProps {
     resultsettings: ResultSettings;
     test: string;
     records: Record[];
     isResultView?: boolean;
     resultentry?: any;
     testInfo?: {
          reportitle?: string;
     };
     images?: any[];
}

export default function ResultViewHtmlGeneratorUltrasound({
     resultsettings,
     test,
     records,
     resultentry,
     testInfo,
     isResultView = true,
     images = []
}: ResultViewHtmlGeneratorUltrasoundProps) {
     if (!Array.isArray(records) || records.length === 0) {
          return (
               <div className="ultrasound-content">

               </div>
          );
     }

     // Helper function to decode HTML entities
     const decodeHtml = (html: string = '') => {
          if (typeof window === 'undefined') return html;
          const txt = document.createElement('textarea');
          txt.innerHTML = html;
          return txt.value;
     };

     const getImageUrl = (filename: string) => {
          if (!filename) return '';
          if (filename.startsWith('http')) return filename;

          const baseUrl = process.env.NODE_ENV === 'development'
               ? process.env.DEVELOPMENT_BASEURL
               : process.env.PRODUCTION_BASEURL;

          return `${baseUrl}ultrasound/images/file/${filename}`;
     };

     return (
          <div className="ultrasound-content">
               <h5 className="text-uppercase ui text-center border-bottom border-2 border-light"
                    style={{
                         backgroundColor: resultsettings?.ultrasoundSettings?.headerBackgroundColor || resultsettings?.testnameBackgroundColor || 'royalblue',
                         color: resultsettings?.ultrasoundSettings?.headerTextColor || resultsettings?.testnameColor || 'black',
                         padding: '8px'
                    }}>
                    <span className="text-uppercase" style={{
                         fontSize: resultsettings?.ultrasoundSettings?.fontSize || resultsettings?.testnameFontSize || '14px',
                         fontFamily: resultsettings?.ultrasoundSettings?.fontFamily || resultsettings?.fontfamily || 'Arial'
                    }}>
                         {testInfo && testInfo?.reportitle ? testInfo?.reportitle : test}
                    </span>
               </h5>

               <div className="mt-3" style={{
                    fontFamily: resultsettings?.ultrasoundSettings?.contentFontFamily || 'Times New Roman',
                    fontSize: resultsettings?.ultrasoundSettings?.contentFontSize || resultsettings.testBody.fontSize || '14px',
                    color: resultsettings?.ultrasoundSettings?.color || resultsettings.testBody.color || 'black',
                    lineHeight: resultsettings?.ultrasoundSettings?.lineHeight || '1.5',
               }}>
                    {records.length === 1 ? (
                         <div dangerouslySetInnerHTML={{ __html: decodeHtml(records[0].value) }} />
                    ) : (
                         <div>
                              {records.map((record, index) => (
                                   <div key={index} style={{ marginBottom: '12px' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{record.field}:</div>
                                        <div style={{ marginLeft: '8px' }}>
                                             <div dangerouslySetInnerHTML={{ __html: decodeHtml(record.value) }} />
                                        </div>
                                   </div>
                              ))}
                         </div>
                    )}
               </div>

               {resultsettings?.ultrasoundSettings?.allowUltrasoundImages && images && images.length > 0 && (
                    <div className="mt-4 ultrasound-images-container no-browser-print">
                         <div className="row g-4">
                              {images.map((img, idx) => (
                                   <div key={idx} className="col-12">
                                        <div className="p-1 border rounded bg-white">
                                             <img
                                                  src={getImageUrl(img.filename)}
                                                  alt={`Ultrasound Scan ${idx + 1}`}
                                                  className="img-fluid w-100"
                                                  style={{
                                                       minHeight: '500px',
                                                       width: '100%',
                                                       objectFit: 'contain',
                                                       display: 'block'
                                                  }}
                                                  crossOrigin="anonymous"
                                             />
                                             <div className="small text-center mt-2 text-muted fw-bold">
                                                  Figure {idx + 1}: {img.filename}
                                             </div>
                                        </div>
                                   </div>
                              ))}
                         </div>
                    </div>
               )}


               {resultentry && (
                    <div className="mt-4 pt-3 border-top d-flex justify-content-end align-items-center">
                         <div className="fw-bold mb-2">Scanned By:      {resultentry}</div>
                    </div>
               )}

               {resultsettings?.ultrasoundSettings?.showDisclaimer && resultsettings?.ultrasoundSettings?.disclaimerText && (
                    <div style={{
                         fontSize: (resultsettings?.ultrasoundSettings?.fontSize || 14) - 2 + 'px',
                         fontFamily: resultsettings?.ultrasoundSettings?.fontFamily || 'Arial',
                         color: resultsettings?.ultrasoundSettings?.color || 'gray',
                         fontStyle: 'italic',
                    }}>
                         <div>
                              {resultsettings.ultrasoundSettings.disclaimerText}
                         </div>
                    </div>
               )}
          </div >
     );
}
