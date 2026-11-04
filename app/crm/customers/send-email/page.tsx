'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Form, Spinner, Row, Col } from 'react-bootstrap';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { RiArrowLeftLine, RiMailLine, RiTimeLine, RiMailSendLine } from '@remixicon/react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { customPost, customFetch } from '../../../../components/Auth/customFetch';

// Dynamically import MARKDOWN_EDITOR to avoid SSR issues
const MARKDOWN_EDITOR = dynamic(() => import('../../../../components/accessories/markdownEditor'), {
     ssr: false,
     loading: () => <div className="d-flex justify-content-center p-3"><Spinner animation="border" size="sm" /></div>
});
;

interface EmailFormData {
     subject: string;
     message: string;
     recipientEmail?: string;
}

const schema = yup.object().shape({
     subject: yup.string().required('Subject is required').min(3, 'Subject must be at least 3 characters'),
     recipientEmail: yup.string().email('Invalid email format').nullable(),
});

const SendEmailPage: React.FC = () => {
     const searchParams = useSearchParams();
     const patientid = searchParams?.get('patientid');
     const router = useRouter();

     const {
          register,
          handleSubmit,
          reset,
          formState: { errors },
     } = useForm<EmailFormData>({
          resolver: yupResolver(schema) as any,
     });

     const [isLoading, setIsLoading] = useState(false);
     const [patientData, setPatientData] = useState<any>(null);
     const [isLoadingPatient, setIsLoadingPatient] = useState(false);
     const [emailHistory, setEmailHistory] = useState<any[]>([]);
     const [isLoadingHistory, setIsLoadingHistory] = useState(false);
     const [messageContent, setMessageContent] = useState('');

     const loadedPatient = useRef<string|null>(null);
     const patientScope = useRef(patientid);
     patientScope.current = patientid;
     useEffect(() => {
          let active=true;
          loadedPatient.current=null;
          setPatientData(null);
          setEmailHistory([]);
          setMessageContent('');
          reset({subject:'',message:'',recipientEmail:''});
          if(!patientid)return;
          setIsLoadingPatient(true);
          setIsLoadingHistory(true);
          customFetch(`patients/${patientid}`).then(data=>{
               if(!active)return;
               if(!data||data.error||data.status===false)throw new Error('Unable to load patient');
               if(data.patientid!=null&&String(data.patientid)!==String(patientid))throw new Error('Patient identity mismatch');
               setPatientData(data);
               loadedPatient.current=patientid;
               reset({subject:'',message:'',recipientEmail:data.email||''});
          }).catch(()=>{if(active)toast.error('Failed to load patient information. Reload before sending.');}).finally(()=>{if(active)setIsLoadingPatient(false);});
          customFetch(`emails/history/${patientid}`).then(data=>{if(active)setEmailHistory(Array.isArray(data)?data:[]);}).catch(()=>{}).finally(()=>{if(active)setIsLoadingHistory(false);});
          return()=>{active=false;};
     }, [patientid,reset]);

     const submitEmail = async (data: EmailFormData) => {
          if (!patientid||loadedPatient.current!==patientid||isLoadingPatient||isLoading) {
               toast.error('Patient ID is required');
               return;
          }

          if (!messageContent || messageContent.trim().length < 10) {
               toast.error('Message is required and must be at least 10 characters');
               return;
          }

          setIsLoading(true);
          try {
               const emailData = {
                    patientid: parseInt(patientid),
                    subject: data.subject,
                    message: messageContent,
                    recipientEmail: data.recipientEmail || patientData?.email,
               };

               const response = await customPost('emails/send', 'POST', emailData);
               if(patientScope.current!==patientid)return;
               const { error, message } = response;

               if (error) {
                    toast.error(message || error);
               } else {
                    toast.success(message || 'Email sent successfully');
                    reset();
                    setMessageContent('');
               }
          } catch (error) {
               toast.error('Error sending email');
          } finally {
               setIsLoading(false);
          }
     };

     const handleMessageUpdate = (event: any, data: string) => {
          setMessageContent(data);
     };

     if (isLoadingPatient) {
          return (
               <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                    <Spinner animation="border" />
               </div>
          );
     }

     return (
          <>
               <div className="d-flex align-items-center gap-3 mb-4">
                    <Button
                         variant="outline-secondary"
                         size="sm"
                         onClick={() => router.back()}
                         className="d-flex align-items-center gap-2"
                    >
                         <RiArrowLeftLine size={16} />
                         Back
                    </Button>
                    <h4 className="mb-0">Send Email</h4>
               </div>

               {patientData && (
                    <div className="mb-4 p-3 border bg-white border-secondary-subtle rounded">
                         <h6 className="text-muted mb-2">Recipient Information</h6>
                         <div className="row">
                              <div className="col-md-6">
                                   <strong>{patientData.firstName} {patientData.lastName}</strong>
                              </div>
                              <div className="col-md-6">
                                   <small className="text-muted">Patient ID: {patientData.patientid}</small>
                              </div>
                         </div>
                         {patientData.email && (
                              <div className="mt-2">
                                   <small className="text-muted">Email: {patientData.email}</small>
                              </div>
                         )}
                    </div>
               )}

               <Row>
                    <Col md={6}>
                         <div className="border bg-white border-secondary-subtle rounded p-3">
                              <h5 className="mb-3 d-flex align-items-center gap-2">
                                   <RiMailLine size={20} />
                                   Email History
                              </h5>

                              {isLoadingHistory ? (
                                   <div className="d-flex justify-content-center py-4">
                                        <Spinner animation="border" size="sm" />
                                   </div>
                              ) : emailHistory.length > 0 ? (
                                   <div className="email-history-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                        {emailHistory.map((email, index) => (
                                             <div key={index} className="border-bottom pb-3 mb-3">
                                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                                       <strong className="text-truncate" style={{ maxWidth: '200px' }}>
                                                            {email.subject}
                                                       </strong>
                                                       <small className="text-muted d-flex align-items-center gap-1">
                                                            <RiTimeLine size={12} />
                                                            {new Date(email.sentAt).toLocaleDateString()}
                                                       </small>
                                                  </div>
                                                  <p className="mb-1 text-truncate" style={{ fontSize: '0.9rem' }}>
                                                       {email.message}
                                                  </p>
                                                  <small className="text-muted">
                                                       To: {email.recipientEmail}
                                                  </small>
                                             </div>
                                        ))}
                                   </div>
                              ) : (
                                   <div className="text-center py-4 text-muted">
                                        <RiMailLine size={48} className="mb-2 opacity-50" />
                                        <p>No emails sent yet</p>
                                   </div>
                              )}
                         </div>
                    </Col>

                    <Col md={6}>
                         <div className="border bg-white border-secondary-subtle rounded p-3">
                              <h5 className="mb-3 d-flex align-items-center gap-2">
                                   <RiMailSendLine size={20} />
                                   Compose Email
                              </h5>

                              <Form onSubmit={handleSubmit(submitEmail)}>
                                   <div className="form-row grid-30-70 mt-2">
                                        <label className="pls-label">Recipient Email*</label>
                                        <Form.Control
                                             type="email"
                                             {...register('recipientEmail')}
                                             isInvalid={!!errors.recipientEmail}
                                             placeholder="Enter recipient email address"
                                        />
                                        {errors.recipientEmail && (
                                             <div className="invalid-feedback d-block">{errors.recipientEmail.message}</div>
                                        )}
                                   </div>

                                   <div className="form-row rid-30-70  mt-3">
                                        <label className="pls-label">Subject*</label>
                                        <Form.Control
                                             type="text"
                                             {...register('subject')}
                                             isInvalid={!!errors.subject}
                                             placeholder="Enter email subject"
                                        />
                                        {errors.subject && (
                                             <div className="invalid-feedback d-block">{errors.subject.message}</div>
                                        )}
                                   </div>

                                   <div className="form-row mt-3">
                                        <label className="pls-label">Message*</label>
                                        <div className="mt-2">
                                             <MARKDOWN_EDITOR
                                                  height={300}
                                                  initialData={messageContent}
                                                  updatedata={handleMessageUpdate}
                                             />
                                        </div>
                                        {(!messageContent || messageContent.trim().length < 10) && (
                                             <div className="invalid-feedback d-block mt-1">
                                                  Message is required and must be at least 10 characters
                                             </div>
                                        )}
                                   </div>

                                   <div className="d-flex gap-2 mt-4">
                                        <Button
                                             type="submit"
                                             variant="success"
                                             className='btn-sm d-flex align-items-center gap-2'
                                             disabled={isLoading||isLoadingPatient||loadedPatient.current!==patientid}
                                        >
                                             {isLoading ? (
                                                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                             ) : (
                                                  <RiMailSendLine size={16} />
                                             )}
                                             {isLoading ? 'Sending...' : 'Send Email'}
                                        </Button>

                                        <Button
                                             type="button"
                                             variant="outline-secondary"
                                             className='btn-sm'
                                             onClick={() => {
                                                  reset();
                                                  setMessageContent('');
                                             }}
                                             disabled={isLoading||isLoadingPatient||loadedPatient.current!==patientid}
                                        >
                                             Clear
                                        </Button>
                                   </div>
                              </Form>
                         </div>
                    </Col>
               </Row>
          </>
     );
};

export default SendEmailPage;